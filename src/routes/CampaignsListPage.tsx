import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { entrarNaCampanha, listarCampanhas, listarCampanhasAbertas } from '../api/campaigns'
import { sairDaConta } from '../auth/session'
import type { Campanha, CampanhaDisponivel, Role } from '../api/types'

const ROLE_LABEL: Record<Role, string> = {
  mestre: 'Mestre',
  jogador: 'Jogador',
  'aguardando-papel': 'Escolha pendente',
}

export function CampaignsListPage() {
  const location = useLocation()
  const [boasVindas] = useState(Boolean((location.state as { boasVindas?: boolean } | null)?.boasVindas))
  const [campanhas, setCampanhas] = useState<Campanha[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [campanhasAbertas, setCampanhasAbertas] = useState<CampanhaDisponivel[] | null>(null)
  const [erroAbertas, setErroAbertas] = useState<string | null>(null)
  const [erroEntrar, setErroEntrar] = useState<string | null>(null)
  const [entrandoEm, setEntrandoEm] = useState<string | null>(null)
  const navigate = useNavigate()

  function carregarCampanhas() {
    setErro(null)
    setCampanhas(null)
    listarCampanhas()
      .then(setCampanhas)
      .catch(() => setErro('Não foi possível carregar suas campanhas.'))
  }

  function carregarCampanhasAbertas() {
    setErroAbertas(null)
    setCampanhasAbertas(null)
    listarCampanhasAbertas()
      .then(setCampanhasAbertas)
      .catch(() => setErroAbertas('Não foi possível carregar as campanhas abertas.'))
  }

  useEffect(() => {
    let cancelado = false
    listarCampanhas()
      .then((dados) => {
        if (!cancelado) setCampanhas(dados)
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar suas campanhas.')
      })
    listarCampanhasAbertas()
      .then((dados) => {
        if (!cancelado) setCampanhasAbertas(dados)
      })
      .catch(() => {
        if (!cancelado) setErroAbertas('Não foi possível carregar as campanhas abertas.')
      })
    return () => {
      cancelado = true
    }
  }, [])

  async function handleEntrar(campanhaId: string) {
    setErroEntrar(null)
    setEntrandoEm(campanhaId)
    try {
      const { campanhaId: id } = await entrarNaCampanha(campanhaId)
      navigate(`/campanhas/${id}`)
    } catch {
      setErroEntrar('Não foi possível entrar nesta campanha.')
      setEntrandoEm(null)
    }
  }

  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="campanhas-heading">Suas campanhas</h1>
        <div className="campaigns-screen__masthead-actions">
          <Link to="/mundos" className="campaigns-screen__logout">
            Meus mundos
          </Link>
          <button type="button" className="campaigns-screen__logout" onClick={sairDaConta}>
            Sair da conta
          </button>
        </div>
      </header>

      {boasVindas && (
        <p role="status" className="welcome-banner">
          Conta criada com sucesso! Bem-vindo(a).
        </p>
      )}

      <section className="campaigns-screen__panel" aria-labelledby="campanhas-heading">
        <div className="campaigns-screen__panel-head">
          <Link to="/campanhas/nova" className="campaigns-screen__primary-action">
            Criar campanha
          </Link>
        </div>

        {erro && (
          <p role="alert" className="campaigns-screen__error">
            {erro}
            <button type="button" className="campaigns-screen__retry" onClick={carregarCampanhas}>
              Tentar novamente
            </button>
          </p>
        )}
        {!erro && campanhas === null && <p className="campaigns-screen__hint">Carregando suas campanhas…</p>}
        {campanhas !== null && campanhas.length === 0 && (
          <p className="campaigns-screen__empty">
            Você ainda não participa de nenhuma campanha. <Link to="/campanhas/nova">Crie a primeira</Link> ou entre
            em uma campanha aberta abaixo.
          </p>
        )}
        {campanhas !== null && campanhas.length > 0 && (
          <ul className="campaigns-screen__list">
            {campanhas.map((c) => (
              <li key={c.id}>
                <Link to={`/campanhas/${c.id}`} className="campaigns-screen__campaign-link">
                  <span className="campaigns-screen__entry-name">{c.nome}</span>
                  <span className={`campaigns-screen__role-pill campaigns-screen__role-pill--${c.role}`}>
                    {ROLE_LABEL[c.role]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="campaigns-screen__panel" aria-labelledby="campanhas-abertas-heading">
        <h2 id="campanhas-abertas-heading" className="campaigns-screen__section-title">
          Campanhas abertas
        </h2>
        <p className="campaigns-screen__hint">Campanhas de outros mestres que você ainda não participa.</p>

        {erroAbertas && (
          <p role="alert" className="campaigns-screen__error">
            {erroAbertas}
            <button type="button" className="campaigns-screen__retry" onClick={carregarCampanhasAbertas}>
              Tentar novamente
            </button>
          </p>
        )}
        {erroEntrar && (
          <p role="alert" className="campaigns-screen__error">
            {erroEntrar}
          </p>
        )}
        {!erroAbertas && campanhasAbertas === null && (
          <p className="campaigns-screen__hint">Carregando campanhas abertas…</p>
        )}
        {campanhasAbertas !== null && campanhasAbertas.length === 0 && (
          <p className="campaigns-screen__empty">
            Não há campanhas abertas no momento. Peça a um mestre o convite para a campanha dele, ou volte mais
            tarde.
          </p>
        )}
        {campanhasAbertas !== null && campanhasAbertas.length > 0 && (
          <ul className="campaigns-screen__list campaigns-screen__list--open">
            {campanhasAbertas.map((c) => (
              <li key={c.id}>
                <div className="campaigns-screen__entry-info">
                  <span className="campaigns-screen__entry-name">{c.nome}</span>
                  {(c.mestre_nome || c.criado_em) && (
                    <span className="campaigns-screen__entry-meta">
                      {[
                        c.mestre_nome && `Mestre: ${c.mestre_nome}`,
                        c.criado_em && `Criada em ${new Date(c.criado_em).toLocaleDateString('pt-BR')}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  )}
                  {c.descricao && (
                    <span className="campaigns-screen__entry-meta campaigns-screen__entry-meta--descricao">
                      {c.descricao}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="campaigns-screen__join"
                  disabled={entrandoEm === c.id}
                  aria-label={`Entrar em ${c.nome}`}
                  onClick={() => handleEntrar(c.id)}
                >
                  {entrandoEm === c.id ? 'Entrando…' : 'Entrar'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
