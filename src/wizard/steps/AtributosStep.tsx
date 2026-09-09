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
import { dentroDaFaixaLivre, rolarPoolDeAtributos } from '../../rules/srd/rollAttributes'

type ModoAtributos = 'sortear' | 'compra' | 'manual'

const MODOS: { id: ModoAtributos; label: string }[] = [
  { id: 'sortear', label: 'Sortear' },
  { id: 'compra', label: 'Compra de pontos' },
  { id: 'manual', label: 'Manual' },
]

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

  const [modo, setModo] = useState<ModoAtributos>('compra')

  // Modo Compra de pontos
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

  // Modo Manual
  const [manualBase, setManualBase] = useState<Record<AbilidadeKey, number>>(() => {
    const inicial = {} as Record<AbilidadeKey, number>
    for (const a of ABILIDADES) {
      const valorFinal = (geral[a.key] as number) || PONTUACAO_PADRAO
      inicial[a.key] = Math.min(18, Math.max(3, valorFinal - (ajusteFixoRaca[a.key] ?? 0)))
    }
    return inicial
  })
  // Texto livre digitado por atributo no modo Manual — mantido separado de `manualBase` para que o
  // campo mostre exatamente o que o jogador está digitando, sem "voltar" ao último valor válido no
  // meio da digitação (ex: apagar e digitar "16" passaria por "1", que sozinho está fora da faixa).
  const [manualTexto, setManualTexto] = useState<Record<AbilidadeKey, string>>(() => {
    const inicial = {} as Record<AbilidadeKey, string>
    for (const a of ABILIDADES) inicial[a.key] = String(manualBase[a.key])
    return inicial
  })

  // Modo Sortear
  const [poolSorteio, setPoolSorteio] = useState<number[]>(() => rolarPoolDeAtributos())
  const [atribuicaoSorteio, setAtribuicaoSorteio] = useState<Partial<Record<AbilidadeKey, number>>>({})

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

  function ajustarManual(chave: AbilidadeKey, textoDigitado: string) {
    setManualTexto((prev) => ({ ...prev, [chave]: textoDigitado }))
    const novoValor = Number(textoDigitado)
    if (textoDigitado.trim() === '' || !Number.isFinite(novoValor) || !dentroDaFaixaLivre(novoValor)) return
    setManualBase((prev) => ({ ...prev, [chave]: novoValor }))
    updateField(chave, novoValor + ajuste(chave))
  }

  function indicesDisponiveisSorteio(chave: AbilidadeKey): number[] {
    const usados = new Set(
      ABILIDADES.filter((a) => a.key !== chave)
        .map((a) => atribuicaoSorteio[a.key])
        .filter((v): v is number => v != null),
    )
    return poolSorteio.map((_, i) => i).filter((i) => !usados.has(i))
  }

  function atribuirValorSorteado(chave: AbilidadeKey, indiceTexto: string) {
    const indice = indiceTexto === '' ? undefined : Number(indiceTexto)
    setAtribuicaoSorteio((prev) => ({ ...prev, [chave]: indice }))
    if (indice != null) {
      updateField(chave, poolSorteio[indice] + ajuste(chave))
    }
  }

  function rolarNovamente() {
    setPoolSorteio(rolarPoolDeAtributos())
    setAtribuicaoSorteio({})
  }

  function valorBaseAtual(chave: AbilidadeKey): number | null {
    if (modo === 'compra') return base[chave]
    if (modo === 'manual') return manualBase[chave]
    const indice = atribuicaoSorteio[chave]
    return indice != null ? poolSorteio[indice] : null
  }

  function escolherBonusRacial(chave: AbilidadeKey) {
    setBonusRacialEscolhido(chave)
    for (const a of ABILIDADES) {
      const novoAjuste = a.key === chave ? 2 : 0
      const valorBase = valorBaseAtual(a.key)
      if (valorBase != null) updateField(a.key, valorBase + novoAjuste)
    }
  }

  const seisDistribuidos = ABILIDADES.every((a) => atribuicaoSorteio[a.key] != null)
  const manualValido = ABILIDADES.every((a) => dentroDaFaixaLivre(manualBase[a.key]))
  const modoValido = modo === 'compra' ? restante >= 0 : modo === 'sortear' ? seisDistribuidos : manualValido

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

      <SectionTitle accent="gold">Modo de definição</SectionTitle>
      <div className="wizard-pool-picker">
        {MODOS.map((m) => (
          <button
            key={m.id}
            type="button"
            className="wizard-choice-card wizard-choice-card--compact"
            aria-pressed={modo === m.id}
            onClick={() => setModo(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {modo === 'compra' && (
        <>
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
        </>
      )}

      {modo === 'sortear' && (
        <>
          <SectionTitle accent="gold">Sortear</SectionTitle>
          <p className="hint">Distribua os seis valores sorteados entre os atributos abaixo.</p>
          <div className="wizard-step-actions">
            <button type="button" className="add-btn small" onClick={rolarNovamente}>
              Rolar novamente
            </button>
          </div>
        </>
      )}

      {modo === 'manual' && (
        <>
          <SectionTitle accent="gold">Manual</SectionTitle>
          <p className="hint">Digite livremente a pontuação de cada atributo (faixa 3–18).</p>
        </>
      )}

      <div className="seals-row">
        {ABILIDADES.map((a) => {
          const valorBase = valorBaseAtual(a.key)
          const final = (valorBase ?? 0) + ajuste(a.key)
          return (
            <div key={a.key} className="wizard-seal-com-controles">
              <Seal abbr={a.abbr} label={a.label} mod={fmt(mod(final))}>
                <span className="wizard-seal-final">{valorBase != null ? final : '—'}</span>
              </Seal>

              {modo === 'compra' && (
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
              )}

              {modo === 'manual' && (
                <div className="wizard-seal-botoes">
                  <input
                    type="number"
                    min={3}
                    max={18}
                    aria-label={`Pontuação de ${a.label}`}
                    value={manualTexto[a.key]}
                    onChange={(e) => ajustarManual(a.key, e.target.value)}
                  />
                </div>
              )}

              {modo === 'sortear' && (
                <div className="wizard-seal-botoes">
                  <select
                    aria-label={`Valor sorteado para ${a.label}`}
                    value={atribuicaoSorteio[a.key] ?? ''}
                    onChange={(e) => atribuirValorSorteado(a.key, e.target.value)}
                  >
                    <option value="">—</option>
                    {indicesDisponiveisSorteio(a.key).map((i) => (
                      <option key={i} value={i}>
                        {poolSorteio[i]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
          disabled={!modoValido || (temEscolhaRacial && !bonusRacialEscolhido) || confirmando}
          onClick={confirmar}
        >
          {confirmando ? 'Salvando…' : 'Confirmar atributos'}
        </button>
        {modo === 'compra' && restante < 0 && <span className="hint">Você gastou mais pontos do que o pool permite.</span>}
        {modo === 'sortear' && !seisDistribuidos && <span className="hint">Distribua os seis valores sorteados entre os atributos.</span>}
      </div>
    </section>
  )
}
