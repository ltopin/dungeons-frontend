import { WIZARD_STEPS, type WizardStepId } from './wizardSteps'

export function WizardSidebar({
  current,
  concluidos,
  onSelect,
  magiasNaoSeAplica,
}: {
  current: WizardStepId
  concluidos: Set<WizardStepId>
  onSelect: (step: WizardStepId) => void
  magiasNaoSeAplica: boolean
}) {
  return (
    <nav aria-label="Etapas da criação de personagem" className="wizard-sidebar">
      <ol>
        {WIZARD_STEPS.map((info, index) => {
          const naoSeAplica = info.id === 'magias' && magiasNaoSeAplica
          const concluido = concluidos.has(info.id)
          const status = naoSeAplica ? 'na' : concluido ? 'concluido' : 'pendente'
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
                  {naoSeAplica ? '—' : concluido ? '✓' : ''}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
