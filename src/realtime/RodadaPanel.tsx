import { useState, type FormEvent } from 'react'
import { getContaAtual } from '../auth/session'
import type { EstadoRodada } from './rodada'

/**
 * UI da sessão ao vivo conduzida por IA em modo exploração (resumo por
 * jogador, indicador de quem já respondeu, fechar rodada) e em modo combate
 * (ordem de iniciativa, turno corrente) — ver `ai-session-narration`. Vive
 * ao lado do `EventosMesaPanel`, não em uma tela própria (design.md, decisão
 * "UI de rodada/narração vive no painel de eventos já existente").
 */
export function RodadaPanel({
  rodada,
  onEnviarResumo,
  onFecharRodada,
  disabled = false,
}: {
  rodada: EstadoRodada
  onEnviarResumo: (texto: string) => Promise<void>
  onFecharRodada: () => Promise<void>
  disabled?: boolean
}) {
  if (rodada.modo === 'combate') {
    return <CombateTurnoPanel rodada={rodada} />
  }
  return <ResumoRodadaPanel rodada={rodada} onEnviarResumo={onEnviarResumo} onFecharRodada={onFecharRodada} disabled={disabled} />
}

function ResumoRodadaPanel({
  rodada,
  onEnviarResumo,
  onFecharRodada,
  disabled,
}: {
  rodada: EstadoRodada
  onEnviarResumo: (texto: string) => Promise<void>
  onFecharRodada: () => Promise<void>
  disabled: boolean
}) {
  const contaId = getContaAtual()?.id
  const meuParticipante = rodada.participantes.find((p) => p.contaId === contaId)
  const jaEnviei = meuParticipante?.resumoEnviado ?? false
  const pendentes = rodada.participantes.filter((p) => !p.resumoEnviado)

  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [fechando, setFechando] = useState(false)
  const [erroFechar, setErroFechar] = useState<string | null>(null)

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setErroEnvio(null)
    setEnviando(true)
    onEnviarResumo(texto.trim()).then(
      () => {
        setEnviando(false)
        setTexto('')
      },
      () => {
        setEnviando(false)
        setErroEnvio('Não foi possível enviar seu resumo agora.')
      },
    )
  }

  function fechar() {
    setErroFechar(null)
    setFechando(true)
    onFecharRodada().then(
      () => setFechando(false),
      () => {
        setFechando(false)
        setErroFechar('Não foi possível fechar a rodada agora.')
      },
    )
  }

  return (
    <section aria-label="Rodada" className="panel rodada-panel">
      <div className="section-header">
        <h2>Rodada {rodada.rodada}</h2>
      </div>

      <form onSubmit={enviar} aria-label="Resumo da rodada">
        <label htmlFor="rodada-resumo-texto">{jaEnviei ? 'Seu resumo (já enviado)' : 'Seu resumo da rodada'}</label>
        <textarea
          id="rodada-resumo-texto"
          rows={3}
          value={texto}
          placeholder="O que seu personagem faz nesta rodada?"
          onChange={(e) => setTexto(e.target.value)}
          disabled={disabled || enviando}
        />
        <button type="submit" className="roll-btn" disabled={disabled || enviando || !texto.trim()}>
          {enviando ? 'Enviando…' : jaEnviei ? 'Atualizar resumo' : 'Enviar resumo'}
        </button>
        {jaEnviei && (
          <p className="hint" role="status">
            Resumo enviado — você já pode aguardar o fechamento da rodada.
          </p>
        )}
        {erroEnvio && (
          <p role="alert" className="save-status save-status--erro">
            {erroEnvio}
          </p>
        )}
      </form>

      <div className="rodada-panel__participantes">
        <h3>Quem já respondeu</h3>
        <ul>
          {rodada.participantes.map((p) => (
            <li key={p.contaId} data-respondeu={p.resumoEnviado}>
              {p.nome} {p.resumoEnviado ? '✓' : '— aguardando'}
            </li>
          ))}
        </ul>
      </div>

      <div className="wizard-step-actions">
        <button type="button" className="add-btn" onClick={fechar} disabled={disabled || fechando}>
          {fechando ? 'Fechando rodada…' : 'Fechar rodada'}
        </button>
        {pendentes.length > 0 && (
          <span className="hint">
            Ainda faltam responder: {pendentes.map((p) => p.nome).join(', ')}. Você pode fechar mesmo assim.
          </span>
        )}
      </div>
      {erroFechar && (
        <p role="alert" className="save-status save-status--erro">
          {erroFechar}
        </p>
      )}
    </section>
  )
}

function CombateTurnoPanel({ rodada }: { rodada: EstadoRodada }) {
  const contaId = getContaAtual()?.id
  const meuTurno = rodada.turnoAtualContaId !== null && rodada.turnoAtualContaId === contaId
  const nomeDoTurno = rodada.ordemIniciativa?.find((item) => item.contaId === rodada.turnoAtualContaId)?.nome

  return (
    <section aria-label="Combate" className="panel rodada-panel rodada-panel--combate">
      <div className="section-header">
        <h2>Combate — Rodada {rodada.rodada}</h2>
      </div>

      <ol className="rodada-panel__iniciativa">
        {(rodada.ordemIniciativa ?? []).map((item, indice) => (
          <li
            key={item.contaId ?? `${item.nome}-${indice}`}
            aria-current={item.contaId !== null && item.contaId === rodada.turnoAtualContaId}
          >
            <span>{item.nome}</span>
            <span className="rodada-panel__iniciativa-valor">iniciativa {item.iniciativa}</span>
          </li>
        ))}
      </ol>

      <p className="hint" role="status">
        {meuTurno ? 'É a sua vez de agir.' : `Aguardando a vez de ${nomeDoTurno ?? 'outro combatente'}.`}
      </p>
    </section>
  )
}
