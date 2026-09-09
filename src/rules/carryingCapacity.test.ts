import { describe, expect, it } from 'vitest'
import { carryingCapacity, heavyLoadMultiples } from './carryingCapacity'

describe('carryingCapacity', () => {
  it('força 10, tamanho Médio', () => {
    expect(carryingCapacity({ forca: 10, tamanho: 'MEDIO' })).toEqual({ leve: 33, media: 66, pesada: 100 })
  })

  it('força 20, tamanho Médio', () => {
    expect(carryingCapacity({ forca: 20, tamanho: 'MEDIO' })).toEqual({ leve: 133, media: 266, pesada: 400 })
  })

  it('força 21+ extrapola ×4 a cada +10 acima de 20 (força 30 = força 20 × 4)', () => {
    expect(carryingCapacity({ forca: 30, tamanho: 'MEDIO' })).toEqual({ leve: 532, media: 1064, pesada: 1600 })
  })

  it('ajusta por tamanho (Pequeno = ×3/4 de Médio)', () => {
    const medio = carryingCapacity({ forca: 10, tamanho: 'MEDIO' })
    const pequeno = carryingCapacity({ forca: 10, tamanho: 'PEQUENO' })
    expect(pequeno).toEqual({ leve: medio.leve * 0.75, media: medio.media * 0.75, pesada: medio.pesada * 0.75 })
  })

  it('as três faixas acompanham mudança de força automaticamente', () => {
    const antes = carryingCapacity({ forca: 10, tamanho: 'MEDIO' })
    const depois = carryingCapacity({ forca: 16, tamanho: 'MEDIO' })
    expect(depois.leve).toBeGreaterThan(antes.leve)
    expect(depois.media).toBeGreaterThan(antes.media)
    expect(depois.pesada).toBeGreaterThan(antes.pesada)
  })
})

describe('heavyLoadMultiples', () => {
  it('múltiplos derivados da carga pesada', () => {
    expect(heavyLoadMultiples(100)).toEqual({ ergerSobreCabeca: 100, ergerDoChao: 200, empurrarOuArrastar: 500 })
  })
})
