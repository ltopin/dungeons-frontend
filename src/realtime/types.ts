/**
 * Tipos dos eventos de mesa recebidos pelo canal de tempo real, espelhando o
 * payload definido em `dungeons-api` (src/models/EventoMesa.ts e
 * src/services/eventosMesa.ts). O "de fio" chega em snake_case; este módulo
 * é a única camada que conhece essa diferença para os eventos de mesa.
 */

export type TipoItemFicha = 'ataque' | 'pericia' | 'talento'

export interface RolagemDadosPayload {
  tipoItem: TipoItemFicha | null
  itemId: string | null
  itemNome: string | null
  notacao: string
  dados: number[]
  bonus: number
  resultado: number
}

export interface PedidoRolagemPayload {
  destinatarioContaId: string | null
  descricao: string
}

interface EventoMesaBase {
  id: string
  campanhaId: string
  autorContaId: string
  criadoEm: string
}

export type EventoMesa =
  | (EventoMesaBase & { tipo: 'rolagem_dados'; payload: RolagemDadosPayload })
  | (EventoMesaBase & { tipo: 'pedido_rolagem'; payload: PedidoRolagemPayload })

interface EventoMesaWire {
  id: string
  campanha_id: string
  autor_conta_id: string
  tipo: 'rolagem_dados' | 'pedido_rolagem'
  payload: Record<string, unknown>
  criado_em: string
}

function mapRolagemDadosPayload(payload: Record<string, unknown>): RolagemDadosPayload {
  return {
    tipoItem: (payload.tipo_item as TipoItemFicha | null) ?? null,
    itemId: (payload.item_id as string | null) ?? null,
    itemNome: (payload.item_nome as string | null) ?? null,
    notacao: String(payload.notacao ?? ''),
    dados: Array.isArray(payload.dados) ? (payload.dados as number[]) : [],
    bonus: Number(payload.bonus ?? 0),
    resultado: Number(payload.resultado ?? 0),
  }
}

function mapPedidoRolagemPayload(payload: Record<string, unknown>): PedidoRolagemPayload {
  return {
    destinatarioContaId: (payload.destinatario_conta_id as string | null) ?? null,
    descricao: String(payload.descricao ?? ''),
  }
}

export function mapEventoFromWire(raw: EventoMesaWire): EventoMesa {
  const base: EventoMesaBase = {
    id: raw.id,
    campanhaId: raw.campanha_id,
    autorContaId: raw.autor_conta_id,
    criadoEm: raw.criado_em,
  }

  if (raw.tipo === 'pedido_rolagem') {
    return { ...base, tipo: 'pedido_rolagem', payload: mapPedidoRolagemPayload(raw.payload) }
  }
  return { ...base, tipo: 'rolagem_dados', payload: mapRolagemDadosPayload(raw.payload) }
}
