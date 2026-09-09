import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { criarCampanha } from '../api/campaigns'
import { listarMundos } from '../api/worlds'
import { ApiError } from '../api/client'
import type { Mundo } from '../api/types'

export function NewCampaignPage() {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [mundos, setMundos] = useState<Mundo[]>([])
  const [mundoId, setMundoId] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()
  const erroRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (erro) erroRef.current?.focus()
  }, [erro])

  useEffect(() => {
    listarMundos()
      .then(setMundos)
      .catch(() => setMundos([]))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) {
      setErro('O nome da campanha é obrigatório.')
      return
    }
    setErro(null)
    setCarregando(true)
    try {
      const campanha = await criarCampanha(nome.trim(), descricao.trim() || undefined, mundoId || undefined)
      navigate(`/campanhas/${campanha.id}`, { state: { campanhaCriada: true } })
    } catch (err) {
      if (err instanceof ApiError) {
        setErro('Não foi possível criar a campanha agora. Tente novamente em instantes.')
      } else {
        setErro('Sem conexão com o servidor. Verifique sua internet e tente novamente.')
      }
      setCarregando(false)
    }
  }

  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="nova-campanha-heading">Criar campanha</h1>
        <Link to="/campanhas" className="campaigns-screen__logout">
          Cancelar
        </Link>
      </header>

      <section className="campaigns-screen__panel" aria-labelledby="nova-campanha-heading">
        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-screen__field">
            <label htmlFor="nova-campanha-nome">Nome da campanha</label>
            <input
              id="nova-campanha-nome"
              autoFocus
              autoComplete="off"
              required
              maxLength={80}
              placeholder="Ex: A Maldição de Strahd"
              aria-describedby="nova-campanha-hint"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <p id="nova-campanha-hint" className="auth-screen__hint">
              Até 80 caracteres. Você poderá convidar jogadores assim que ela for criada.
            </p>
          </div>

          <div className="auth-screen__field">
            <label htmlFor="nova-campanha-descricao">Descrição</label>
            <textarea
              id="nova-campanha-descricao"
              rows={3}
              maxLength={500}
              placeholder="Do que se trata esta campanha? (opcional)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {mundos.length > 0 && (
            <div className="auth-screen__field">
              <label htmlFor="nova-campanha-mundo">Mundo desta campanha</label>
              <select id="nova-campanha-mundo" value={mundoId} onChange={(e) => setMundoId(e.target.value)}>
                <option value="">Nenhum</option>
                {mundos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
              <p className="auth-screen__hint">Opcional. Você pode vincular ou trocar depois pelo dashboard.</p>
            </div>
          )}

          {erro && (
            <p ref={erroRef} role="alert" tabIndex={-1} className="auth-screen__error">
              {erro}
            </p>
          )}

          <button type="submit" className="campaigns-screen__join" disabled={carregando}>
            {carregando ? 'Criando…' : 'Criar campanha'}
          </button>
        </form>
      </section>
    </main>
  )
}
