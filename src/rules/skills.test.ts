import { describe, expect, it } from 'vitest'
import { skillTotal } from './skills'

describe('skillTotal', () => {
  it('perícia de classe treinada', () => {
    expect(skillTotal({ graduacoes: 4, atributoMod: 2, periciaDeClasse: true, outros: 0 })).toBe(9)
  })

  it('perícia fora de classe treinada', () => {
    expect(skillTotal({ graduacoes: 4, atributoMod: 2, periciaDeClasse: false, outros: 0 })).toBe(6)
  })

  it('perícia sem graduações não recebe bônus de classe', () => {
    expect(skillTotal({ graduacoes: 0, atributoMod: 1, periciaDeClasse: true, outros: 0 })).toBe(1)
  })
})
