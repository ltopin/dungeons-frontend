import { describe, expect, it } from 'vitest'
import { fichaAindaNaoIniciada } from './wizardSteps'
import type { Ficha } from '../api/types'

function geralComTexto(campos: Record<string, unknown>) {
  return { geral: campos } as unknown as Pick<Ficha, 'geral'>
}

describe('fichaAindaNaoIniciada', () => {
  it('considera em branco quando nome/classe/raça são strings vazias', () => {
    expect(fichaAindaNaoIniciada(geralComTexto({ nomePersonagem: '', classe: '', raca: '' }))).toBe(true)
  })

  it('considera em branco quando a API retorna null em vez de string vazia', () => {
    expect(fichaAindaNaoIniciada(geralComTexto({ nomePersonagem: null, classe: null, raca: null }))).toBe(true)
  })

  it('não crasha e considera não-em-branco quando pelo menos um campo tem valor', () => {
    expect(fichaAindaNaoIniciada(geralComTexto({ nomePersonagem: 'Thorin', classe: null, raca: null }))).toBe(false)
  })
})
