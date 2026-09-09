import type { WizardStepInfo } from '../wizard/WizardSidebar'

export type WorldWizardStepId = 'genero-tom' | 'nivel-poder' | 'restricoes' | 'grupo' | 'extras'

export const WORLD_WIZARD_STEPS: WizardStepInfo<WorldWizardStepId>[] = [
  { id: 'genero-tom', titulo: 'Gênero e Tom' },
  { id: 'nivel-poder', titulo: 'Nível de Poder' },
  { id: 'restricoes', titulo: 'Restrições' },
  { id: 'grupo', titulo: 'Tamanho do Grupo' },
  { id: 'extras', titulo: 'Extras' },
]

export function proximoPassoMundo(atual: WorldWizardStepId): WorldWizardStepId {
  const indice = WORLD_WIZARD_STEPS.findIndex((s) => s.id === atual)
  return WORLD_WIZARD_STEPS[Math.min(indice + 1, WORLD_WIZARD_STEPS.length - 1)].id
}
