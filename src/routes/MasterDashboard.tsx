import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarFichasDaCampanha } from '../api/campaigns'
import type { Campanha, FichaResumo } from '../api/types'

export function MasterDashboard({
  campanha,
  campanhaCriada = false,
}: {
  campanha: Campanha
  campanhaCriada?: boolean
}) {
  const [fichas, setFichas] = useState<FichaResumo[] | null>(null)
  const [erroFichas, setErroFichas] = useState<string | null>(null)
  const erroFichasRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (erroFichas) erroFichasRef.current?.focus()
  }, [erroFichas])

  function carregarFichas() {
    setErroFichas(null)
    setFichas(null)
    listarFichasDaCampanha(campanha.id)
      .then(setFichas)
      .catch(() => setErroFichas('Não foi possível carregar as fichas da campanha.'))
  }

  useEffect(() => {
    carregarFichas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campanha.id])

  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="campanha-heading">{campanha.nome}</h1>
        <Link to="/campanhas" className="campaigns-screen__logout">
          Voltar às campanhas
        </Link>
      </header>

      {campanhaCriada && (
        <p role="status" className="welcome-banner">
          Campanha criada! Seus jogadores já podem encontrá-la na lista de campanhas abertas para entrar.
        </p>
      )}

      <section className="campaigns-screen__panel" aria-labelledby="fichas-heading">
        <h2 id="fichas-heading" className="campaigns-screen__section-title">
          Fichas
        </h2>

        {erroFichas && (
          <p ref={erroFichasRef} role="alert" tabIndex={-1} className="campaigns-screen__error">
            {erroFichas}
            <button type="button" className="campaigns-screen__retry" onClick={carregarFichas}>
              Tentar novamente
            </button>
          </p>
        )}
        {!erroFichas && fichas === null && <p className="campaigns-screen__hint">Carregando fichas…</p>}
        {fichas !== null && fichas.length === 0 && (
          <p className="campaigns-screen__empty">
            Nenhum jogador entrou nesta campanha ainda. Ela já aparece na lista de campanhas abertas para outros
            jogadores encontrarem e entrarem.
          </p>
        )}
        {fichas !== null && fichas.length > 0 && (
          <ul className="campaigns-screen__list">
            {fichas.map((f) => (
              <li key={f.id}>
                <Link to={`/campanhas/${campanha.id}/fichas/${f.id}`} className="campaigns-screen__campaign-link">
                  <span className="campaigns-screen__entry-name">
                    {f.nomePersonagem}
                    {f.nomeJogador ? ` — ${f.nomeJogador}` : ''}
                  </span>
                  <span className="campaigns-screen__entry-meta">
                    {f.classe} · nível {f.nivel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
