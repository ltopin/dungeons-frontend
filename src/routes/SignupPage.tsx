import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cadastrar } from '../auth/session'
import { ApiError } from '../api/client'

export function SignupPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()
  const erroRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (erro) erroRef.current?.focus()
  }, [erro])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      await cadastrar(nome, email, senha)
      navigate('/campanhas', { state: { boasVindas: true } })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErro('Este e-mail já está cadastrado.')
      } else if (err instanceof ApiError) {
        setErro('Não foi possível cadastrar agora. Tente novamente em instantes.')
      } else {
        setErro('Sem conexão com o servidor. Verifique sua internet e tente novamente.')
      }
      setCarregando(false)
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-screen__panel">
        <p className="auth-screen__brand">Livro de Ligações</p>
        <h1>Criar conta</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-screen__field">
            <label htmlFor="cadastro-nome">Nome</label>
            <input
              id="cadastro-nome"
              autoComplete="name"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="auth-screen__field">
            <label htmlFor="cadastro-email">E-mail</label>
            <input
              id="cadastro-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-screen__field">
            <label htmlFor="cadastro-senha">Senha</label>
            <input
              id="cadastro-senha"
              type="password"
              autoComplete="new-password"
              required
              aria-describedby="cadastro-senha-dica"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <p id="cadastro-senha-dica" className="auth-screen__hint">
              Use pelo menos 8 caracteres.
            </p>
          </div>
          {erro && (
            <p ref={erroRef} role="alert" tabIndex={-1} className="auth-screen__error">
              {erro}
            </p>
          )}
          <button type="submit" className="auth-screen__submit" disabled={carregando}>
            {carregando ? 'Cadastrando…' : 'Cadastrar'}
          </button>
        </form>
        <p className="auth-screen__switch">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </main>
  )
}
