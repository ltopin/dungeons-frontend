import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { entrar } from '../auth/session'

export function LoginPage() {
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
      await entrar(email, senha)
      navigate('/campanhas')
    } catch (err) {
      if (err instanceof TypeError) {
        setErro('Sem conexão com o servidor. Verifique sua internet e tente novamente.')
      } else {
        setErro('E-mail ou senha inválidos.')
      }
      setCarregando(false)
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-screen__panel">
        <p className="auth-screen__brand">Livro de Ligações</p>
        <h1>Entrar</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-screen__field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-screen__field">
            <label htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          {erro && (
            <p ref={erroRef} role="alert" tabIndex={-1} className="auth-screen__error">
              {erro}
            </p>
          )}
          <button type="submit" className="auth-screen__submit" disabled={carregando}>
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p className="auth-screen__switch">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </main>
  )
}
