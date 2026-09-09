import { describe, expect, it } from 'vitest'
import { armorClass, cmb, cmd, initiative, meleeAttackBonus, rangedAttackBonus, savingThrow } from './combat'

describe('armorClass', () => {
  it('CA total com todos os componentes', () => {
    const { total } = armorClass({ armadura: 4, escudo: 2, destreza: 3, tamanho: 0, natural: 1, desvio: 0, outros: 0 })
    expect(total).toBe(20)
  })

  it('CA de toque ignora armadura/escudo/natural', () => {
    const { toque } = armorClass({ armadura: 4, escudo: 2, destreza: 3, tamanho: 0, natural: 1, desvio: 0, outros: 0 })
    expect(toque).toBe(13)
  })

  it('CA surpreendido remove o bônus de destreza positivo', () => {
    const { surpreendido } = armorClass({
      armadura: 4,
      escudo: 2,
      destreza: 3,
      tamanho: 0,
      natural: 1,
      desvio: 0,
      outros: 0,
    })
    expect(surpreendido).toBe(17)
  })

  it('CA surpreendido mantém a penalidade de destreza negativa', () => {
    const { surpreendido, total } = armorClass({
      armadura: 7,
      escudo: 0,
      destreza: -2,
      tamanho: 0,
      natural: 0,
      desvio: 0,
      outros: 0,
    })
    expect(total).toBe(15)
    expect(surpreendido).toBe(15)
  })
})

describe('savingThrow', () => {
  it('Fortitude com todos os componentes', () => {
    expect(savingThrow({ base: 5, atributoMod: 2, magico: 1, outros: 0 })).toBe(8)
  })
})

describe('meleeAttackBonus / rangedAttackBonus', () => {
  it('ataque corpo a corpo', () => {
    expect(meleeAttackBonus({ bab: 6, forcaMod: 3, tamanhoMod: 1, outros: 0 })).toBe(10)
  })

  it('ataque à distância', () => {
    expect(rangedAttackBonus({ bab: 6, destrezaMod: 2, tamanhoMod: 1, outros: 0 })).toBe(9)
  })
})

describe('cmb / cmd', () => {
  it('CMB de um personagem Grande reaproveita o modificador de tamanho de CA', () => {
    expect(cmb({ bab: 6, forcaMod: 4, tamanhoMod: -1, outros: 0 })).toBe(9)
  })

  it('CMD de um personagem Médio', () => {
    expect(cmd({ bab: 6, forcaMod: 4, destrezaMod: 2, tamanhoMod: 0, outros: 0 })).toBe(22)
  })
})

describe('initiative', () => {
  it('iniciativa com modificador positivo de destreza', () => {
    expect(initiative({ destrezaMod: 3, outros: 1 })).toBe(4)
  })

  it('iniciativa com modificador negativo de destreza', () => {
    expect(initiative({ destrezaMod: -1, outros: 0 })).toBe(-1)
  })
})
