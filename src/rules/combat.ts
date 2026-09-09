/**
 * CA, testes de resistência, bônus de ataque e manobra de combate
 * (CMB/CMD) de Pathfinder 1ª edição, extraídos da ficha de origem.
 */

export function armorClass(input: {
  armadura: number
  escudo: number
  destreza: number
  tamanho: number
  natural: number
  desvio: number
  outros: number
}): { total: number; toque: number; surpreendido: number } {
  const { armadura, escudo, destreza, tamanho, natural, desvio, outros } = input
  const total = 10 + armadura + escudo + destreza + tamanho + natural + desvio + outros
  const toque = 10 + destreza + tamanho + desvio + outros
  const surpreendido = destreza > 0 ? total - destreza : total
  return { total, toque, surpreendido }
}

export function savingThrow(input: { base: number; atributoMod: number; magico: number; outros: number }): number {
  return input.base + input.atributoMod + input.magico + input.outros
}

export function meleeAttackBonus(input: { bab: number; forcaMod: number; tamanhoMod: number; outros: number }): number {
  return input.bab + input.forcaMod + input.tamanhoMod + input.outros
}

export function rangedAttackBonus(input: {
  bab: number
  destrezaMod: number
  tamanhoMod: number
  outros: number
}): number {
  return input.bab + input.destrezaMod + input.tamanhoMod + input.outros
}

/**
 * Reaproveita o mesmo modificador de tamanho de CA (não a tabela oficial
 * invertida de manobra de combate) — ver design.md, decisão 4.
 */
export function cmb(input: { bab: number; forcaMod: number; tamanhoMod: number; outros: number }): number {
  return input.bab + input.forcaMod + input.tamanhoMod + input.outros
}

export function cmd(input: {
  bab: number
  forcaMod: number
  destrezaMod: number
  tamanhoMod: number
  outros: number
}): number {
  return 10 + input.bab + input.forcaMod + input.destrezaMod + input.tamanhoMod + input.outros
}
