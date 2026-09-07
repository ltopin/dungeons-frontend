import type { FichaTalento } from '../../api/types'

export function TalentosReadOnly({ talentos }: { talentos: FichaTalento[] }) {
  return (
    <section aria-label="Talentos" className="panel">
      <h2>Talentos</h2>

      {talentos.length === 0 && <p className="hint">Nenhum talento registrado.</p>}

      <ul className="list-section">
        {talentos.map((talento) => (
          <li key={talento.id}>
            <div className="ro-field">
              <span className="field-label">Nome</span>
              <span className="ro-field-value">{talento.nome}</span>
            </div>
            <div className="ro-field">
              <span className="field-label">Descrição</span>
              <span className="ro-field-value">{talento.descricao}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
