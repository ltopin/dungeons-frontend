import { describe, expect, it } from 'vitest'
import { isNotacaoDadosValida } from './notacao'

describe('isNotacaoDadosValida', () => {
  it.each(['2d6+3', '1d20', 'd20', '4d8-2', 'D6'])('aceita notação válida: %s', (notacao) => {
    expect(isNotacaoDadosValida(notacao)).toBe(true)
  })

  it.each(['', 'abc', '2x6', 'd0', '0d6', '2d6++3', 'd6+'])('rejeita notação inválida: %s', (notacao) => {
    expect(isNotacaoDadosValida(notacao)).toBe(false)
  })
})
