import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSectionAutosave } from './useSectionAutosave'
import * as sheetsApi from '../api/sheets'

vi.mock('../api/sheets')
const sheetsMock = vi.mocked(sheetsApi)

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useSectionAutosave', () => {
  it('salva a seção após a pausa de digitação e mostra o status salvo', async () => {
    sheetsMock.atualizarSecao.mockResolvedValue({ texto: 'olá' })
    const { result } = renderHook(() => useSectionAutosave('ficha-1', 'notas', { texto: '' }))

    act(() => {
      result.current.updateField('texto', 'olá')
    })
    expect(result.current.value.texto).toBe('olá')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(sheetsMock.atualizarSecao).toHaveBeenCalledWith('ficha-1', 'notas', { texto: 'olá' })
    expect(result.current.status).toBe('salvo')
  })

  it('mostra erro e mantém o valor editado quando o save falha, permitindo nova tentativa', async () => {
    sheetsMock.atualizarSecao.mockRejectedValueOnce(new Error('falhou'))
    const { result } = renderHook(() => useSectionAutosave('ficha-1', 'notas', { texto: '' }))

    act(() => {
      result.current.updateField('texto', 'rascunho')
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(result.current.status).toBe('erro')
    expect(result.current.value.texto).toBe('rascunho')

    sheetsMock.atualizarSecao.mockResolvedValueOnce({ texto: 'rascunho' })
    await act(async () => {
      result.current.retry()
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(result.current.status).toBe('salvo')
  })
})
