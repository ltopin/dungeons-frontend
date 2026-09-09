import { useMemo, useState } from 'react'
import type { FichaGeral, FichaPericia } from '../../api/types'
import type { CompendioClasse, CompendioPericia, CompendioRaca } from '../../api/compendioTypes'
import { useListSection } from '../../sheet/useListSection'
import { SaveStatusBadge } from '../../sheet/SaveStatusBadge'
import { atributoScore } from '../../sheet/abilityMod'
import { attributeModifier } from '../../rules/attributeMods'
import { skillTotal } from '../../rules/skills'
import { graduacoesMaximasNivel1 } from '../../rules/classProgression'
import { custoDaGraduacao, pontosDePericiaNivel1 } from '../../rules/srd/skillPoints'
import { bonusPericiaNivel1 } from '../wizardValidation'

export function PericiasStep({
  fichaId,
  pericias,
  geral,
  raca,
  classe,
  catalogo,
  onItemsChange,
  onConcluir,
}: {
  fichaId: string
  pericias: FichaPericia[]
  geral: FichaGeral
  raca: CompendioRaca | undefined
  classe: CompendioClasse | undefined
  catalogo: CompendioPericia[]
  onItemsChange?: (pericias: FichaPericia[]) => void
  onConcluir: () => void
}) {
  const intMod = attributeModifier(geral.int)
  const bonusRacial = bonusPericiaNivel1(raca)
  const poolTotal = pontosDePericiaNivel1(classe?.pontos_pericia_por_nivel ?? 2, intMod, bonusRacial)

  const { items, addItem, updateItemField, statusById, retryItem, createError, flushAll } = useListSection<FichaPericia>(
    fichaId,
    'pericias',
    pericias,
    (pericia) => ({
      total: skillTotal({
        graduacoes: Number(pericia.graduacoes || 0),
        atributoMod: attributeModifier(atributoScore(geral, pericia.atributo)),
        periciaDeClasse: pericia.periciaDeClasse,
        outros: Number(pericia.outros || 0),
      }),
    }),
    onItemsChange,
  )

  const itemPorNome = useMemo(() => {
    const mapa = new Map<string, FichaPericia>()
    for (const item of items) {
      if (catalogo.some((p) => p.nome === item.nome)) mapa.set(item.nome, item)
    }
    return mapa
  }, [items, catalogo])

  const gasto = useMemo(() => {
    let total = 0
    for (const skill of catalogo) {
      const item = itemPorNome.get(skill.nome)
      if (!item) continue
      const deClasse = classe?.pericias_de_classe.includes(skill.nome) ?? false
      total += item.graduacoes * custoDaGraduacao(deClasse)
    }
    return total
  }, [itemPorNome, catalogo, classe])

  const restante = poolTotal - gasto

  const [confirmando, setConfirmando] = useState(false)

  async function confirmar() {
    setConfirmando(true)
    try {
      await flushAll()
      onConcluir()
    } catch {
      // erro já sinalizado pelo status por linha; permanece na etapa
    } finally {
      setConfirmando(false)
    }
  }

  function definirGraduacoes(skill: CompendioPericia, graduacoes: number) {
    const deClasse = classe?.pericias_de_classe.includes(skill.nome) ?? false
    const max = graduacoesMaximasNivel1(deClasse)
    const alvo = Math.max(0, Math.min(max, graduacoes))
    const existente = itemPorNome.get(skill.nome)
    const graduacoesAtuais = existente?.graduacoes ?? 0
    const custoAtual = graduacoesAtuais * custoDaGraduacao(deClasse)
    const novoCusto = alvo * custoDaGraduacao(deClasse)
    if (novoCusto - custoAtual > restante) return

    if (existente) {
      updateItemField(existente.id, 'graduacoes', alvo)
    } else if (alvo > 0) {
      addItem({
        nome: skill.nome,
        atributo: (skill.atributo ?? '').toUpperCase(),
        periciaDeClasse: deClasse,
        graduacoes: alvo,
        outros: 0,
      })
    }
  }

  return (
    <section aria-label="Perícias" className="wizard-step">
      <div className="section-header">
        <h2>Perícias</h2>
      </div>
      {createError && <p role="alert">{createError}</p>}
      {!classe && <p className="hint">Escolha uma classe na primeira etapa para calcular seus pontos de perícia.</p>}

      <p className={`wizard-points-remaining ${restante < 0 ? 'wizard-points-remaining--negativo' : ''}`}>
        {restante} de {poolTotal} pontos de perícia restantes
      </p>

      <ul className="wizard-skill-list">
        {catalogo.map((skill) => {
          const deClasse = classe?.pericias_de_classe.includes(skill.nome) ?? false
          const max = graduacoesMaximasNivel1(deClasse)
          const item = itemPorNome.get(skill.nome)
          const graduacoes = item?.graduacoes ?? 0
          return (
            <li key={skill.id} className="wizard-skill-row">
              <span className="wizard-skill-nome">
                {skill.nome}{' '}
                <span className="hint">
                  ({(skill.atributo ?? '—').toUpperCase()}
                  {deClasse ? ' · de classe' : ''})
                </span>
              </span>
              <div className="wizard-skill-controles">
                <button type="button" onClick={() => definirGraduacoes(skill, graduacoes - 1)} disabled={graduacoes <= 0}>
                  −
                </button>
                <span className="wizard-skill-graduacoes">{graduacoes}</span>
                <button
                  type="button"
                  onClick={() => definirGraduacoes(skill, graduacoes + 1)}
                  disabled={graduacoes >= max || custoDaGraduacao(deClasse) > restante}
                >
                  +
                </button>
                <span className="hint">máx {max}</span>
              </div>
              {item && <SaveStatusBadge status={statusById[item.id] ?? 'idle'} onRetry={() => retryItem(item.id)} />}
            </li>
          )
        })}
      </ul>

      <div className="wizard-step-actions">
        <button type="button" className="add-btn" disabled={restante < 0 || confirmando} onClick={confirmar}>
          {confirmando ? 'Salvando…' : 'Confirmar perícias'}
        </button>
      </div>
    </section>
  )
}
