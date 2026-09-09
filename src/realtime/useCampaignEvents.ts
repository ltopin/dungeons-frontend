import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { getToken } from '../auth/session'
import { mapEventoFromWire, type EventoMesa, type TipoItemFicha } from './types'
import { mapEstadoRodadaFromWire, type EstadoRodada } from './rodada'

/**
 * Mesma origem usada para as chamadas REST (ver src/api/client.ts) — o
 * `dungeons-api` anexa o Socket.IO ao mesmo `http.Server` da aplicação, sem
 * prefixo `/api`. Se a env não define uma URL absoluta, conecta na origem
 * atual da página.
 */
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || undefined

export type ConexaoEventosStatus = 'conectando' | 'conectado' | 'reconectando' | 'indisponivel'

type AckResponse<T = unknown> = { ok: true; data?: T } | { ok: false; error: string }

export interface EmitirRolagemItemInput {
  tipoItem: TipoItemFicha
  itemId: string
}

export interface EmitirRolagemLivreInput {
  notacao: string
}

export type EmitirRolagemInput = EmitirRolagemItemInput | EmitirRolagemLivreInput

export interface PedirRolagemInput {
  destinatarioContaId?: string
  descricao: string
}

export interface UseCampaignEventsResult {
  eventos: EventoMesa[]
  status: ConexaoEventosStatus
  emitirRolagem: (input: EmitirRolagemInput) => Promise<EventoMesa>
  pedirRolagem: (input: PedirRolagemInput) => Promise<EventoMesa>
  reconectar: () => void
  /** Estado da rodada corrente (`ai-session-narration`) — `null` fora do fluxo de mestre-IA. */
  rodada: EstadoRodada | null
  enviarResumoRodada: (texto: string) => Promise<void>
  fecharRodada: () => Promise<void>
}

function ackParaEvento(resposta: AckResponse, rejeitarMsg: string): Promise<EventoMesa> {
  if (resposta.ok) {
    return Promise.resolve(mapEventoFromWire(resposta.data as Parameters<typeof mapEventoFromWire>[0]))
  }
  return Promise.reject(new Error(resposta.error || rejeitarMsg))
}

export function useCampaignEvents(campanhaId: string | undefined): UseCampaignEventsResult {
  const [eventos, setEventos] = useState<EventoMesa[]>([])
  const [status, setStatus] = useState<ConexaoEventosStatus>('conectando')
  const [rodada, setRodada] = useState<EstadoRodada | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!campanhaId) return undefined

    setEventos([])
    setStatus('conectando')
    setRodada(null)

    const socket: Socket = io(SOCKET_URL, {
      auth: { token: getToken() ?? undefined },
    })
    socketRef.current = socket

    function entrarNaSala(): void {
      socket.emit('sala:entrar', { campanha_id: campanhaId }, (resposta: AckResponse) => {
        if (!resposta?.ok) setStatus('indisponivel')
      })
    }

    socket.on('connect', entrarNaSala)

    socket.on('evento:historico', (historico: unknown) => {
      const lista = Array.isArray(historico) ? historico : []
      setEventos(lista.map((item) => mapEventoFromWire(item as Parameters<typeof mapEventoFromWire>[0])))
      setStatus('conectado')
    })

    socket.on('evento:novo', (evento: unknown) => {
      setEventos((atual) => [...atual, mapEventoFromWire(evento as Parameters<typeof mapEventoFromWire>[0])])
    })

    socket.on('rodada:estado', (estado: unknown) => {
      setRodada(mapEstadoRodadaFromWire(estado as Parameters<typeof mapEstadoRodadaFromWire>[0]))
    })

    socket.on('connect_error', () => setStatus('indisponivel'))
    socket.io.on('reconnect_attempt', () => setStatus('reconectando'))
    socket.io.on('reconnect', entrarNaSala)
    socket.io.on('reconnect_failed', () => setStatus('indisponivel'))

    socket.on('disconnect', (reason: string) => {
      if (reason === 'io client disconnect') return
      setStatus('reconectando')
    })

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [campanhaId])

  function emitirRolagem(input: EmitirRolagemInput): Promise<EventoMesa> {
    const socket = socketRef.current
    if (!socket || !campanhaId) {
      return Promise.reject(new Error('Conexão de tempo real indisponível'))
    }

    const payload: Record<string, unknown> = { campanha_id: campanhaId }
    if ('itemId' in input) {
      payload.tipo_item = input.tipoItem
      payload.item_id = input.itemId
    } else {
      payload.notacao = input.notacao
    }

    return new Promise((resolve, reject) => {
      socket.emit('rolagem:emitir', payload, (resposta: AckResponse) => {
        ackParaEvento(resposta, 'Não foi possível enviar a rolagem').then(resolve, reject)
      })
    })
  }

  function pedirRolagem(input: PedirRolagemInput): Promise<EventoMesa> {
    const socket = socketRef.current
    if (!socket || !campanhaId) {
      return Promise.reject(new Error('Conexão de tempo real indisponível'))
    }

    const payload = {
      campanha_id: campanhaId,
      destinatario_conta_id: input.destinatarioContaId,
      descricao: input.descricao,
    }

    return new Promise((resolve, reject) => {
      socket.emit('rolagem:pedir', payload, (resposta: AckResponse) => {
        ackParaEvento(resposta, 'Não foi possível enviar o pedido').then(resolve, reject)
      })
    })
  }

  // O cliente Socket.IO para de tentar reconectar sozinho após
  // `reconnect_failed` (status 'indisponivel'); esta é a única forma de
  // retomar a partir daí sem recarregar a página inteira.
  function reconectar(): void {
    const socket = socketRef.current
    if (!socket) return
    setStatus('reconectando')
    socket.connect()
  }

  function enviarResumoRodada(texto: string): Promise<void> {
    const socket = socketRef.current
    if (!socket || !campanhaId) {
      return Promise.reject(new Error('Conexão de tempo real indisponível'))
    }

    return new Promise((resolve, reject) => {
      socket.emit('rodada:resumo', { campanha_id: campanhaId, texto }, (resposta: AckResponse) => {
        if (resposta?.ok) resolve()
        else reject(new Error(resposta?.error || 'Não foi possível enviar o resumo da rodada'))
      })
    })
  }

  function fecharRodada(): Promise<void> {
    const socket = socketRef.current
    if (!socket || !campanhaId) {
      return Promise.reject(new Error('Conexão de tempo real indisponível'))
    }

    return new Promise((resolve, reject) => {
      socket.emit('rodada:fechar', { campanha_id: campanhaId }, (resposta: AckResponse) => {
        if (resposta?.ok) resolve()
        else reject(new Error(resposta?.error || 'Não foi possível fechar a rodada'))
      })
    })
  }

  return { eventos, status, emitirRolagem, pedirRolagem, reconectar, rodada, enviarResumoRodada, fecharRodada }
}
