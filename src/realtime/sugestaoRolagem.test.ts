import { describe, expect, it } from 'vitest'
import type { CatalogoRolagemEntry } from './catalogoRolagem'
import { sugerirEntradaDoPedido } from './sugestaoRolagem'

const percepcao: CatalogoRolagemEntry = {
  rotulo: 'Percepção',
  tipo: 'item',
  tipoItem: 'pericia',
  itemId: 'p1',
  valor: '+7',
}
const espadaLonga: CatalogoRolagemEntry = {
  rotulo: 'Espada longa',
  tipo: 'item',
  tipoItem: 'ataque',
  itemId: 'a1',
  valor: '+5',
}
const ataqueFurtivo: CatalogoRolagemEntry = {
  rotulo: 'Ataque Furtivo',
  tipo: 'item',
  tipoItem: 'talento',
  itemId: 't1',
  valor: null,
}
const vontade: CatalogoRolagemEntry = { rotulo: 'Vontade', tipo: 'livre', notacao: '1d20+3' }
const forca: CatalogoRolagemEntry = { rotulo: 'Força', tipo: 'livre', notacao: '1d20+0' }
const iniciativa: CatalogoRolagemEntry = { rotulo: 'Iniciativa', tipo: 'livre', notacao: '1d20+4' }

const catalogo: CatalogoRolagemEntry[] = [percepcao, espadaLonga, ataqueFurtivo, vontade, forca, iniciativa]

describe('sugerirEntradaDoPedido', () => {
  it('casa perícia, ataque e talento por nome direto, ignorando acento e caixa', () => {
    expect(sugerirEntradaDoPedido('Teste de Percepção...', catalogo)).toBe(percepcao)
    expect(sugerirEntradaDoPedido('role para atacar com sua ESPADA LONGA', catalogo)).toBe(espadaLonga)
    expect(sugerirEntradaDoPedido('use seu ataque furtivo agora', catalogo)).toBe(ataqueFurtivo)
  })

  it('casa teste de resistência/atributo só quando ancorado por "teste de"/"resistência de"/"salvamento de"', () => {
    expect(sugerirEntradaDoPedido('Teste de Resistência de Vontade CD 15', catalogo)).toBe(vontade)
    expect(sugerirEntradaDoPedido('Salvamento de Vontade CD 15', catalogo)).toBe(vontade)
    expect(sugerirEntradaDoPedido('Teste de Força', catalogo)).toBe(forca)
  })

  it('reconhece "iniciativa" como termo autônomo, sem exigir âncora', () => {
    expect(sugerirEntradaDoPedido('role Iniciativa', catalogo)).toBe(iniciativa)
  })

  it('não sugere resistência/atributo a partir de uma menção solta, sem padrão de teste', () => {
    expect(
      sugerirEntradaDoPedido('você sente que precisa de mais força de vontade para continuar', catalogo),
    ).toBeNull()
  })

  it('retorna null quando a descrição não corresponde a nenhuma entrada do catálogo', () => {
    expect(sugerirEntradaDoPedido('Descreva o que você vê na sala', catalogo)).toBeNull()
  })

  it('quando a descrição corresponde a mais de uma entrada, retorna a primeira pela ordem de prioridade (item antes de derivado)', () => {
    expect(sugerirEntradaDoPedido('Teste de Percepção ou Teste de Força', catalogo)).toBe(percepcao)
  })
})
