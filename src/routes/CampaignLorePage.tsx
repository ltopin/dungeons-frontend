import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listarElementosPublicadosDaCampanha } from '../api/worlds'
import type { ElementoHistoria } from '../api/types'

function agruparPorCategoria(elementos: ElementoHistoria[]): [string, ElementoHistoria[]][] {
  const grupos = new Map<string, ElementoHistoria[]>()
  for (const elemento of elementos) {
    const lista = grupos.get(elemento.categoria) ?? []
    lista.push(elemento)
    grupos.set(elemento.categoria, lista)
  }
  return Array.from(grupos.entries())
}

export function CampaignLorePage() {
  const { id } = useParams<{ id: string }>()
  const [elementos, setElementos] = useState<ElementoHistoria[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    if (!id) return
    setErro(null)
    setElementos(null)
    listarElementosPublicadosDaCampanha(id)
      .then(setElementos)
      .catch(() => setErro('Não foi possível carregar a história desta campanha.'))
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!id) return null

  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="historia-heading">História da campanha</h1>
        <Link to="/campanhas" className="campaigns-screen__logout">
          Voltar às campanhas
        </Link>
      </header>

      <section className="campaigns-screen__panel" aria-labelledby="historia-heading">
        {erro && (
          <p role="alert" className="campaigns-screen__error">
            {erro}
            <button type="button" className="campaigns-screen__retry" onClick={carregar}>
              Tentar novamente
            </button>
          </p>
        )}
        {!erro && elementos === null && <p className="campaigns-screen__hint">Carregando história…</p>}
        {elementos !== null && elementos.length === 0 && (
          <p className="campaigns-screen__empty">
            Esta campanha ainda não tem nenhuma história publicada para consultar.
          </p>
        )}
        {elementos !== null &&
          elementos.length > 0 &&
          agruparPorCategoria(elementos).map(([categoria, itens]) => (
            <div key={categoria} className="campaigns-screen__lore-group">
              <h2 className="campaigns-screen__section-title">{categoria}</h2>
              <ul className="campaigns-screen__list">
                {itens.map((elemento) => (
                  <li key={elemento.id} className="campaigns-screen__lore-item">
                    <h3 className="campaigns-screen__entry-name">{elemento.titulo}</h3>
                    <p className="campaigns-screen__lore-content">{elemento.conteudo}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </section>
    </main>
  )
}
