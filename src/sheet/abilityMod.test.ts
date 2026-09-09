import { describe, expect, it } from 'vitest'
import { atributoScore } from './abilityMod'

const GERAL = { str: 10, dex: 18, con: 12, int: 14, wis: 10, cha: 8 }

describe('atributoScore', () => {
  it('resolve por chave ou abreviação, sem diferenciar caixa', () => {
    expect(atributoScore(GERAL, 'dex')).toBe(18)
    expect(atributoScore(GERAL, 'DEX')).toBe(18)
    expect(atributoScore(GERAL, 'Destreza')).toBe(10) // não bate com chave nem abbr, cai no default
  })

  it('não quebra quando o atributo vem null/undefined/vazio da API (coluna nova sem valor)', () => {
    expect(atributoScore(GERAL, null)).toBe(10)
    expect(atributoScore(GERAL, undefined)).toBe(10)
    expect(atributoScore(GERAL, '')).toBe(10)
  })
})
