export const ABILIDADES = [
  { key: 'str', label: 'Força', abbr: 'STR' },
  { key: 'dex', label: 'Destreza', abbr: 'DEX' },
  { key: 'con', label: 'Constituição', abbr: 'CON' },
  { key: 'int', label: 'Inteligência', abbr: 'INT' },
  { key: 'wis', label: 'Sabedoria', abbr: 'WIS' },
  { key: 'cha', label: 'Carisma', abbr: 'CHA' },
] as const

export type AbilidadeKey = (typeof ABILIDADES)[number]['key']

export const mod = (score: number) => Math.floor((Number(score || 10) - 10) / 2)
export const fmt = (m: number) => (m >= 0 ? `+${m}` : `${m}`)

/**
 * Resolve um valor de atributo salvo como texto livre (ex: "DEX", "dex",
 * "Destreza") contra os atributos de Geral, aceitando tanto a chave quanto
 * a abreviação, sem diferenciar caixa.
 */
export function atributoScore(geral: Record<AbilidadeKey, number>, atributo: string | null | undefined): number {
  const alvo = (atributo ?? '').trim().toLowerCase()
  const abilidade = ABILIDADES.find((a) => a.key === alvo || a.abbr.toLowerCase() === alvo)
  return abilidade ? geral[abilidade.key] : 10
}
