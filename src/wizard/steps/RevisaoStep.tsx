import type { Ficha } from '../../api/types'
import type { CompendioClasse, CompendioRaca } from '../../api/compendioTypes'
import { ABILIDADES, fmt, mod } from '../../sheet/abilityMod'

export function RevisaoStep({
  ficha,
  classe,
  raca,
  onConcluir,
}: {
  ficha: Ficha
  classe: CompendioClasse | undefined
  raca: CompendioRaca | undefined
  onConcluir: () => void
}) {
  return (
    <section aria-label="Revisão" className="wizard-step">
      <div className="section-header">
        <h2>Revisão</h2>
      </div>
      <p className="hint">
        Tudo já foi salvo automaticamente a cada etapa. Revise o resumo abaixo e, quando estiver pronto, siga para a
        ficha completa — você pode ajustar qualquer detalhe por lá depois.
      </p>

      <ul className="wizard-review-list">
        <li>
          <strong>{ficha.geral.nomePersonagem || 'Sem nome'}</strong> — {raca?.nome ?? (ficha.geral.raca || '—')} ·{' '}
          {classe?.nome ?? (ficha.geral.classe || '—')}
        </li>
        <li>
          Atributos:{' '}
          {ABILIDADES.map((a) => `${a.abbr} ${ficha.geral[a.key]} (${fmt(mod(ficha.geral[a.key] as number))})`).join(' · ')}
        </li>
        <li>{ficha.pericias.length} perícia(s) treinada(s)</li>
        <li>{ficha.talentos.length} talento(s)</li>
        {classe?.conjurador && <li>{ficha.magias.length} magia(s) inicial(is)</li>}
        <li>
          {ficha.itens.length} item(ns) · {ficha.moedas.gp} po restantes
        </li>
      </ul>

      <div className="wizard-step-actions">
        <button type="button" className="add-btn" onClick={onConcluir}>
          Concluir e ir para a ficha completa
        </button>
      </div>
    </section>
  )
}
