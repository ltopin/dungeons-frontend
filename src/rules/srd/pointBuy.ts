/**
 * Compra de pontos (point buy) de Pathfinder 1ª edição / D&D 3.5, usada na
 * etapa de Atributos da Trilha de Criação de Personagem. Custos da tabela
 * oficial de point buy, aplicados sobre a pontuação base (antes do ajuste
 * racial) — ver design.md da Trilha de Criação de Personagem.
 */
export const PONTUACAO_MINIMA = 7
export const PONTUACAO_MAXIMA = 18
export const PONTUACAO_PADRAO = 10

const CUSTO_POR_PONTUACAO: Record<number, number> = {
  7: -4,
  8: -2,
  9: -1,
  10: 0,
  11: 1,
  12: 2,
  13: 3,
  14: 5,
  15: 7,
  16: 10,
  17: 13,
  18: 17,
}

export interface PoolDePontos {
  id: string
  label: string
  pontos: number
}

export const POOLS_DE_PONTOS: PoolDePontos[] = [
  { id: 'baixa', label: 'Baixa fantasia (10 pontos)', pontos: 10 },
  { id: 'padrao', label: 'Padrão (15 pontos)', pontos: 15 },
  { id: 'heroica', label: 'Heroica (20 pontos)', pontos: 20 },
  { id: 'epica', label: 'Épica (25 pontos)', pontos: 25 },
]

export function custoDaPontuacao(pontuacao: number): number {
  const arredondada = Math.round(pontuacao)
  const dentroDosLimites = Math.min(PONTUACAO_MAXIMA, Math.max(PONTUACAO_MINIMA, arredondada))
  return CUSTO_POR_PONTUACAO[dentroDosLimites]
}

export function custoTotal<K extends string>(pontuacoes: Record<K, number>): number {
  return Object.values<number>(pontuacoes).reduce((soma, p) => soma + custoDaPontuacao(p), 0)
}
