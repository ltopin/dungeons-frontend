import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarMundos } from '../api/worlds'
import type { Mundo } from '../api/types'

export function WorldsListPage() {
  const [mundos, setMundos] = useState<Mundo[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  function carregarMundos() {
    setErro(null)
    setMundos(null)
    listarMundos()
      .then(setMundos)
      .catch(() => setErro('Não foi possível carregar seus mundos.'))
  }

  useEffect(() => {
    carregarMundos()
  }, [])

  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="mundos-heading">Meus mundos</h1>
        <Link to="/campanhas" className="campaigns-screen__logout">
          Voltar às campanhas
        </Link>
      </header>

      <section className="campaigns-screen__panel" aria-labelledby="mundos-heading">
        <div className="campaigns-screen__panel-head">
          <Link to="/mundos/novo" className="campaigns-screen__primary-action">
            Criar mundo
          </Link>
        </div>

        {erro && (
          <p role="alert" className="campaigns-screen__error">
            {erro}
            <button type="button" className="campaigns-screen__retry" onClick={carregarMundos}>
              Tentar novamente
            </button>
          </p>
        )}
        {!erro && mundos === null && <p className="campaigns-screen__hint">Carregando seus mundos…</p>}
        {mundos !== null && mundos.length === 0 && (
          <p className="campaigns-screen__empty">
            Você ainda não criou nenhum mundo. <Link to="/mundos/novo">Crie o primeiro</Link> para começar a registrar
            a história das suas campanhas.
          </p>
        )}
        {mundos !== null && mundos.length > 0 && (
          <ul className="campaigns-screen__list">
            {mundos.map((m) => (
              <li key={m.id}>
                <Link to={`/mundos/${m.id}`} className="campaigns-screen__campaign-link">
                  <span className="campaigns-screen__entry-name">{m.nome}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
