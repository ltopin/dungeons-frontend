import { useState, type FormEvent } from 'react'

export interface JogadorParaPedido {
  contaId: string
  nome: string
}

export function PedirRolagemForm({
  jogadores,
  onPedir,
  disabled = false,
}: {
  jogadores: JogadorParaPedido[]
  onPedir: (input: { destinatarioContaId?: string; descricao: string }) => Promise<unknown>
  disabled?: boolean
}) {
  const [destinatario, setDestinatario] = useState('')
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [ultimoPedido, setUltimoPedido] = useState<{ destinatario: string; descricao: string } | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!descricao.trim()) {
      setErro('Descreva a rolagem pedida.')
      return
    }
    setErro(null)
    setEnviando(true)
    const pedidoAtual = { destinatario, descricao: descricao.trim() }
    onPedir({ destinatarioContaId: pedidoAtual.destinatario || undefined, descricao: pedidoAtual.descricao }).then(
      () => {
        setEnviando(false)
        setUltimoPedido(pedidoAtual)
        setDescricao('')
      },
      () => {
        setEnviando(false)
        setErro('Não foi possível enviar o pedido de rolagem.')
      },
    )
  }

  function repetirUltimoPedido() {
    if (!ultimoPedido) return
    setDestinatario(ultimoPedido.destinatario)
    setDescricao(ultimoPedido.descricao)
  }

  return (
    <section aria-label="Pedir rolagem" className="panel">
      <div className="section-header">
        <h2>Pedir rolagem</h2>
      </div>

      <form className="pedir-rolagem" onSubmit={submit} aria-label="Formulário de pedido de rolagem">
        <label htmlFor="pedir-rolagem-destinatario">Jogador</label>
        <select
          id="pedir-rolagem-destinatario"
          value={destinatario}
          onChange={(e) => setDestinatario(e.target.value)}
          disabled={disabled || enviando}
        >
          <option value="">Toda a mesa</option>
          {jogadores.map((jogador) => (
            <option key={jogador.contaId} value={jogador.contaId}>
              {jogador.nome}
            </option>
          ))}
        </select>

        <label htmlFor="pedir-rolagem-descricao">Descrição</label>
        <div className="pedir-rolagem__row">
          <input
            id="pedir-rolagem-descricao"
            type="text"
            placeholder="ex.: Teste de Reflexos CD 15"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            disabled={disabled || enviando}
          />
          <button type="submit" className="roll-btn" disabled={disabled || enviando}>
            {enviando ? 'Enviando…' : 'Pedir rolagem'}
          </button>
        </div>

        {ultimoPedido && (
          <button
            type="button"
            className="pedir-rolagem__repetir"
            onClick={repetirUltimoPedido}
            disabled={disabled || enviando}
          >
            Repetir último pedido
          </button>
        )}

        {disabled && (
          <p className="hint">Conexão em tempo real indisponível — peça a rolagem quando reconectar.</p>
        )}
        {erro && (
          <p role="alert" className="save-status save-status--erro">
            {erro}
          </p>
        )}
      </form>
    </section>
  )
}
