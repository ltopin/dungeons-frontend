import { describe, expect, it } from 'vitest'
import { avaliarPreRequisitos, type ContextoCompendio } from './compendioPrereq'

const atributosBase = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }

function ctx(overrides: Partial<ContextoCompendio> = {}): ContextoCompendio {
  return {
    atributos: atributosBase,
    bab: 0,
    nivelSeConjurador: 0,
    nomesTalentosEscolhidos: new Set(),
    ...overrides,
  }
}

describe('avaliarPreRequisitos', () => {
  it('sem pré-requisito sempre atende', () => {
    expect(avaliarPreRequisitos(null, ctx(), new Set())).toEqual({ resultado: 'atende' })
    expect(avaliarPreRequisitos('', ctx(), new Set())).toEqual({ resultado: 'atende' })
  })

  it('reconhece atributo mínimo ("Força 13")', () => {
    expect(avaliarPreRequisitos('Força 13', ctx({ atributos: { ...atributosBase, str: 12 } }), new Set()).resultado).toBe(
      'nao_atende',
    )
    expect(avaliarPreRequisitos('Força 13', ctx({ atributos: { ...atributosBase, str: 13 } }), new Set()).resultado).toBe(
      'atende',
    )
  })

  it('reconhece base de ataque mínima ("Base de Ataque Base +1")', () => {
    expect(avaliarPreRequisitos('Base de Ataque Base +1', ctx({ bab: 0 }), new Set()).resultado).toBe('nao_atende')
    expect(avaliarPreRequisitos('Base de Ataque Base +1', ctx({ bab: 1 }), new Set()).resultado).toBe('atende')
  })

  it('reconhece nível de conjurador ("Conjurador de nível 5")', () => {
    expect(avaliarPreRequisitos('Conjurador de nível 5', ctx({ nivelSeConjurador: 1 }), new Set()).resultado).toBe(
      'nao_atende',
    )
    expect(avaliarPreRequisitos('Conjurador de nível 5', ctx({ nivelSeConjurador: 5 }), new Set()).resultado).toBe('atende')
  })

  it('reconhece um talento anterior pelo nome exato, contra o catálogo', () => {
    const catalogo = new Set(['investida poderosa'])
    expect(avaliarPreRequisitos('Investida Poderosa', ctx(), catalogo).resultado).toBe('nao_atende')
    expect(
      avaliarPreRequisitos(
        'Investida Poderosa',
        ctx({ nomesTalentosEscolhidos: new Set(['investida poderosa']) }),
        catalogo,
      ).resultado,
    ).toBe('atende')
  })

  it('avalia cláusulas combinadas com vírgula como E (todas precisam atender)', () => {
    const catalogo = new Set(['investida poderosa'])
    expect(
      avaliarPreRequisitos(
        'Força 13, Investida Poderosa',
        ctx({ atributos: { ...atributosBase, str: 13 }, nomesTalentosEscolhidos: new Set() }),
        catalogo,
      ).resultado,
    ).toBe('nao_atende')
    expect(
      avaliarPreRequisitos(
        'Força 13, Investida Poderosa',
        ctx({
          atributos: { ...atributosBase, str: 13 },
          nomesTalentosEscolhidos: new Set(['investida poderosa']),
        }),
        catalogo,
      ).resultado,
    ).toBe('atende')
  })

  it('marca como não verificável um texto que não reconhece (ex: "Proficiência com escudos")', () => {
    expect(avaliarPreRequisitos('Proficiência com escudos', ctx(), new Set()).resultado).toBe('nao_verificavel')
  })

  it('marca a combinação inteira como não verificável se qualquer cláusula não for reconhecida', () => {
    expect(
      avaliarPreRequisitos(
        'Força 13, Proficiência com escudos',
        ctx({ atributos: { ...atributosBase, str: 13 } }),
        new Set(),
      ).resultado,
    ).toBe('nao_verificavel')
  })
})
