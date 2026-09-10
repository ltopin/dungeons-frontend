import { useEffect, useState, type FormEvent } from 'react'
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
    return <CombateTurnoPanel rodada={rodada} onEnviarResumo={onEnviarResumo} disabled={disabled} />
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
  const respondentes = rodada.participantes.filter((p) => p.resumoEnviado)

  const [texto, setTexto] = useState(() => meuParticipante?.resumoTexto ?? '')
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [fechando, setFechando] = useState(false)
  const [erroFechar, setErroFechar] = useState<string | null>(null)
  const [pedindoConfirmacao, setPedindoConfirmacao] = useState(false)

  // Nova rodada: recomeça o campo a partir do resumo dela (normalmente
  // nenhum ainda) e fecha uma confirmação de fechamento que ficou aberta da
  // rodada anterior — os pendentes agora são de outra rodada.
  useEffect(() => {
    setTexto(meuParticipante?.resumoTexto ?? '')
    setPedindoConfirmacao(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só a troca de rodada deve resetar o campo
  }, [rodada.rodada])

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setErroEnvio(null)
    setEnviando(true)
    onEnviarResumo(texto.trim()).then(
      () => setEnviando(false),
      () => {
        setEnviando(false)
        setErroEnvio('Não foi possível enviar seu resumo agora.')
      },
    )
  }

  function pedirFechamento() {
    if (pendentes.length > 0) {
      setPedindoConfirmacao(true)
      return
    }
    fechar()
  }

  function fechar() {
    setPedindoConfirmacao(false)
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

  // Se os pendentes zeraram enquanto a confirmação estava aberta (ex.: alguém
  // respondeu em tempo real nesse meio-tempo), volta pro botão simples.
  const confirmandoFechamento = pedindoConfirmacao && pendentes.length > 0

  return (
    <section aria-label="Rodada" className="panel rodada-panel">
      <div className="section-header">
        <h2>Rodada {rodada.rodada}</h2>
      </div>

      <form onSubmit={enviar} aria-label="Resumo da rodada">
        <label htmlFor="rodada-resumo-texto">{jaEnviei ? 'Seu resumo (já enviado)' : 'Seu resumo da rodada'}</label>
        <textarea
          id="rodada-resumo-texto"
          className="rodada-panel__resumo-texto"
          rows={4}
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
        {pendentes.length > 0 && (
          <div className="rodada-panel__participantes-grupo">
            <span className="rodada-panel__participantes-rotulo">Aguardando ({pendentes.length})</span>
            <ul>
              {pendentes.map((p) => (
                <li key={p.contaId} data-respondeu={false}>
                  {p.nome}: {p.resumoTexto ?? '— aguardando'}
                </li>
              ))}
            </ul>
          </div>
        )}
        {respondentes.length > 0 && (
          <div className="rodada-panel__participantes-grupo rodada-panel__participantes-grupo--respondidos">
            <span className="rodada-panel__participantes-rotulo">Responderam ({respondentes.length})</span>
            <ul>
              {respondentes.map((p) => (
                <li key={p.contaId} data-respondeu={true}>
                  {p.nome}: {p.resumoTexto ?? '✓'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rodada-panel__fechar">
        {!confirmandoFechamento && (
          <button
            type="button"
            className="rodada-panel__fechar-btn"
            onClick={pedirFechamento}
            disabled={disabled || fechando}
          >
            {fechando ? 'Fechando rodada…' : 'Fechar rodada'}
          </button>
        )}
        {confirmandoFechamento && (
          <div
            className="rodada-panel__fechar-confirm"
            role="alertdialog"
            aria-label="Confirmar fechamento da rodada"
          >
            <p>
              <strong>
                {pendentes.length} {pendentes.length === 1 ? 'jogador ainda não respondeu' : 'jogadores ainda não responderam'}:
              </strong>{' '}
              {pendentes.map((p) => p.nome).join(', ')}. Fechar agora avança a rodada{' '}
              {pendentes.length === 1 ? 'sem essa resposta' : 'sem essas respostas'}.
            </p>
            <div className="rodada-panel__fechar-confirm-actions">
              <button
                type="button"
                className="rodada-panel__fechar-btn rodada-panel__fechar-btn--confirmar"
                onClick={fechar}
                disabled={disabled || fechando}
              >
                {fechando ? 'Fechando rodada…' : 'Fechar mesmo assim'}
              </button>
              <button
                type="button"
                className="rodada-panel__fechar-cancelar"
                onClick={() => setPedindoConfirmacao(false)}
                disabled={fechando}
              >
                Cancelar
              </button>
            </div>
          </div>
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

function CombateTurnoPanel({
  rodada,
  onEnviarResumo,
  disabled,
}: {
  rodada: EstadoRodada
  onEnviarResumo: (texto: string) => Promise<void>
  disabled: boolean
}) {
  const contaId = getContaAtual()?.id
  const meuTurno = rodada.turnoAtualContaId !== null && rodada.turnoAtualContaId === contaId
  const nomeDoTurno = rodada.ordemIniciativa?.find((item) => item.contaId === rodada.turnoAtualContaId)?.nome

  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)

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
        setErroEnvio('Não foi possível enviar sua ação agora.')
      },
    )
  }

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

      <p className={meuTurno ? 'rodada-panel__seu-turno' : 'hint'} role="status">
        {meuTurno ? 'É a sua vez de agir.' : `Aguardando a vez de ${nomeDoTurno ?? 'outro combatente'}.`}
      </p>

      {meuTurno && (
        <form onSubmit={enviar} aria-label="Ação do turno">
          <label htmlFor="rodada-combate-acao-texto">O que seu personagem faz neste turno?</label>
          <textarea
            id="rodada-combate-acao-texto"
            className="rodada-panel__resumo-texto"
            rows={4}
            value={texto}
            placeholder="Descreva sua ação de combate…"
            onChange={(e) => setTexto(e.target.value)}
            disabled={disabled || enviando}
          />
          <button type="submit" className="roll-btn" disabled={disabled || enviando || !texto.trim()}>
            {enviando ? 'Enviando…' : 'Agir'}
          </button>
          {erroEnvio && (
            <p role="alert" className="save-status save-status--erro">
              {erroEnvio}
            </p>
          )}
        </form>
      )}
    </section>
  )
}
