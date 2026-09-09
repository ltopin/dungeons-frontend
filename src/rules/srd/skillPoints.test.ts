import { describe, expect, it } from 'vitest'
import { custoDaGraduacao, pontosDePericiaNivel1 } from './skillPoints'
import { graduacoesMaximasNivel1 } from '../classProgression'

describe('pontosDePericiaNivel1', () => {
  it('multiplica (base + mod. Int) por 4 no 1º nível', () => {
    expect(pontosDePericiaNivel1(2, 1, 0)).toBe(12)
  })

  it('usa o mínimo de 1 ponto/nível mesmo com modificador de Int negativo', () => {
    expect(pontosDePericiaNivel1(2, -3, 0)).toBe(4)
  })

  it('soma o bônus racial fixo (ex: humano +4)', () => {
    expect(pontosDePericiaNivel1(2, 1, 4)).toBe(16)
  })
})

describe('custoDaGraduacao', () => {
  it('custa 1 ponto por graduação em perícia de classe', () => {
    expect(custoDaGraduacao(true)).toBe(1)
  })

  it('custa 2 pontos por graduação em perícia fora de classe', () => {
    expect(custoDaGraduacao(false)).toBe(2)
  })
})

describe('graduacoesMaximasNivel1', () => {
  it('máximo de 4 graduações em perícia de classe no 1º nível', () => {
    expect(graduacoesMaximasNivel1(true)).toBe(4)
  })

  it('máximo de 2 graduações em perícia fora de classe no 1º nível', () => {
    expect(graduacoesMaximasNivel1(false)).toBe(2)
  })
})
