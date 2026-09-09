import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useListSection } from './useListSection'
import * as sheetsApi from '../api/sheets'
import type { FichaTalento } from '../api/types'

vi.mock('../api/sheets')
const sheetsMock = vi.mocked(sheetsApi)

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useListSection', () => {
  it('cria uma linha imediatamente ao adicionar', async () => {
    const criado: FichaTalento = { id: 't2', nome: 'Esquiva Sobrenatural', descricao: '', categoria: 'talento' }
    sheetsMock.criarLinha.mockResolvedValue(criado)
    const { result } = renderHook(() => useListSection<FichaTalento>('ficha-1', 'talentos', []))

    await act(async () => {
      await result.current.addItem({ nome: 'Esquiva Sobrenatural', descricao: '' })
    })

    expect(sheetsMock.criarLinha).toHaveBeenCalledWith('ficha-1', 'talentos', {
      nome: 'Esquiva Sobrenatural',
      descricao: '',
    })
    expect(result.current.items).toEqual([criado])
  })

  it('remove uma linha imediatamente', async () => {
    sheetsMock.removerLinha.mockResolvedValue(undefined)
    const inicial: FichaTalento[] = [{ id: 't1', nome: 'Talento', descricao: '', categoria: 'talento' }]
    const { result } = renderHook(() => useListSection<FichaTalento>('ficha-1', 'talentos', inicial))

    await act(async () => {
      await result.current.removeItem('t1')
    })

    expect(sheetsMock.removerLinha).toHaveBeenCalledWith('ficha-1', 'talentos', 't1')
    expect(result.current.items).toEqual([])
  })

  it('salva a edição de campo de uma linha após debounce, com status por linha', async () => {
    sheetsMock.atualizarLinha.mockResolvedValue({ id: 't1', nome: 'Novo nome', descricao: '' })
    const inicial: FichaTalento[] = [{ id: 't1', nome: 'Talento', descricao: '', categoria: 'talento' }]
    const { result } = renderHook(() => useListSection<FichaTalento>('ficha-1', 'talentos', inicial))

    act(() => {
      result.current.updateItemField('t1', 'nome', 'Novo nome')
    })
    expect(result.current.items[0].nome).toBe('Novo nome')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(sheetsMock.atualizarLinha).toHaveBeenCalledWith('ficha-1', 'talentos', 't1', { nome: 'Novo nome' })
    expect(result.current.statusById.t1).toBe('salvo')
  })

  it('mostra erro por linha quando a atualização falha', async () => {
    sheetsMock.atualizarLinha.mockRejectedValueOnce(new Error('falhou'))
    const inicial: FichaTalento[] = [{ id: 't1', nome: 'Talento', descricao: '', categoria: 'talento' }]
    const { result } = renderHook(() => useListSection<FichaTalento>('ficha-1', 'talentos', inicial))

    act(() => {
      result.current.updateItemField('t1', 'nome', 'Nome quebrado')
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(result.current.statusById.t1).toBe('erro')
    expect(result.current.items[0].nome).toBe('Nome quebrado')
  })

  it('chama onItemsChange após adicionar, remover e salvar a edição de uma linha', async () => {
    const criado: FichaTalento = { id: 't2', nome: 'Esquiva Sobrenatural', descricao: '', categoria: 'talento' }
    sheetsMock.criarLinha.mockResolvedValue(criado)
    sheetsMock.atualizarLinha.mockResolvedValue({ id: 't2', nome: 'Editado', descricao: '' })
    sheetsMock.removerLinha.mockResolvedValue(undefined)
    const onItemsChange = vi.fn()
    const { result } = renderHook(() =>
      useListSection<FichaTalento>('ficha-1', 'talentos', [], undefined, onItemsChange),
    )

    await act(async () => {
      await result.current.addItem({ nome: 'Esquiva Sobrenatural', descricao: '' })
    })
    expect(onItemsChange).toHaveBeenLastCalledWith([criado])

    act(() => {
      result.current.updateItemField('t2', 'nome', 'Editado')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(onItemsChange).toHaveBeenLastCalledWith([{ ...criado, nome: 'Editado' }])

    await act(async () => {
      await result.current.removeItem('t2')
    })
    expect(onItemsChange).toHaveBeenLastCalledWith([])
  })

  it('flushAll envia e resolve as edições de campo pendentes', async () => {
    sheetsMock.atualizarLinha.mockResolvedValue({ id: 't1', nome: 'Novo nome', descricao: '' })
    const inicial: FichaTalento[] = [{ id: 't1', nome: 'Talento', descricao: '', categoria: 'talento' }]
    const { result } = renderHook(() => useListSection<FichaTalento>('ficha-1', 'talentos', inicial))

    act(() => {
      result.current.updateItemField('t1', 'nome', 'Novo nome')
    })

    let resultado: FichaTalento[] = []
    await act(async () => {
      resultado = await result.current.flushAll()
    })

    expect(sheetsMock.atualizarLinha).toHaveBeenCalledWith('ficha-1', 'talentos', 't1', { nome: 'Novo nome' })
    expect(resultado[0].nome).toBe('Novo nome')
    expect(result.current.statusById.t1).toBe('salvo')
  })

  it('flushAll não chama a API quando não há edições pendentes', async () => {
    const inicial: FichaTalento[] = [{ id: 't1', nome: 'Talento', descricao: '', categoria: 'talento' }]
    const { result } = renderHook(() => useListSection<FichaTalento>('ficha-1', 'talentos', inicial))

    await act(async () => {
      await result.current.flushAll()
    })

    expect(sheetsMock.atualizarLinha).not.toHaveBeenCalled()
  })

  it('flushAll propaga a rejeição quando uma edição pendente falha', async () => {
    sheetsMock.atualizarLinha.mockRejectedValueOnce(new Error('falhou'))
    const inicial: FichaTalento[] = [{ id: 't1', nome: 'Talento', descricao: '', categoria: 'talento' }]
    const { result } = renderHook(() => useListSection<FichaTalento>('ficha-1', 'talentos', inicial))

    act(() => {
      result.current.updateItemField('t1', 'nome', 'Nome quebrado')
    })

    let erro: unknown = null
    await act(async () => {
      try {
        await result.current.flushAll()
      } catch (e) {
        erro = e
      }
    })

    expect(erro).toBeInstanceOf(Error)
    expect((erro as Error).message).toBe('falhou')
    expect(result.current.statusById.t1).toBe('erro')
  })

  it('dispara o save de campo pendente ao desmontar antes do debounce disparar', async () => {
    let resolveSave: (value: FichaTalento) => void = () => {}
    sheetsMock.atualizarLinha.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve
      }),
    )
    const inicial: FichaTalento[] = [{ id: 't1', nome: 'Talento', descricao: '', categoria: 'talento' }]
    const { result, unmount } = renderHook(() => useListSection<FichaTalento>('ficha-1', 'talentos', inicial))

    act(() => {
      result.current.updateItemField('t1', 'nome', 'Editado rápido')
    })

    unmount()

    expect(sheetsMock.atualizarLinha).toHaveBeenCalledWith('ficha-1', 'talentos', 't1', { nome: 'Editado rápido' })
    resolveSave({ id: 't1', nome: 'Editado rápido', descricao: '', categoria: 'talento' })
  })
})
