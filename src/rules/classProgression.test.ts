import { describe, expect, it } from 'vitest'
import { babNoNivel1, baseDeSalvaNoNivel1, graduacoesMaximasNivel1 } from './classProgression'

describe('babNoNivel1', () => {
  it('progressão boa dá +1', () => {
    expect(babNoNivel1('boa')).toBe(1)
  })

  it('progressões média e ruim dão +0', () => {
    expect(babNoNivel1('media')).toBe(0)
    expect(babNoNivel1('ruim')).toBe(0)
  })
})

describe('baseDeSalvaNoNivel1', () => {
  it('progressão boa dá +2', () => {
    expect(baseDeSalvaNoNivel1('boa')).toBe(2)
  })

  it('progressão ruim dá +0', () => {
    expect(baseDeSalvaNoNivel1('ruim')).toBe(0)
  })
})

describe('graduacoesMaximasNivel1', () => {
  it('teto uniforme de 4, tanto para perícia de classe quanto fora de classe', () => {
    expect(graduacoesMaximasNivel1(true)).toBe(4)
    expect(graduacoesMaximasNivel1(false)).toBe(4)
  })
})
