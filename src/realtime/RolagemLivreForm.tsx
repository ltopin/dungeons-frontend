import { useState, type FormEvent } from 'react'
import { isNotacaoDadosValida } from './notacao'

export function RolagemLivreForm({
  onRolar,
  onErroEnvio,
  disabled = false,
}: {
  onRolar: (notacao: string) => Promise<unknown>
  onErroEnvio?: (mensagem: string) => void
  disabled?: boolean
}) {
  const [notacao, setNotacao] = useState('')
  const [erroValidacao, setErroValidacao] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!isNotacaoDadosValida(notacao)) {
      setErroValidacao('Notação de dados inválida. Use um formato como 2d6+3.')
      return
    }
    setErroValidacao(null)
    setEnviando(true)
    onRolar(notacao.trim()).then(
      () => {
        setEnviando(false)
        setNotacao('')
      },
      () => {
        setEnviando(false)
        onErroEnvio?.('Não foi possível enviar a rolagem.')
      },
    )
  }

  return (
    <section aria-label="Rolagem livre" className="panel rolagem-livre">
      <div className="section-header">
        <h2>Rolagem livre</h2>
      </div>
      <form className="rolagem-livre__form" onSubmit={submit} aria-label="Enviar rolagem livre">
        <label htmlFor="rolagem-livre-notacao" className="field-label">
          Notação (ex.: 2d6+3)
        </label>
        <div className="rolagem-livre__row">
          <input
            id="rolagem-livre-notacao"
            type="text"
            placeholder="2d6+3"
            value={notacao}
            onChange={(e) => setNotacao(e.target.value)}
            disabled={disabled || enviando}
          />
          <button type="submit" className="roll-btn" disabled={disabled || enviando || notacao.trim() === ''}>
            {enviando ? 'Enviando…' : 'Rolar'}
          </button>
        </div>
      </form>
      {erroValidacao && (
        <p role="alert" className="save-status save-status--erro">
          {erroValidacao}
        </p>
      )}
    </section>
  )
}
