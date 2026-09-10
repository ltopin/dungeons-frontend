import { describe, expect, it } from 'vitest'
import { criarFichaFake } from '../test/fixtures'
import { montarCatalogoRolagem } from './catalogoRolagem'

describe('montarCatalogoRolagem', () => {
  it('inclui cada perícia, ataque e talento da ficha com o itemId, o tipoItem e a notação de rolagem certos', () => {
    const catalogo = montarCatalogoRolagem(criarFichaFake())

    // Fixture: graduações 6 + mod DEX (18 -> +4) + classe (3, treinada) + outros 0 = 13
    // (o campo `total` salvo na fixture é 10 — o catálogo recalcula em vez de
    // confiar nesse valor persistido, que pode estar desatualizado ou nulo.)
    expect(catalogo).toContainEqual({
      rotulo: 'Furtividade',
      tipo: 'item',
      tipoItem: 'pericia',
      itemId: 'p1',
      valor: '1d20+13',
    })
    expect(catalogo).toContainEqual({
      rotulo: 'Adaga',
      tipo: 'item',
      tipoItem: 'ataque',
      itemId: 'a1',
      valor: '1d20+5',
    })
    expect(catalogo).toContainEqual({
      rotulo: 'Ataque Furtivo',
      tipo: 'item',
      tipoItem: 'talento',
      itemId: 't1',
      valor: null,
    })
  })

  it('recalcula o total da perícia a partir dos campos salvos, em vez de confiar no `total` persistido (pode chegar `null` da API)', () => {
    const catalogo = montarCatalogoRolagem(
      criarFichaFake({
        pericias: [
          {
            id: 'p2',
            nome: 'Percepção',
            atributo: 'WIS',
            periciaDeClasse: true,
            graduacoes: 3,
            outros: 1,
            total: null as unknown as number,
          },
        ],
      }),
    )

    // WIS 10 -> mod 0; graduações 3 + classe (3, treinada) + outros 1 = 7
    expect(catalogo).toContainEqual({
      rotulo: 'Percepção',
      tipo: 'item',
      tipoItem: 'pericia',
      itemId: 'p2',
      valor: '1d20+7',
    })
  })

  it('inclui as três resistências e a iniciativa com a notação calculada a partir de combate/geral', () => {
    const catalogo = montarCatalogoRolagem(criarFichaFake())

    // fortBase 1 + mod CON (12 -> +1) = +2; reflexosBase 3 + mod DEX (18 -> +4) = +7; vontadeBase 1 + mod WIS (10 -> +0) = +1
    expect(catalogo).toContainEqual({ rotulo: 'Fortitude', tipo: 'livre', notacao: '1d20+2' })
    expect(catalogo).toContainEqual({ rotulo: 'Reflexos', tipo: 'livre', notacao: '1d20+7' })
    expect(catalogo).toContainEqual({ rotulo: 'Vontade', tipo: 'livre', notacao: '1d20+1' })
    expect(catalogo).toContainEqual({ rotulo: 'Iniciativa', tipo: 'livre', notacao: '1d20+4' })
  })

  it('inclui os seis atributos puros com a notação do modificador (positivo, zero e negativo)', () => {
    const catalogo = montarCatalogoRolagem(criarFichaFake())

    expect(catalogo).toContainEqual({ rotulo: 'Força', tipo: 'livre', notacao: '1d20+0' })
    expect(catalogo).toContainEqual({ rotulo: 'Destreza', tipo: 'livre', notacao: '1d20+4' })
    expect(catalogo).toContainEqual({ rotulo: 'Constituição', tipo: 'livre', notacao: '1d20+1' })
    expect(catalogo).toContainEqual({ rotulo: 'Inteligência', tipo: 'livre', notacao: '1d20+2' })
    expect(catalogo).toContainEqual({ rotulo: 'Sabedoria', tipo: 'livre', notacao: '1d20+0' })
    expect(catalogo).toContainEqual({ rotulo: 'Carisma', tipo: 'livre', notacao: '1d20-1' })
  })

  it('ficha sem perícias, ataques ou talentos ainda produz as dez entradas derivadas', () => {
    const catalogo = montarCatalogoRolagem(criarFichaFake({ pericias: [], ataques: [], talentos: [] }))

    expect(catalogo).toHaveLength(10)
    expect(catalogo.every((entrada) => entrada.tipo === 'livre')).toBe(true)
  })
})
