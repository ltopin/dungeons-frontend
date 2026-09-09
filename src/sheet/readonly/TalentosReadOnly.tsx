import type { FichaTalento } from '../../api/types'
import { SectionTitle } from '../theme'

function TalentoList({ items, emptyHint }: { items: FichaTalento[]; emptyHint: string }) {
  if (items.length === 0) return <p className="hint">{emptyHint}</p>

  return (
    <ul className="list-section">
      {items.map((talento) => (
        <li key={talento.id}>
          <div className="field-grid three">
            <div className="ro-field">
              <span className="field-label">Nome</span>
              <span className="ro-field-value">{talento.nome}</span>
            </div>
            <div className="ro-field">
              <span className="field-label">Descrição</span>
              <span className="ro-field-value">{talento.descricao}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function TalentosReadOnly({ talentos }: { talentos: FichaTalento[] }) {
  const talentosComuns = talentos.filter((t) => t.categoria !== 'qualidade_especial')
  const qualidadesEspeciais = talentos.filter((t) => t.categoria === 'qualidade_especial')

  return (
    <section aria-label="Talentos" className="panel">
      <h2>Talentos e Qualidades Especiais</h2>

      <SectionTitle accent="gold">Talentos</SectionTitle>
      <TalentoList items={talentosComuns} emptyHint="Nenhum talento registrado." />

      <SectionTitle accent="blue">Qualidades Especiais</SectionTitle>
      <TalentoList items={qualidadesEspeciais} emptyHint="Nenhuma qualidade especial registrada." />
    </section>
  )
}
