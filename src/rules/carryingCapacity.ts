import { normalizeSize, type SizeKey } from './attributeMods'

/**
 * Tabela oficial de capacidade de carga (leve/média/pesada, em kg) por
 * força, para uma criatura de tamanho Médio, força 1 a 20.
 */
const BASE_TABLE_BY_STRENGTH: Record<number, [number, number, number]> = {
  1: [3, 6, 10],
  2: [6, 13, 20],
  3: [10, 20, 30],
  4: [13, 26, 40],
  5: [16, 33, 50],
  6: [20, 40, 60],
  7: [23, 46, 70],
  8: [26, 53, 80],
  9: [30, 60, 90],
  10: [33, 66, 100],
  11: [38, 76, 115],
  12: [43, 86, 130],
  13: [50, 100, 150],
  14: [58, 116, 175],
  15: [66, 133, 200],
  16: [76, 153, 230],
  17: [86, 173, 260],
  18: [100, 200, 300],
  19: [116, 233, 350],
  20: [133, 266, 400],
}

/** Ajuste de capacidade de carga por tamanho, relativo a Médio (×1). */
const SIZE_CARRY_MULTIPLIER: Record<SizeKey, number> = {
  MINUSCULO: 1 / 8,
  MINIMO: 1 / 4,
  MIUDO: 1 / 2,
  PEQUENO: 3 / 4,
  MEDIO: 1,
  GRANDE: 2,
  ENORME: 4,
  IMENSO: 8,
  COLOSSAL: 16,
}

/** Extrapolação oficial: força acima de 20 multiplica por 4 a cada +10. */
function baseLoadForStrength(forca: number): [number, number, number] {
  const forcaValida = Math.max(1, Math.floor(forca))
  if (forcaValida <= 20) return BASE_TABLE_BY_STRENGTH[forcaValida]
  const [leve, media, pesada] = baseLoadForStrength(forcaValida - 10)
  return [leve * 4, media * 4, pesada * 4]
}

export function carryingCapacity(input: { forca: number; tamanho: string }): {
  leve: number
  media: number
  pesada: number
} {
  const multiplicador = SIZE_CARRY_MULTIPLIER[normalizeSize(input.tamanho) ?? 'MEDIO']
  const [leve, media, pesada] = baseLoadForStrength(input.forca)
  return {
    leve: leve * multiplicador,
    media: media * multiplicador,
    pesada: pesada * multiplicador,
  }
}

export function heavyLoadMultiples(cargaPesada: number): {
  ergerSobreCabeca: number
  ergerDoChao: number
  empurrarOuArrastar: number
} {
  return {
    ergerSobreCabeca: cargaPesada,
    ergerDoChao: cargaPesada * 2,
    empurrarOuArrastar: cargaPesada * 5,
  }
}
