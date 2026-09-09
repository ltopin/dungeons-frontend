import type { OrdemIniciativaItem } from './types'

export interface ParticipanteRodada {
  contaId: string
  nome: string
  resumoEnviado: boolean
}

/**
 * Estado da rodada corrente de uma campanha conduzida por IA (`ai-session-narration`).
 * Ausente para campanhas com mestre humano — só chega pelo canal de tempo
 * real quando o backend reconhece a campanha como `mestre === 'ia'`.
 */
export interface EstadoRodada {
  modo: 'exploracao' | 'combate'
  rodada: number
  participantes: ParticipanteRodada[]
  /** Presente quando `modo === 'combate'`: ordem de iniciativa corrente. */
  ordemIniciativa: OrdemIniciativaItem[] | null
  turnoAtualContaId: string | null
}

interface EstadoRodadaWire {
  modo: 'exploracao' | 'combate'
  rodada: number
  participantes: { conta_id: string; nome: string; resumo_enviado: boolean }[]
  ordem_iniciativa?: { conta_id: string | null; nome: string; iniciativa: number }[] | null
  turno_atual_conta_id: string | null
}

export function mapEstadoRodadaFromWire(raw: EstadoRodadaWire): EstadoRodada {
  return {
    modo: raw.modo,
    rodada: raw.rodada,
    participantes: (raw.participantes ?? []).map((p) => ({
      contaId: p.conta_id,
      nome: p.nome,
      resumoEnviado: p.resumo_enviado,
    })),
    ordemIniciativa: Array.isArray(raw.ordem_iniciativa)
      ? raw.ordem_iniciativa.map((item) => ({
          contaId: item.conta_id ?? null,
          nome: item.nome,
          iniciativa: item.iniciativa,
        }))
      : null,
    turnoAtualContaId: raw.turno_atual_conta_id ?? null,
  }
}

export type { OrdemIniciativaItem }
