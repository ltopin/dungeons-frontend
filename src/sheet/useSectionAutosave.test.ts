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

  it('chama onSaved com o valor confirmado pela API após o save', async () => {
    sheetsMock.atualizarSecao.mockResolvedValue({ texto: 'confirmado pelo backend' })
    const onSaved = vi.fn()
    const { result } = renderHook(() =>
      useSectionAutosave('ficha-1', 'notas', { texto: '' }, undefined, onSaved),
    )

    act(() => {
      result.current.updateField('texto', 'olá')
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(onSaved).toHaveBeenCalledWith({ texto: 'confirmado pelo backend' })
  })

  it('flush envia e resolve quando há um patch pendente', async () => {
    sheetsMock.atualizarSecao.mockResolvedValue({ texto: 'olá' })
    const { result } = renderHook(() => useSectionAutosave('ficha-1', 'notas', { texto: '' }))

    act(() => {
      result.current.updateField('texto', 'olá')
    })

    let resultado: { texto: string } | undefined
    await act(async () => {
      resultado = await result.current.flush()
    })

    expect(sheetsMock.atualizarSecao).toHaveBeenCalledWith('ficha-1', 'notas', { texto: 'olá' })
    expect(resultado).toEqual({ texto: 'olá' })
    expect(result.current.status).toBe('salvo')
  })

  it('flush não chama a API quando não há patch pendente', async () => {
    const { result } = renderHook(() => useSectionAutosave('ficha-1', 'notas', { texto: '' }))

    await act(async () => {
      await result.current.flush()
    })

    expect(sheetsMock.atualizarSecao).not.toHaveBeenCalled()
  })

  it('flush propaga a rejeição quando o save falha', async () => {
    sheetsMock.atualizarSecao.mockRejectedValueOnce(new Error('falhou'))
    const { result } = renderHook(() => useSectionAutosave('ficha-1', 'notas', { texto: '' }))

    act(() => {
      result.current.updateField('texto', 'rascunho')
    })

    let erro: unknown = null
    await act(async () => {
      try {
        await result.current.flush()
      } catch (e) {
        erro = e
      }
    })

    expect(erro).toBeInstanceOf(Error)
    expect((erro as Error).message).toBe('falhou')
    expect(result.current.status).toBe('erro')
  })

  it('dispara o save pendente ao desmontar antes do debounce disparar', async () => {
    let resolveSave: (value: { texto: string }) => void = () => {}
    sheetsMock.atualizarSecao.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve
      }),
    )
    const { result, unmount } = renderHook(() => useSectionAutosave('ficha-1', 'notas', { texto: '' }))

    act(() => {
      result.current.updateField('texto', 'editado rápido')
    })

    unmount()

    expect(sheetsMock.atualizarSecao).toHaveBeenCalledWith('ficha-1', 'notas', { texto: 'editado rápido' })
    resolveSave({ texto: 'editado rápido' })
  })
})
