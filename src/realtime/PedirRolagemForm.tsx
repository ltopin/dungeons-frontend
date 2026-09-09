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

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!descricao.trim()) {
      setErro('Descreva a rolagem pedida.')
      return
    }
    setErro(null)
    setEnviando(true)
    onPedir({ destinatarioContaId: destinatario || undefined, descricao: descricao.trim() }).then(
      () => {
        setEnviando(false)
        setDescricao('')
      },
      () => {
        setEnviando(false)
        setErro('Não foi possível enviar o pedido de rolagem.')
      },
    )
  }

  return (
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
      <input
        id="pedir-rolagem-descricao"
        type="text"
        placeholder="ex.: Teste de Reflexos CD 15"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        disabled={disabled || enviando}
      />

      <button type="submit" disabled={disabled || enviando}>
        Pedir rolagem
      </button>
      {erro && <p role="alert">{erro}</p>}
    </form>
  )
}
