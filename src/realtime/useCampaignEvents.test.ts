import { act, renderHook } from '@testing-library/react'
import { io } from 'socket.io-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCampaignEvents } from './useCampaignEvents'

vi.mock('socket.io-client', () => ({ io: vi.fn() }))
vi.mock('../auth/session', () => ({
  getToken: () => 'token-fake',
  getContaAtual: () => ({ id: 'conta-1' }),
}))

type Handler = (...args: unknown[]) => void

function createFakeSocket() {
  const handlers: Record<string, Handler[]> = {}
  const ioHandlers: Record<string, Handler[]> = {}
  const emit = vi.fn()

  const socket = {
    on: vi.fn((event: string, cb: Handler) => {
      ;(handlers[event] ??= []).push(cb)
    }),
    emit,
    close: vi.fn(),
    io: {
      on: vi.fn((event: string, cb: Handler) => {
        ;(ioHandlers[event] ??= []).push(cb)
      }),
    },
  }

  return {
    socket,
    emit,
    trigger: (event: string, ...args: unknown[]) => handlers[event]?.forEach((cb) => cb(...args)),
    triggerIo: (event: string, ...args: unknown[]) => ioHandlers[event]?.forEach((cb) => cb(...args)),
  }
}

describe('useCampaignEvents', () => {
  let fake: ReturnType<typeof createFakeSocket>

  beforeEach(() => {
    fake = createFakeSocket()
    vi.mocked(io).mockReturnValue(fake.socket as never)
  })

  it('entra na sala ao conectar e expõe o histórico inicial', () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    act(() => fake.trigger('connect'))
    expect(fake.emit).toHaveBeenCalledWith('sala:entrar', { campanha_id: 'camp-1' }, expect.any(Function))

    act(() => {
      fake.trigger('evento:historico', [
        {
          id: 'ev-1',
          campanha_id: 'camp-1',
          autor_conta_id: 'conta-2',
          tipo: 'rolagem_dados',
          payload: {
            tipo_item: 'pericia',
            item_id: 'p1',
            item_nome: 'Furtividade',
            notacao: '1d20',
            dados: [15],
            bonus: 3,
            resultado: 18,
            autor_nome_personagem: 'Thorin',
          },
          criado_em: '2026-01-01T00:00:00.000Z',
        },
      ])
    })

    expect(result.current.status).toBe('conectado')
    expect(result.current.eventos).toHaveLength(1)
    expect(result.current.eventos[0].payload).toMatchObject({
      resultado: 18,
      itemNome: 'Furtividade',
      autorNomePersonagem: 'Thorin',
    })
  })

  it('acrescenta novos eventos recebidos enquanto conectado, sem substituir o histórico', () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))
    act(() => fake.trigger('evento:historico', []))

    act(() => {
      fake.trigger('evento:novo', {
        id: 'ev-2',
        campanha_id: 'camp-1',
        autor_conta_id: 'conta-1',
        tipo: 'pedido_rolagem',
        payload: { destinatario_conta_id: null, descricao: 'Teste de Reflexos' },
        criado_em: '2026-01-01T00:01:00.000Z',
      })
    })

    expect(result.current.eventos).toHaveLength(1)
    expect(result.current.eventos[0]).toMatchObject({
      tipo: 'pedido_rolagem',
      payload: { descricao: 'Teste de Reflexos', destinatarioContaId: null },
    })
  })

  it('marca indisponível quando a conexão falha', () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))
    act(() => fake.trigger('connect_error', new Error('boom')))
    expect(result.current.status).toBe('indisponivel')
  })

  it('marca reconectando durante tentativas de reconexão, sem descartar o histórico já exibido', () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))
    act(() => fake.trigger('evento:historico', []))

    act(() => fake.triggerIo('reconnect_attempt'))

    expect(result.current.status).toBe('reconectando')
    expect(result.current.eventos).toEqual([])
  })

  it('emitirRolagem resolve com o evento (e o resultado) devolvido pelo servidor via ack', async () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))
    fake.emit.mockImplementation((event: string, _payload: unknown, ack?: Handler) => {
      if (event === 'rolagem:emitir') {
        ack?.({
          ok: true,
          data: {
            id: 'ev-3',
            campanha_id: 'camp-1',
            autor_conta_id: 'conta-1',
            tipo: 'rolagem_dados',
            payload: {
              tipo_item: 'pericia',
              item_id: 'p1',
              item_nome: 'Furtividade',
              notacao: '1d20',
              dados: [20],
              bonus: 3,
              resultado: 23,
            },
            criado_em: '2026-01-01T00:02:00.000Z',
          },
        })
      }
    })

    const evento = await result.current.emitirRolagem({ tipoItem: 'pericia', itemId: 'p1' })

    expect(evento.payload).toMatchObject({ resultado: 23 })
    expect(fake.emit).toHaveBeenCalledWith(
      'rolagem:emitir',
      { campanha_id: 'camp-1', tipo_item: 'pericia', item_id: 'p1' },
      expect.any(Function),
    )
  })

  it('emitirRolagem rejeita com o erro devolvido pelo servidor quando a rolagem é recusada', async () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))
    fake.emit.mockImplementation((event: string, _payload: unknown, ack?: Handler) => {
      if (event === 'rolagem:emitir') ack?.({ ok: false, error: 'Notação de dados inválida: xx' })
    })

    await expect(result.current.emitirRolagem({ notacao: 'xx' })).rejects.toThrow('Notação de dados inválida: xx')
  })

  it('pedirRolagem envia o destinatário quando informado', async () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))
    fake.emit.mockImplementation((event: string, _payload: unknown, ack?: Handler) => {
      if (event === 'rolagem:pedir') {
        ack?.({
          ok: true,
          data: {
            id: 'ev-4',
            campanha_id: 'camp-1',
            autor_conta_id: 'mestre-1',
            tipo: 'pedido_rolagem',
            payload: {
              destinatario_conta_id: 'conta-2',
              destinatario_nome_personagem: 'Thorin',
              descricao: 'Teste de Vontade',
            },
            criado_em: '2026-01-01T00:03:00.000Z',
          },
        })
      }
    })

    const evento = await result.current.pedirRolagem({
      destinatarioContaId: 'conta-2',
      descricao: 'Teste de Vontade',
    })

    expect(evento.payload).toMatchObject({ destinatarioNomePersonagem: 'Thorin' })

    expect(fake.emit).toHaveBeenCalledWith(
      'rolagem:pedir',
      { campanha_id: 'camp-1', destinatario_conta_id: 'conta-2', descricao: 'Teste de Vontade' },
      expect.any(Function),
    )
  })

  it('pedirRolagem omite o destinatário quando o pedido é para toda a mesa', async () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))
    fake.emit.mockImplementation((event: string, _payload: unknown, ack?: Handler) => {
      if (event === 'rolagem:pedir') {
        ack?.({
          ok: true,
          data: {
            id: 'ev-5',
            campanha_id: 'camp-1',
            autor_conta_id: 'mestre-1',
            tipo: 'pedido_rolagem',
            payload: { destinatario_conta_id: null, descricao: 'Teste de Percepção' },
            criado_em: '2026-01-01T00:04:00.000Z',
          },
        })
      }
    })

    await result.current.pedirRolagem({ descricao: 'Teste de Percepção' })

    expect(fake.emit).toHaveBeenCalledWith(
      'rolagem:pedir',
      { campanha_id: 'camp-1', destinatario_conta_id: undefined, descricao: 'Teste de Percepção' },
      expect.any(Function),
    )
  })
})
