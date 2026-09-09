import { useEffect, useMemo, useState } from 'react'
import type { FichaGeral } from '../../api/types'
import type { CompendioRaca } from '../../api/compendioTypes'
import { useSectionAutosave } from '../../sheet/useSectionAutosave'
import { SaveStatusBadge } from '../../sheet/SaveStatusBadge'
import { Seal, SectionTitle } from '../../sheet/theme'
import { ABILIDADES, fmt, mod, type AbilidadeKey } from '../../sheet/abilityMod'
import {
  POOLS_DE_PONTOS,
  PONTUACAO_MAXIMA,
  PONTUACAO_MINIMA,
  PONTUACAO_PADRAO,
  custoDaPontuacao,
  custoTotal,
} from '../../rules/srd/pointBuy'

export function AtributosStep({
  fichaId,
  geral,
  raca,
  onChange,
  onSaved,
  onConcluir,
}: {
  fichaId: string
  geral: FichaGeral
  raca: CompendioRaca | undefined
  onChange?: (geral: FichaGeral) => void
  onSaved?: (geral: FichaGeral) => void
  onConcluir: () => void
}) {
  const ajusteFixoRaca = (raca?.ajustes_atributo ?? {}) as Partial<Record<AbilidadeKey, number>>
  const temEscolhaRacial = Boolean(raca) && Object.keys(ajusteFixoRaca).length === 0
  const [bonusRacialEscolhido, setBonusRacialEscolhido] = useState<AbilidadeKey | null>(null)

  const ajuste = (chave: AbilidadeKey) => {
    if (temEscolhaRacial) return bonusRacialEscolhido === chave ? 2 : 0
    return ajusteFixoRaca[chave] ?? 0
  }

  const [poolId, setPoolId] = useState(POOLS_DE_PONTOS[1].id)
  const pool = POOLS_DE_PONTOS.find((p) => p.id === poolId) ?? POOLS_DE_PONTOS[1]

  const [base, setBase] = useState<Record<AbilidadeKey, number>>(() => {
    const inicial = {} as Record<AbilidadeKey, number>
    for (const a of ABILIDADES) {
      const valorFinal = (geral[a.key] as number) || PONTUACAO_PADRAO
      inicial[a.key] = Math.min(PONTUACAO_MAXIMA, Math.max(PONTUACAO_MINIMA, valorFinal - (ajusteFixoRaca[a.key] ?? 0)))
    }
    return inicial
  })

  const { value, updateField, status, retry, flush } = useSectionAutosave<FichaGeral>(
    fichaId,
    'geral',
    geral,
    undefined,
    onSaved,
  )
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    onChange?.(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  async function confirmar() {
    setConfirmando(true)
    try {
      await flush()
      onConcluir()
    } catch {
      // erro já sinalizado pelo SaveStatusBadge; permanece na etapa
    } finally {
      setConfirmando(false)
    }
  }

  const gasto = useMemo(() => custoTotal(base), [base])
  const restante = pool.pontos - gasto

  function ajustarBase(chave: AbilidadeKey, novoValor: number) {
    const dentroDosLimites = Math.min(PONTUACAO_MAXIMA, Math.max(PONTUACAO_MINIMA, novoValor))
    const custoAtual = custoDaPontuacao(base[chave])
    const novoCusto = custoDaPontuacao(dentroDosLimites)
    if (novoCusto - custoAtual > restante) return
    const novaBase = { ...base, [chave]: dentroDosLimites }
    setBase(novaBase)
    updateField(chave, dentroDosLimites + ajuste(chave))
  }

  function escolherBonusRacial(chave: AbilidadeKey) {
    setBonusRacialEscolhido(chave)
    for (const a of ABILIDADES) {
      const novoAjuste = a.key === chave ? 2 : 0
      updateField(a.key, base[a.key] + novoAjuste)
    }
  }

  return (
    <section aria-label="Atributos" className="wizard-step">
      <div className="section-header">
        <h2>Atributos</h2>
        <SaveStatusBadge status={status} onRetry={retry} />
      </div>

      {temEscolhaRacial && (
        <>
          <SectionTitle accent="gold">Bônus racial (+2 à escolha)</SectionTitle>
          <div className="wizard-pool-picker">
            {ABILIDADES.map((a) => (
              <button
                key={a.key}
                type="button"
                className="wizard-choice-card wizard-choice-card--compact"
                aria-pressed={bonusRacialEscolhido === a.key}
                onClick={() => escolherBonusRacial(a.key)}
              >
                {a.label}
              </button>
            ))}
          </div>
          {!bonusRacialEscolhido && <p className="hint">Escolha em qual atributo aplicar o +2 racial.</p>}
        </>
      )}

      <SectionTitle accent="gold">Compra de pontos</SectionTitle>
      <div className="wizard-pool-picker">
        {POOLS_DE_PONTOS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="wizard-choice-card wizard-choice-card--compact"
            aria-pressed={poolId === p.id}
            onClick={() => setPoolId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className={`wizard-points-remaining ${restante < 0 ? 'wizard-points-remaining--negativo' : ''}`}>
        {restante} de {pool.pontos} pontos restantes
      </p>

      <div className="seals-row">
        {ABILIDADES.map((a) => {
          const final = base[a.key] + ajuste(a.key)
          return (
            <div key={a.key} className="wizard-seal-com-controles">
              <Seal abbr={a.abbr} label={a.label} mod={fmt(mod(final))}>
                <span className="wizard-seal-final">{final}</span>
              </Seal>
              <div className="wizard-seal-botoes">
                <button type="button" onClick={() => ajustarBase(a.key, base[a.key] - 1)} aria-label={`Diminuir ${a.label}`}>
                  −
                </button>
                <span className="wizard-seal-base" title="Pontuação base, antes do ajuste racial">
                  base {base[a.key]}
                </span>
                <button type="button" onClick={() => ajustarBase(a.key, base[a.key] + 1)} aria-label={`Aumentar ${a.label}`}>
                  +
                </button>
              </div>
              {ajuste(a.key) !== 0 && (
                <span className="hint">
                  ajuste racial {ajuste(a.key) > 0 ? '+' : ''}
                  {ajuste(a.key)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="wizard-step-actions">
        <button
          type="button"
          className="add-btn"
          disabled={restante < 0 || (temEscolhaRacial && !bonusRacialEscolhido) || confirmando}
          onClick={confirmar}
        >
          {confirmando ? 'Salvando…' : 'Confirmar atributos'}
        </button>
        {restante < 0 && <span className="hint">Você gastou mais pontos do que o pool permite.</span>}
      </div>
    </section>
  )
}
