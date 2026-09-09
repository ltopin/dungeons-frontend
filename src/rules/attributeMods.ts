/**
 * Fórmulas de Pathfinder 1ª edição extraídas da ficha de origem
 * (`Ficha D&D 3.75.xls`). Funções puras, sem estado, sem dependência de
 * React ou dos tipos de `src/api/types.ts` — ver design.md, decisão 1.
 */

export function attributeModifier(valor: number): number {
  return Math.floor((valor - 10) / 2)
}

export const SIZE_ORDER = [
  'MINUSCULO',
  'MINIMO',
  'MIUDO',
  'PEQUENO',
  'MEDIO',
  'GRANDE',
  'ENORME',
  'IMENSO',
  'COLOSSAL',
] as const

export type SizeKey = (typeof SIZE_ORDER)[number]

const SIZE_MODIFIER: Record<SizeKey, number> = {
  MINUSCULO: 8,
  MINIMO: 4,
  MIUDO: 2,
  PEQUENO: 1,
  MEDIO: 0,
  GRANDE: -1,
  ENORME: -2,
  IMENSO: -4,
  COLOSSAL: -8,
}

const DIACRITICS_PATTERN = /[̀-ͯ]/g

export function normalizeSize(tamanho: string | null | undefined): SizeKey | null {
  const normalized = (tamanho ?? '')
    .normalize('NFD')
    .replace(DIACRITICS_PATTERN, '')
    .trim()
    .toUpperCase()
  return (SIZE_ORDER as readonly string[]).includes(normalized) ? (normalized as SizeKey) : null
}

export function sizeModifier(tamanho: string | null | undefined): number {
  const key = normalizeSize(tamanho)
  return key ? SIZE_MODIFIER[key] : 0
}
