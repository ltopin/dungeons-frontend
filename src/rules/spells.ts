/** CD de resistência de magia de Pathfinder 1ª edição. */

export function spellDC(input: { nivel: number; atributoMod: number; outros: number }): number {
  return 10 + input.nivel + input.atributoMod + input.outros
}
