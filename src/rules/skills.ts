/** Total de perícia de Pathfinder 1ª edição. */

export function skillTotal(input: {
  graduacoes: number
  atributoMod: number
  periciaDeClasse: boolean
  outros: number
}): number {
  const treinada = input.graduacoes > 0 && input.periciaDeClasse
  return input.graduacoes + input.atributoMod + (treinada ? 3 : 0) + input.outros
}
