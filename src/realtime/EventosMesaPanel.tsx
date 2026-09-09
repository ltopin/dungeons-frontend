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

  const rotuloModo = (modo: 'exploracao' | 'combate') => (modo === 'combate' ? 'combate' : 'exploração')
  return {
    titulo:
      evento.payload.modoNovo === 'combate'
        ? 'A IA iniciou o combate'
        : `A IA encerrou o combate — voltando ao modo ${rotuloModo(evento.payload.modoNovo)}`,
    detalhe: `${rotuloModo(evento.payload.modoAnterior)} → ${rotuloModo(evento.payload.modoNovo)}`,
  }
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
        <ul className="eventos-mesa__list">
          {eventos.map((evento) => {
            const { titulo, detalhe } = descreverEvento(evento)
            const deIA = evento.origem === 'ia'
            return (
              <li key={evento.id} data-origem={evento.origem} className={deIA ? 'eventos-mesa__item--ia' : undefined}>
                {deIA && (
                  <span className="eventos-mesa__origem-ia" aria-label="Evento gerado pela IA">
                    IA
                  </span>
                )}
                <strong>{titulo}</strong>
                <span className="eventos-mesa__detalhe">{detalhe}</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
