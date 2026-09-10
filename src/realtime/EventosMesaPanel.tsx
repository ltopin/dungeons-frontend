import { useEffect, useRef, useState, type FormEvent } from 'react'
import { getContaAtual } from '../auth/session'
import type { CatalogoRolagemEntry } from './catalogoRolagem'
import { isNotacaoDadosValida } from './notacao'
import { sugerirEntradaDoPedido } from './sugestaoRolagem'
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
    if (evento.payload.pedidoEventoId) {
      return {
        titulo: `Reação a ${evento.payload.respondenteNomePersonagem ?? 'um jogador'}`,
        detalhe: evento.payload.texto,
      }
    }
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

/**
 * Um `pedido_rolagem` é "para" o usuário atual quando é dirigido
 * especificamente a ele, ou quando é um pedido para toda a mesa (sem
 * destinatário) — usado tanto pela sugestão automática quanto pelo fallback
 * de rolagem livre (ver `pedido-rolagem-fallback-livre`/design.md).
 */
function pedidoEhParaContaAtual(
  evento: EventoMesa,
): evento is Extract<EventoMesa, { tipo: 'pedido_rolagem' }> {
  if (evento.tipo !== 'pedido_rolagem') return false
  const { destinatarioContaId } = evento.payload
  return destinatarioContaId === null || destinatarioContaId === getContaAtual()?.id
}

/**
 * Um `pedido_rolagem` "pelo NPC" traz a notação já calculada pela IA — ver
 * `rolagem-npc-delegada-jogador`/design.md, decisão 1. Detectado pela
 * presença de `npcNome` no payload, não por um tipo de evento novo.
 */
function pedidoEhPeloNpc(evento: EventoMesa): boolean {
  return evento.tipo === 'pedido_rolagem' && Boolean(evento.payload.npcNome)
}

/**
 * Sugestão exibida no card de `pedido_rolagem`. Um pedido "pelo NPC" (decisão
 * 2 do design) repassa a notação pronta a qualquer jogador, sem casar contra
 * o catálogo nem exigir que o pedido seja "para" a conta atual — ao
 * contrário do pedido comum, que só sugere quando o pedido é para o jogador
 * atual (ou para toda a mesa) e há catálogo/handler disponíveis (ausentes no
 * `MasterDashboard`, que não tem ficha própria contra a qual casar) — ver
 * `pedido-rolagem-sugere-pericia`/design.md.
 */
function sugestaoParaPedido(
  evento: EventoMesa,
  catalogoRolagem: CatalogoRolagemEntry[] | undefined,
  onRolar: ((entrada: CatalogoRolagemEntry) => void) | undefined,
): CatalogoRolagemEntry | null {
  if (!onRolar) return null
  if (evento.tipo === 'pedido_rolagem' && evento.payload.npcNome) {
    return { tipo: 'livre', rotulo: `Rolar pelo ${evento.payload.npcNome}`, notacao: evento.payload.notacao ?? '' }
  }
  if (!catalogoRolagem || !pedidoEhParaContaAtual(evento)) return null
  return sugerirEntradaDoPedido(evento.payload.descricao, catalogoRolagem)
}

/**
 * Diferente do pedido dirigido "à mesa toda" (onde cada jogador responde de
 * forma independente), um pedido "pelo NPC" admite só a primeira resposta —
 * ver `rolagem-npc-delegada-jogador`/design.md, decisão 3. Observado
 * diretamente na lista de eventos já carregada (qualquer `rolagem_dados`
 * referenciando este pedido, de qualquer autor), sem precisar de um campo de
 * estado novo no payload.
 */
function pedidoNpcJaRespondidoPorOutro(evento: EventoMesa, eventos: EventoMesa[]): boolean {
  if (!pedidoEhPeloNpc(evento)) return false
  return eventos.some((item) => item.tipo === 'rolagem_dados' && item.payload.pedidoEventoId === evento.id)
}

function rotuloSugestao(entrada: CatalogoRolagemEntry): string {
  if (entrada.tipo === 'livre') return `${entrada.rotulo}: ${entrada.notacao}`
  return entrada.valor ? `${entrada.rotulo}: ${entrada.valor}` : entrada.rotulo
}

/**
 * Fallback sempre disponível no card de um `pedido_rolagem`, independente de
 * a sugestão automática ter encontrado correspondência no catálogo — ver
 * `pedido-rolagem-fallback-livre`/design.md, decisão 1. Constrói uma
 * `CatalogoRolagemEntry` do tipo `livre` a partir da notação digitada e
 * reaproveita o mesmo `onRolar` já usado pela sugestão, sem novo contrato.
 * Não é desabilitado após o envio (decisão 4): precisa continuar disponível
 * para um pedido composto (ex.: rolar o ataque e, depois, o dano).
 */
function RespostaLivrePedido({
  eventoId,
  onRolar,
}: {
  eventoId: string
  onRolar: (entrada: CatalogoRolagemEntry) => void
}) {
  const [notacao, setNotacao] = useState('')
  const [erroValidacao, setErroValidacao] = useState<string | null>(null)
  const inputId = `resposta-livre-${eventoId}`

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!isNotacaoDadosValida(notacao)) {
      setErroValidacao('Notação de dados inválida. Use um formato como 2d6+3.')
      return
    }
    setErroValidacao(null)
    onRolar({ tipo: 'livre', rotulo: 'Rolagem livre', notacao: notacao.trim() })
    setNotacao('')
  }

  return (
    <form
      className="eventos-mesa__resposta-livre"
      onSubmit={submit}
      aria-label="Responder a este pedido com uma rolagem livre"
    >
      <label htmlFor={inputId} className="field-label">
        Notação (ex.: 2d6+3)
      </label>
      <div className="eventos-mesa__resposta-livre-row">
        <input
          id={inputId}
          type="text"
          placeholder="2d6+3"
          value={notacao}
          onChange={(e) => setNotacao(e.target.value)}
        />
        <button type="submit" className="roll-btn" disabled={notacao.trim() === ''}>
          Rolar livre
        </button>
      </div>
      {erroValidacao && (
        <p role="alert" className="save-status save-status--erro">
          {erroValidacao}
        </p>
      )}
    </form>
  )
}

/**
 * Reação pontual: um `narracao_ia` com `pedidoEventoId` respondendo, assim
 * que produzida, a um `pedido_rolagem` específico — ver
 * `pedido-rolagem-reacao-imediata`/design.md, decisão 4. Localiza o
 * `pedido_rolagem`/`rolagem_dados` originais na lista já carregada para
 * associar a reação visualmente a eles; retorna nulls (sem ocultar a
 * reação) quando o pedido está fora da janela de eventos carregada.
 */
function contextoDaReacao(
  evento: EventoMesa,
  eventos: EventoMesa[],
): {
  pedido: Extract<EventoMesa, { tipo: 'pedido_rolagem' }> | null
  rolagem: Extract<EventoMesa, { tipo: 'rolagem_dados' }> | null
} | null {
  if (evento.tipo !== 'narracao_ia' || !evento.payload.pedidoEventoId) return null
  const { pedidoEventoId } = evento.payload
  const pedido =
    eventos.find(
      (item): item is Extract<EventoMesa, { tipo: 'pedido_rolagem' }> =>
        item.tipo === 'pedido_rolagem' && item.id === pedidoEventoId,
    ) ?? null
  const rolagem =
    eventos.find(
      (item): item is Extract<EventoMesa, { tipo: 'rolagem_dados' }> =>
        item.tipo === 'rolagem_dados' && item.payload.pedidoEventoId === pedidoEventoId,
    ) ?? null
  return { pedido, rolagem }
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

function EventoItem({
  evento,
  eventos,
  catalogoRolagem,
  onRolar,
  jaRolado,
}: {
  evento: EventoMesa
  /** Lista completa já carregada — usada para localizar o pedido/rolagem originais de uma reação pontual. */
  eventos: EventoMesa[]
  catalogoRolagem?: CatalogoRolagemEntry[]
  onRolar?: (entrada: CatalogoRolagemEntry) => void
  /** A sugestão deste pedido específico já foi disparada nesta sessão — ver `EventosMesaPanel`. */
  jaRolado?: boolean
}) {
  const { titulo, detalhe } = descreverEvento(evento)
  const deChegada = evento.tipo === 'narracao_chegada'
  const deIA = evento.origem === 'ia'
  const sugestao = sugestaoParaPedido(evento, catalogoRolagem, onRolar)
  // Uma resposta de outro jogador já resolveu este pedido pelo NPC — some
  // para quem não foi quem respondeu (`jaRolado` continua cobrindo o próprio
  // clique otimista, exibido como "Rolado" desabilitado abaixo).
  const ocultarPorRespostaDeOutro = !jaRolado && pedidoNpcJaRespondidoPorOutro(evento, eventos)
  const contextoReacao = contextoDaReacao(evento, eventos)
  const ehReacao = contextoReacao !== null
  return (
    <li
      data-origem={evento.origem}
      className={
        ehReacao
          ? 'eventos-mesa__item--reacao'
          : deChegada
            ? 'eventos-mesa__item--chegada'
            : deIA
              ? 'eventos-mesa__item--ia'
              : undefined
      }
    >
      {ehReacao && (
        <span className="eventos-mesa__origem-reacao" aria-label="Reação a um pedido de rolagem">
          REAÇÃO
        </span>
      )}
      {!ehReacao && deChegada && (
        <span className="eventos-mesa__origem-chegada" aria-label="Narração de chegada">
          CHEGADA
        </span>
      )}
      {!ehReacao && deIA && !deChegada && (
        <span className="eventos-mesa__origem-ia" aria-label="Evento gerado pela IA">
          IA
        </span>
      )}
      <strong>{titulo}</strong>
      <span className="eventos-mesa__detalhe">{detalhe}</span>
      {contextoReacao?.pedido && (
        <span className="eventos-mesa__reacao-contexto">
          Em resposta a: {contextoReacao.pedido.payload.descricao}
          {contextoReacao.rolagem &&
            ` — ${origemRolagem(contextoReacao.rolagem.payload)}: ${contextoReacao.rolagem.payload.resultado}`}
        </span>
      )}
      {sugestao && onRolar && !ocultarPorRespostaDeOutro && (
        <div className="eventos-mesa__sugestao">
          <span className="eventos-mesa__sugestao-valor">{rotuloSugestao(sugestao)}</span>
          <button type="button" className="roll-btn" disabled={jaRolado} onClick={() => onRolar(sugestao)}>
            {jaRolado ? 'Rolado' : 'Rolar'}
          </button>
        </div>
      )}
      {onRolar && pedidoEhParaContaAtual(evento) && (
        <RespostaLivrePedido eventoId={evento.id} onRolar={onRolar} />
      )}
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
  catalogoRolagem,
  onRolar,
}: {
  eventos: EventoMesa[]
  status: ConexaoEventosStatus
  onReconectar?: () => void
  /** Catálogo de rolagem do jogador atual — ausente no `MasterDashboard`, que não tem ficha própria. */
  catalogoRolagem?: CatalogoRolagemEntry[]
  /** `pedidoEventoId` é o id do `pedido_rolagem` respondido — repassar a `emitirRolagem` para correlacionar a reação (ver `pedido-rolagem-reacao-imediata`). */
  onRolar?: (entrada: CatalogoRolagemEntry, pedidoEventoId: string) => void
}) {
  // A lista tem altura limitada (ver styles.css) para não empurrar o resto
  // da ficha para baixo à medida que a mesa acumula eventos — em vez disso,
  // rola para o evento mais recente a cada novo evento, como um chat.
  const listaRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const lista = listaRef.current
    if (lista) lista.scrollTop = lista.scrollHeight
  }, [eventos.length])

  // Marca localmente qual pedido de rolagem já foi respondido pelo jogador
  // nesta sessão, para desabilitar o botão de sugestão e evitar rolar de
  // novo para o mesmo pedido — mais rápido que esperar a rolagem/reação
  // correlacionada chegar de volta pelo histórico de eventos.
  const [pedidosRespondidos, setPedidosRespondidos] = useState<Set<string>>(new Set())

  function handleRolar(eventoId: string, entrada: CatalogoRolagemEntry): void {
    setPedidosRespondidos((atual) => new Set(atual).add(eventoId))
    onRolar?.(entrada, eventoId)
  }

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
              <EventoItem
                key={item.evento.id}
                evento={item.evento}
                eventos={eventos}
                catalogoRolagem={catalogoRolagem}
                onRolar={onRolar ? (entrada) => handleRolar(item.evento.id, entrada) : undefined}
                jaRolado={pedidosRespondidos.has(item.evento.id)}
              />
            ),
          )}
        </ul>
      )}
    </section>
  )
}
