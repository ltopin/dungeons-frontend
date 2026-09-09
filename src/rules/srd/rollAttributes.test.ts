import { describe, expect, it } from 'vitest'
import {
  PONTUACAO_MAXIMA_LIVRE,
  PONTUACAO_MINIMA_LIVRE,
  dentroDaFaixaLivre,
  rolar4d6DescartaMenor,
  rolarPoolDeAtributos,
} from './rollAttributes'

describe('rolar4d6DescartaMenor', () => {
  it('retorna um valor entre 3 e 18', () => {
    for (let i = 0; i < 200; i++) {
      const valor = rolar4d6DescartaMenor()
      expect(valor).toBeGreaterThanOrEqual(3)
      expect(valor).toBeLessThanOrEqual(18)
    }
  })

  it('nunca é menor que a soma dos três maiores possíveis descartando o menor', () => {
    // distribuição básica: valores devem variar (não é sempre o mesmo número)
    const valores = new Set(Array.from({ length: 50 }, () => rolar4d6DescartaMenor()))
    expect(valores.size).toBeGreaterThan(1)
  })
})

describe('rolarPoolDeAtributos', () => {
  it('retorna seis valores, cada um dentro da faixa 3–18', () => {
    const pool = rolarPoolDeAtributos()
    expect(pool).toHaveLength(6)
    for (const valor of pool) {
      expect(valor).toBeGreaterThanOrEqual(3)
      expect(valor).toBeLessThanOrEqual(18)
    }
  })
})

describe('dentroDaFaixaLivre', () => {
  it('aceita os limites 3 e 18', () => {
    expect(dentroDaFaixaLivre(PONTUACAO_MINIMA_LIVRE)).toBe(true)
    expect(dentroDaFaixaLivre(PONTUACAO_MAXIMA_LIVRE)).toBe(true)
  })

  it('rejeita valores fora da faixa', () => {
    expect(dentroDaFaixaLivre(2)).toBe(false)
    expect(dentroDaFaixaLivre(19)).toBe(false)
  })
})
