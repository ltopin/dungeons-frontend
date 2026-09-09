export interface WizardStepInfo<TStepId extends string = string> {
  id: TStepId
  titulo: string
}

/**
 * Barra lateral genérica de wizard (etapa atual, concluída, ou não aplicável),
 * com navegação livre entre etapas — reaproveitada pelo `character-creation-wizard`
 * e pelo wizard de criação de mundo (`ai-world-generation`). Nenhuma parte
 * deste componente conhece o domínio de cada wizard: os passos e o rótulo do
 * `<nav>` vêm sempre de fora.
 */
export function WizardSidebar<TStepId extends string>({
  ariaLabel,
  steps,
  current,
  concluidos,
  onSelect,
  naoSeAplica,
}: {
  ariaLabel: string
  steps: WizardStepInfo<TStepId>[]
  current: TStepId
  concluidos: Set<TStepId>
  onSelect: (step: TStepId) => void
  naoSeAplica?: Set<TStepId>
}) {
  return (
    <nav aria-label={ariaLabel} className="wizard-sidebar">
      <ol>
        {steps.map((info, index) => {
          const na = naoSeAplica?.has(info.id) ?? false
          const concluido = concluidos.has(info.id)
          const status = na ? 'na' : concluido ? 'concluido' : 'pendente'
          return (
            <li key={info.id}>
              <button
                type="button"
                className="wizard-step-item"
                aria-current={current === info.id}
                data-status={status}
                onClick={() => onSelect(info.id)}
              >
                <span className="wizard-step-index">{index + 1}</span>
                <span className="wizard-step-titulo">{info.titulo}</span>
                <span className="wizard-step-status" aria-hidden="true">
                  {na ? '—' : concluido ? '✓' : ''}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
