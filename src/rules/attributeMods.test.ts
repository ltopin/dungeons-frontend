import { describe, expect, it } from 'vitest'
import { attributeModifier, sizeModifier } from './attributeMods'

describe('attributeModifier', () => {
  it('atributo par', () => {
    expect(attributeModifier(14)).toBe(2)
  })

  it('atributo ímpar', () => {
    expect(attributeModifier(15)).toBe(2)
  })

  it('atributo abaixo de 10', () => {
    expect(attributeModifier(8)).toBe(-1)
  })
})

describe('sizeModifier', () => {
  it('tamanho Pequeno', () => {
    expect(sizeModifier('PEQUENO')).toBe(1)
  })

  it('tamanho Colossal', () => {
    expect(sizeModifier('COLOSSAL')).toBe(-8)
  })

  it('aceita variação de caixa/acento como na ficha (Médio)', () => {
    expect(sizeModifier('Médio')).toBe(0)
  })
})
