import { act, renderHook } from '@testing-library/react'
import { io } from 'socket.io-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as aiMaster from '../api/aiMaster'
import { useCampaignEvents } from './useCampaignEvents'

vi.mock('socket.io-client', () => ({ io: vi.fn() }))
vi.mock('../auth/session', () => ({
  getToken: () => 'token-fake',
  getContaAtual: () => ({ id: 'conta-1' }),
}))
vi.mock('../api/aiMaster', () => ({
  enviarResumoRodada: vi.fn(),
  fecharRodada: vi.fn(),
  narrarChegadaPersonagem: vi.fn(),
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

  it('emitirRolagem envia pedido_evento_id quando chamado com pedidoEventoId', async () => {
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
              notacao: '1d20',
              dados: [20],
              bonus: 3,
              resultado: 23,
              pedido_evento_id: 'ev-2',
            },
            criado_em: '2026-01-01T00:02:00.000Z',
          },
        })
      }
    })

    await result.current.emitirRolagem({ tipoItem: 'pericia', itemId: 'p1' }, 'ev-2')

    expect(fake.emit).toHaveBeenCalledWith(
      'rolagem:emitir',
      { campanha_id: 'camp-1', tipo_item: 'pericia', item_id: 'p1', pedido_evento_id: 'ev-2' },
      expect.any(Function),
    )
  })

  it('emitirRolagem chamado sem pedidoEventoId mantém o payload atual, sem o campo', async () => {
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

    await result.current.emitirRolagem({ tipoItem: 'pericia', itemId: 'p1' })

    const [, payloadEnviado] = fake.emit.mock.calls.find(([event]) => event === 'rolagem:emitir')!
    expect(payloadEnviado).not.toHaveProperty('pedido_evento_id')
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

  it('rodada:estado recebido pelo socket atualiza o estado da rodada', () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    act(() => {
      fake.trigger('rodada:estado', {
        modo: 'exploracao',
        rodada: 2,
        participantes: [{ conta_id: 'conta-1', nome: 'Você', resumo_enviado: true }],
        turno_atual_conta_id: null,
      })
    })

    expect(result.current.rodada).toMatchObject({
      modo: 'exploracao',
      rodada: 2,
      participantes: [{ contaId: 'conta-1', resumoEnviado: true, resumoTexto: null }],
    })
  })

  it('rodada:estado com resumo_texto popula resumoTexto de cada participante', () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    act(() => {
      fake.trigger('rodada:estado', {
        modo: 'exploracao',
        rodada: 2,
        participantes: [
          {
            conta_id: 'conta-2',
            nome: 'Thorin',
            resumo_enviado: true,
            resumo_texto: 'Investigo o corredor à esquerda.',
          },
        ],
        turno_atual_conta_id: null,
      })
    })

    expect(result.current.rodada).toMatchObject({
      participantes: [{ contaId: 'conta-2', resumoTexto: 'Investigo o corredor à esquerda.' }],
    })
  })

  it('evento:historico com tipo resumo_rodada aparece em eventos', () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    act(() => {
      fake.trigger('evento:historico', [
        {
          id: 'ev-6',
          campanha_id: 'camp-1',
          autor_conta_id: 'conta-2',
          tipo: 'resumo_rodada',
          payload: { texto: 'Investigo o corredor à esquerda.', rodada: 2, autor_nome_personagem: 'Thorin' },
          criado_em: '2026-01-01T00:05:00.000Z',
        },
      ])
    })

    expect(result.current.eventos).toHaveLength(1)
    expect(result.current.eventos[0]).toMatchObject({
      tipo: 'resumo_rodada',
      payload: { texto: 'Investigo o corredor à esquerda.', rodada: 2, autorNomePersonagem: 'Thorin' },
    })
  })

  it('evento:novo com tipo acao_turno aparece em eventos', () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))
    act(() => fake.trigger('evento:historico', []))

    act(() => {
      fake.trigger('evento:novo', {
        id: 'ev-7',
        campanha_id: 'camp-1',
        autor_conta_id: 'conta-2',
        tipo: 'acao_turno',
        payload: { texto: 'Ataco o goblin com a espada.', rodada: 5, autor_nome_personagem: 'Thorin' },
        criado_em: '2026-01-01T00:06:00.000Z',
      })
    })

    expect(result.current.eventos).toHaveLength(1)
    expect(result.current.eventos[0]).toMatchObject({
      tipo: 'acao_turno',
      payload: { texto: 'Ataco o goblin com a espada.', rodada: 5, autorNomePersonagem: 'Thorin' },
    })
  })

  it('enviarResumoRodada chama a rota REST, não o socket', async () => {
    vi.mocked(aiMaster.enviarResumoRodada).mockResolvedValue(undefined)
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    await result.current.enviarResumoRodada('Investigo o corredor.')

    expect(aiMaster.enviarResumoRodada).toHaveBeenCalledWith('camp-1', 'Investigo o corredor.')
    expect(fake.emit).not.toHaveBeenCalledWith('rodada:resumo', expect.anything(), expect.anything())
  })

  it('enviarResumoRodada rejeita quando a chamada REST falha', async () => {
    vi.mocked(aiMaster.enviarResumoRodada).mockRejectedValue(new Error('Falha na requisição (500)'))
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    await expect(result.current.enviarResumoRodada('x')).rejects.toThrow('Falha na requisição (500)')
  })

  it('fecharRodada chama a rota REST, não o socket', async () => {
    vi.mocked(aiMaster.fecharRodada).mockResolvedValue(undefined)
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    await result.current.fecharRodada()

    expect(aiMaster.fecharRodada).toHaveBeenCalledWith('camp-1')
    expect(fake.emit).not.toHaveBeenCalledWith('rodada:fechar', expect.anything(), expect.anything())
  })

  it('evento:historico com tipo narracao_chegada aparece em eventos, sem número de rodada', () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    act(() => {
      fake.trigger('evento:historico', [
        {
          id: 'ev-8',
          campanha_id: 'camp-1',
          autor_conta_id: null,
          origem: 'ia',
          tipo: 'narracao_chegada',
          payload: {
            texto: 'Você desperta em uma taverna enfumaçada.',
            personagem_id: 'ficha-1',
            personagem_nome: 'Aria',
          },
          criado_em: '2026-01-01T00:07:00.000Z',
        },
      ])
    })

    expect(result.current.eventos).toHaveLength(1)
    expect(result.current.eventos[0]).toMatchObject({
      tipo: 'narracao_chegada',
      payload: {
        texto: 'Você desperta em uma taverna enfumaçada.',
        personagemId: 'ficha-1',
        personagemNome: 'Aria',
      },
    })
  })

  it('evento:historico com tipo narracao (nome real no wire, ver EventoMesa.ts do dungeons-api) aparece em eventos como narração, não como rolagem_dados vazia', () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    act(() => {
      fake.trigger('evento:historico', [
        {
          id: 'ev-9',
          campanha_id: 'camp-1',
          autor_conta_id: null,
          origem: 'ia',
          tipo: 'narracao',
          payload: { texto: 'Os goblins avançam pelo corredor.', rodada: 3 },
          criado_em: '2026-01-01T00:08:00.000Z',
        },
      ])
    })

    expect(result.current.eventos).toHaveLength(1)
    expect(result.current.eventos[0]).toMatchObject({
      tipo: 'narracao_ia',
      payload: { texto: 'Os goblins avançam pelo corredor.', rodada: 3 },
    })
  })

  it('evento:historico com tipo narracao e pedido_evento_id/respondente mapeia os campos de correlação da reação pontual', () => {
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    act(() => {
      fake.trigger('evento:historico', [
        {
          id: 'ev-10',
          campanha_id: 'camp-1',
          autor_conta_id: null,
          origem: 'ia',
          tipo: 'narracao',
          payload: {
            texto: 'Thorin desvia por pouco da lâmina giratória.',
            rodada: 3,
            pedido_evento_id: 'ev-pedido-1',
            respondente_conta_id: 'conta-2',
            respondente_nome_personagem: 'Thorin',
          },
          criado_em: '2026-01-01T00:09:00.000Z',
        },
      ])
    })

    expect(result.current.eventos[0]).toMatchObject({
      tipo: 'narracao_ia',
      payload: {
        pedidoEventoId: 'ev-pedido-1',
        respondenteContaId: 'conta-2',
        respondenteNomePersonagem: 'Thorin',
      },
    })
  })

  it('narrarChegada chama a rota REST, não o socket', async () => {
    vi.mocked(aiMaster.narrarChegadaPersonagem).mockResolvedValue(undefined)
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    await result.current.narrarChegada()

    expect(aiMaster.narrarChegadaPersonagem).toHaveBeenCalledWith('camp-1')
    expect(fake.emit).not.toHaveBeenCalledWith('rodada:chegada', expect.anything(), expect.anything())
  })

  it('narrarChegada rejeita quando a chamada REST falha', async () => {
    vi.mocked(aiMaster.narrarChegadaPersonagem).mockRejectedValue(new Error('Falha na requisição (500)'))
    const { result } = renderHook(() => useCampaignEvents('camp-1'))

    await expect(result.current.narrarChegada()).rejects.toThrow('Falha na requisição (500)')
  })
})
