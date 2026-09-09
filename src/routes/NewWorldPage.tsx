import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { criarMundo } from '../api/worlds'
import { ApiError } from '../api/client'

export function NewWorldPage() {
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()
  const erroRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (erro) erroRef.current?.focus()
  }, [erro])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) {
      setErro('O nome do mundo é obrigatório.')
      return
    }
    setErro(null)
    setCarregando(true)
    try {
      const mundo = await criarMundo(nome.trim())
      navigate(`/mundos/${mundo.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setErro('Não foi possível criar o mundo agora. Tente novamente em instantes.')
      } else {
        setErro('Sem conexão com o servidor. Verifique sua internet e tente novamente.')
      }
      setCarregando(false)
    }
  }

  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="novo-mundo-heading">Criar mundo</h1>
        <Link to="/mundos" className="campaigns-screen__logout">
          Cancelar
        </Link>
      </header>

      <section className="campaigns-screen__panel" aria-labelledby="novo-mundo-heading">
        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-screen__field">
            <label htmlFor="novo-mundo-nome">Nome do mundo</label>
            <input
              id="novo-mundo-nome"
              autoFocus
              autoComplete="off"
              required
              maxLength={80}
              placeholder="Ex: Forgotten Realms"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          {erro && (
            <p ref={erroRef} role="alert" tabIndex={-1} className="auth-screen__error">
              {erro}
            </p>
          )}

          <button type="submit" className="campaigns-screen__join" disabled={carregando}>
            {carregando ? 'Criando…' : 'Criar mundo'}
          </button>
        </form>
      </section>
    </main>
  )
}
