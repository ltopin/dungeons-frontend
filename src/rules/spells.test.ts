import { describe, expect, it } from 'vitest'
import { spellDC } from './spells'

describe('spellDC', () => {
  it('CD de uma magia de 3º nível', () => {
    expect(spellDC({ nivel: 3, atributoMod: 4, outros: 0 })).toBe(17)
  })
})
