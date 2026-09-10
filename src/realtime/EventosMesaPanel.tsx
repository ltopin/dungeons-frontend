import { useEffect, useRef } from 'react'
import { getContaAtual } from '../auth/session'
import type { ConexaoEventosStatus } from './useCampaignEvents'
import type { EventoMesa } from './types'

const ROTULO_STATUS: Record<Exclude<ConexaoEventosStatus, 'conectado'>, string> = {
  conectando: 'Conectando ao canal de eventos…',
  reconectando: 'Conexão perdida — tentando reconectar…',
  indisponivel: 'Conexão em tempo real indisponível.',
}

function origemRolagem(payload: EventoMesa['payload'] & { itemNome?: string | null; notacao?: string }): string {
  if ('itemNome' in payload && payload.itemNome) return payload.itemNome
  return 'notacao' in payload ? payload.notacao ?? '' : ''
}

function descreverEvento(evento: EventoMesa): { titulo: string; detalhe: string } {
  if (evento.tipo === 'rolagem_dados') {
    const autor =
      evento.autorContaId === getContaAtual()?.id
        ? 'Você'
        : evento.payload.autorNomePersonagem ?? 'Um jogador'
    return {
      titulo: `${autor} rolou ${origemRolagem(evento.payload)}`,
      detalhe: `Resultado: ${evento.payload.resultado}`,
    }
  }

  if (evento.tipo === 'pedido_rolagem') {
    const alvo = evento.payload.destinatarioContaId
      ? evento.payload.destinatarioNomePersonagem ?? 'um jogador'
      : 'toda a mesa'
    return {
      titulo: `${evento.origem === 'ia' ? 'A IA' : 'Mestre'} pediu uma rolagem para ${alvo}`,
      detalhe: evento.payload.descricao,
    }
  }

  if (evento.tipo === 'narracao_ia') {
    return {
      titulo: `Narração da rodada ${evento.payload.rodada}`,
      detalhe: evento.payload.texto,
    }
  }

  if (evento.tipo === 'narracao_chegada') {
    return {
      titulo: `Chegada de ${evento.payload.personagemNome}`,
      detalhe: evento.payload.texto,
    }
  }

  if (evento.tipo === 'resumo_rodada') {
    const autor =
      evento.autorContaId === getContaAtual()?.id
        ? 'Você'
        : evento.payload.autorNomePersonagem ?? 'Um jogador'
    return {
      titulo: `Resumo de ${autor}`,
      detalhe: evento.payload.texto,
    }
  }

  if (evento.tipo === 'acao_turno') {
    const autor =
      evento.autorContaId === getContaAtual()?.id
        ? 'Você'
        : evento.payload.autorNomePersonagem ?? 'Um jogador'
    return {
      titulo: `Ação de ${autor}`,
      detalhe: evento.payload.texto,
    }
  }

  const rotuloModo = (modo: 'exploracao' | 'combate') => (modo === 'combate' ? 'combate' : 'exploração')
  return {
    titulo:
      evento.payload.modoNovo === 'combate'
        ? 'A IA iniciou o combate'
        : `A IA encerrou o combate — voltando ao modo ${rotuloModo(evento.payload.modoNovo)}`,
    detalhe: `${rotuloModo(evento.payload.modoAnterior)} → ${rotuloModo(evento.payload.modoNovo)}`,
  }
}

function extrairRodada(evento: EventoMesa): number | null {
  switch (evento.tipo) {
    case 'narracao_ia':
    case 'resumo_rodada':
    case 'acao_turno':
      return evento.payload.rodada
    default:
      return null
  }
}

type ItemEventos = { tipo: 'divisor'; rodada: number } | { tipo: 'evento'; evento: EventoMesa }

function agruparEventosPorRodada(eventos: EventoMesa[]): ItemEventos[] {
  const itens: ItemEventos[] = []
  let rodadaAtual: number | null = null
  for (const evento of eventos) {
    const rodadaEvento = extrairRodada(evento)
    if (rodadaEvento !== null && rodadaEvento !== rodadaAtual) {
      itens.push({ tipo: 'divisor', rodada: rodadaEvento })
      rodadaAtual = rodadaEvento
    }
    itens.push({ tipo: 'evento', evento })
  }
  return itens
}

function EventoItem({ evento }: { evento: EventoMesa }) {
  const { titulo, detalhe } = descreverEvento(evento)
  const deChegada = evento.tipo === 'narracao_chegada'
  const deIA = evento.origem === 'ia'
  return (
    <li
      data-origem={evento.origem}
      className={deChegada ? 'eventos-mesa__item--chegada' : deIA ? 'eventos-mesa__item--ia' : undefined}
    >
      {deChegada && (
        <span className="eventos-mesa__origem-chegada" aria-label="Narração de chegada">
          CHEGADA
        </span>
      )}
      {deIA && !deChegada && (
        <span className="eventos-mesa__origem-ia" aria-label="Evento gerado pela IA">
          IA
        </span>
      )}
      <strong>{titulo}</strong>
      <span className="eventos-mesa__detalhe">{detalhe}</span>
    </li>
  )
}

const STATUS_CLASSE: Record<Exclude<ConexaoEventosStatus, 'conectado'>, string> = {
  conectando: 'eventos-mesa__status--info',
  reconectando: 'eventos-mesa__status--aviso',
  indisponivel: 'eventos-mesa__status--erro',
}

export function EventosMesaPanel({
  eventos,
  status,
  onReconectar,
}: {
  eventos: EventoMesa[]
  status: ConexaoEventosStatus
  onReconectar?: () => void
}) {
  // A lista tem altura limitada (ver styles.css) para não empurrar o resto
  // da ficha para baixo à medida que a mesa acumula eventos — em vez disso,
  // rola para o evento mais recente a cada novo evento, como um chat.
  const listaRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const lista = listaRef.current
    if (lista) lista.scrollTop = lista.scrollHeight
  }, [eventos.length])

  return (
    <section aria-label="Eventos de mesa" className="panel eventos-mesa">
      <div className="section-header">
        <h2>Eventos de mesa</h2>
        {status !== 'conectado' && (
          <span role="status" className={`eventos-mesa__status ${STATUS_CLASSE[status]}`}>
            {ROTULO_STATUS[status]}
            {status === 'indisponivel' && onReconectar && (
              <button type="button" className="save-status__retry" onClick={onReconectar}>
                Tentar reconectar
              </button>
            )}
          </span>
        )}
      </div>

      {eventos.length === 0 && status === 'conectado' && (
        <p className="hint">Nenhum evento nesta mesa ainda.</p>
      )}
      {eventos.length === 0 && status !== 'conectado' && (
        <p className="hint">Sem eventos disponíveis no momento.</p>
      )}

      {eventos.length > 0 && (
        <ul className="eventos-mesa__list" ref={listaRef}>
          {agruparEventosPorRodada(eventos).map((item) =>
            item.tipo === 'divisor' ? (
              <li
                key={`divisor-${item.rodada}`}
                className="eventos-mesa__divisor"
                role="separator"
                aria-label={`Rodada ${item.rodada}`}
              >
                Rodada {item.rodada}
              </li>
            ) : (
              <EventoItem key={item.evento.id} evento={item.evento} />
            ),
          )}
        </ul>
      )}
    </section>
  )
}
