export type ProgressaoBab = 'boa' | 'media' | 'ruim'
export type ProgressaoSalva = 'boa' | 'ruim'

/** BAB no 1º nível, pela progressão da classe (boa=+1, média/ruim=+0). */
export function babNoNivel1(progressao: ProgressaoBab): number {
  return progressao === 'boa' ? 1 : 0
}

/** Base do teste de resistência no 1º nível, antes do modificador de atributo (boa=+2, ruim=+0). */
export function baseDeSalvaNoNivel1(progressao: ProgressaoSalva): number {
  return progressao === 'boa' ? 2 : 0
}

/** Máximo de graduações em uma perícia no 1º nível: 4, de classe ou não (o custo diferenciado já desincentiva perícia fora de classe). */
export function graduacoesMaximasNivel1(_deClasse: boolean): number {
  return 4
}
