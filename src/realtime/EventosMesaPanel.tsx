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
  const autor = evento.autorContaId === getContaAtual()?.id ? 'Você' : 'Um jogador'

  if (evento.tipo === 'rolagem_dados') {
    return {
      titulo: `${autor} rolou ${origemRolagem(evento.payload)}`,
      detalhe: `Resultado: ${evento.payload.resultado}`,
    }
  }

  const alvo = evento.payload.destinatarioContaId ? 'um jogador' : 'toda a mesa'
  return {
    titulo: `Mestre pediu uma rolagem para ${alvo}`,
    detalhe: evento.payload.descricao,
  }
}

export function EventosMesaPanel({
  eventos,
  status,
}: {
  eventos: EventoMesa[]
  status: ConexaoEventosStatus
}) {
  return (
    <section aria-label="Eventos de mesa" className="panel eventos-mesa">
      <div className="section-header">
        <h2>Eventos de mesa</h2>
        {status !== 'conectado' && <span role="status">{ROTULO_STATUS[status]}</span>}
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
            return (
              <li key={evento.id}>
                <strong>{titulo}</strong>
                <span>{detalhe}</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
