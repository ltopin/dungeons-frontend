/**
 * Modos Sortear e Manual da etapa de Atributos da Trilha de Criação de
 * Personagem. Faixa 3–18, independente da faixa 7–18 de `pointBuy.ts` (que
 * é específica da tabela de custo do modo Compra de pontos).
 */
export const PONTUACAO_MINIMA_LIVRE = 3
export const PONTUACAO_MAXIMA_LIVRE = 18

function rolarD6(): number {
  return 1 + Math.floor(Math.random() * 6)
}

/** Rola 4d6 e descarta o menor valor, retornando a soma dos três maiores. */
export function rolar4d6DescartaMenor(): number {
  const dados = [rolarD6(), rolarD6(), rolarD6(), rolarD6()]
  dados.sort((a, b) => a - b)
  return dados[1] + dados[2] + dados[3]
}

/** Rola o pool de seis valores brutos do modo Sortear (4d6 descarta-menor cada). */
export function rolarPoolDeAtributos(): number[] {
  return Array.from({ length: 6 }, () => rolar4d6DescartaMenor())
}

/** Valida se a pontuação está dentro da faixa livre 3–18, usada por Sortear/Manual. */
export function dentroDaFaixaLivre(pontuacao: number): boolean {
  return pontuacao >= PONTUACAO_MINIMA_LIVRE && pontuacao <= PONTUACAO_MAXIMA_LIVRE
}
