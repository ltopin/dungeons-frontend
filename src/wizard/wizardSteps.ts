import type { Ficha } from '../api/types'
import type { WizardStepInfo } from './WizardSidebar'

export type WizardStepId = 'raca-classe' | 'atributos' | 'pericias' | 'talentos' | 'magias' | 'equipamento' | 'revisao'

export const WIZARD_STEPS: WizardStepInfo<WizardStepId>[] = [
  { id: 'raca-classe', titulo: 'Raça e Classe' },
  { id: 'atributos', titulo: 'Atributos' },
  { id: 'pericias', titulo: 'Perícias' },
  { id: 'talentos', titulo: 'Talentos' },
  { id: 'magias', titulo: 'Magias' },
  { id: 'equipamento', titulo: 'Equipamento' },
  { id: 'revisao', titulo: 'Revisão' },
]

/**
 * Uma ficha recém-criada pelo backend ao entrar na campanha vem com Geral em
 * branco — é o sinal (sem precisar de um campo dedicado na API) de que o
 * jogador ainda não passou pela Trilha de Criação de Personagem.
 */
export function fichaAindaNaoIniciada(ficha: Pick<Ficha, 'geral'>): boolean {
  // A API pode retornar null (não string vazia) para campos de texto ainda não preenchidos.
  const vazio = (valor: string | null | undefined) => !(valor ?? '').trim()
  return vazio(ficha.geral.nomePersonagem) && vazio(ficha.geral.classe) && vazio(ficha.geral.raca)
}
