import { describe, expect, it } from 'vitest'
import { custoDaPontuacao, custoTotal } from './pointBuy'

describe('custoDaPontuacao', () => {
  it('pontuação 10 (padrão) não custa nada', () => {
    expect(custoDaPontuacao(10)).toBe(0)
  })

  it('pontuações acima de 10 custam progressivamente mais', () => {
    expect(custoDaPontuacao(14)).toBe(5)
    expect(custoDaPontuacao(18)).toBe(17)
  })

  it('pontuações abaixo de 10 devolvem pontos (custo negativo)', () => {
    expect(custoDaPontuacao(7)).toBe(-4)
  })

  it('satura nos limites 7–18', () => {
    expect(custoDaPontuacao(3)).toBe(custoDaPontuacao(7))
    expect(custoDaPontuacao(25)).toBe(custoDaPontuacao(18))
  })
})

describe('custoTotal', () => {
  it('soma o custo de todas as pontuações', () => {
    expect(custoTotal({ str: 14, dex: 12, con: 13, int: 10, wis: 10, cha: 8 })).toBe(5 + 2 + 3 + 0 + 0 - 2)
  })
})
