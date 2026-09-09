/**
 * Tipos dos eventos de mesa recebidos pelo canal de tempo real, espelhando o
 * payload definido em `dungeons-api` (src/models/EventoMesa.ts e
 * src/services/eventosMesa.ts). O "de fio" chega em snake_case; este módulo
 * é a única camada que conhece essa diferença para os eventos de mesa.
 */

export type TipoItemFicha = 'ataque' | 'pericia' | 'talento'

/** Origem de um evento de mesa — `'ia'` para narração/mudanças de modo geradas pelo mestre-IA. */
export type OrigemEvento = 'ia' | 'jogador'

export interface RolagemDadosPayload {
  tipoItem: TipoItemFicha | null
  itemId: string | null
  itemNome: string | null
  notacao: string
  dados: number[]
  bonus: number
  resultado: number
  autorNomePersonagem: string | null
}

export interface PedidoRolagemPayload {
  destinatarioContaId: string | null
  destinatarioNomePersonagem: string | null
  descricao: string
}

export interface NarracaoIaPayload {
  texto: string
  rodada: number
}

export interface OrdemIniciativaItem {
  contaId: string | null
  nome: string
  iniciativa: number
}

export interface MudancaModoPayload {
  modoAnterior: 'exploracao' | 'combate'
  modoNovo: 'exploracao' | 'combate'
  ordemIniciativa: OrdemIniciativaItem[] | null
}

interface EventoMesaBase {
  id: string
  campanhaId: string
  /** Nulo para eventos gerados pela IA — ver `origem`. */
  autorContaId: string | null
  origem: OrigemEvento
  criadoEm: string
}

export type EventoMesa =
  | (EventoMesaBase & { tipo: 'rolagem_dados'; payload: RolagemDadosPayload })
  | (EventoMesaBase & { tipo: 'pedido_rolagem'; payload: PedidoRolagemPayload })
  | (EventoMesaBase & { tipo: 'narracao_ia'; payload: NarracaoIaPayload })
  | (EventoMesaBase & { tipo: 'mudanca_modo'; payload: MudancaModoPayload })

interface EventoMesaWire {
  id: string
  campanha_id: string
  autor_conta_id: string | null
  origem?: OrigemEvento
  tipo: 'rolagem_dados' | 'pedido_rolagem' | 'narracao_ia' | 'mudanca_modo'
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
    autorNomePersonagem: (payload.autor_nome_personagem as string | null) ?? null,
  }
}

function mapPedidoRolagemPayload(payload: Record<string, unknown>): PedidoRolagemPayload {
  return {
    destinatarioContaId: (payload.destinatario_conta_id as string | null) ?? null,
    destinatarioNomePersonagem: (payload.destinatario_nome_personagem as string | null) ?? null,
    descricao: String(payload.descricao ?? ''),
  }
}

function mapNarracaoIaPayload(payload: Record<string, unknown>): NarracaoIaPayload {
  return {
    texto: String(payload.texto ?? ''),
    rodada: Number(payload.rodada ?? 0),
  }
}

function mapOrdemIniciativa(raw: unknown): OrdemIniciativaItem[] | null {
  if (!Array.isArray(raw)) return null
  return raw.map((item) => {
    const entrada = item as Record<string, unknown>
    return {
      contaId: (entrada.conta_id as string | null) ?? null,
      nome: String(entrada.nome ?? ''),
      iniciativa: Number(entrada.iniciativa ?? 0),
    }
  })
}

function mapMudancaModoPayload(payload: Record<string, unknown>): MudancaModoPayload {
  return {
    modoAnterior: (payload.modo_anterior as 'exploracao' | 'combate') ?? 'exploracao',
    modoNovo: (payload.modo_novo as 'exploracao' | 'combate') ?? 'exploracao',
    ordemIniciativa: mapOrdemIniciativa(payload.ordem_iniciativa),
  }
}

export function mapEventoFromWire(raw: EventoMesaWire): EventoMesa {
  const base: EventoMesaBase = {
    id: raw.id,
    campanhaId: raw.campanha_id,
    autorContaId: raw.autor_conta_id,
    origem: raw.origem ?? (raw.autor_conta_id ? 'jogador' : 'ia'),
    criadoEm: raw.criado_em,
  }

  switch (raw.tipo) {
    case 'pedido_rolagem':
      return { ...base, tipo: 'pedido_rolagem', payload: mapPedidoRolagemPayload(raw.payload) }
    case 'narracao_ia':
      return { ...base, tipo: 'narracao_ia', payload: mapNarracaoIaPayload(raw.payload) }
    case 'mudanca_modo':
      return { ...base, tipo: 'mudanca_modo', payload: mapMudancaModoPayload(raw.payload) }
    default:
      return { ...base, tipo: 'rolagem_dados', payload: mapRolagemDadosPayload(raw.payload) }
  }
}
