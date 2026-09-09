import { useState, type FormEvent } from 'react'
import { isNotacaoDadosValida } from './notacao'

export function RolagemLivreForm({
  onRolar,
  disabled = false,
}: {
  onRolar: (notacao: string) => Promise<unknown>
  disabled?: boolean
}) {
  const [notacao, setNotacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!isNotacaoDadosValida(notacao)) {
      setErro('Notação de dados inválida. Use um formato como 2d6+3.')
      return
    }
    setErro(null)
    setEnviando(true)
    onRolar(notacao.trim()).then(
      () => {
        setEnviando(false)
        setNotacao('')
      },
      () => {
        setEnviando(false)
        setErro('Não foi possível enviar a rolagem.')
      },
    )
  }

  return (
    <form className="rolagem-livre" onSubmit={submit} aria-label="Enviar rolagem livre">
      <label htmlFor="rolagem-livre-notacao">Rolagem livre</label>
      <input
        id="rolagem-livre-notacao"
        type="text"
        placeholder="ex.: 2d6+3"
        value={notacao}
        onChange={(e) => setNotacao(e.target.value)}
        disabled={disabled || enviando}
      />
      <button type="submit" disabled={disabled || enviando || notacao.trim() === ''}>
        Rolar
      </button>
      {erro && <p role="alert">{erro}</p>}
    </form>
  )
}
