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

export function LoreList({ elementos }: { elementos: ElementoHistoria[] }) {
  return (
    <>
      {agruparPorCategoria(elementos).map(([categoria, itens]) => (
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
    </>
  )
}
