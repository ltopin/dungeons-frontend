import type { FichaAtaque } from '../../api/types'
import { RoField } from './RoFields'

const FIELDS: Array<{ key: keyof FichaAtaque; label: string }> = [
  { key: 'arma', label: 'Arma' },
  { key: 'bonus', label: 'Bônus de ataque' },
  { key: 'dano', label: 'Dano' },
  { key: 'critico', label: 'Crítico' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'alcance', label: 'Alcance' },
]

export function AtaquesReadOnly({ ataques }: { ataques: FichaAtaque[] }) {
  return (
    <section aria-label="Ataques" className="panel">
      <h2>Ataques</h2>

      {ataques.length === 0 && <p className="hint">Nenhum ataque registrado.</p>}

      <ul className="list-section">
        {ataques.map((ataque) => (
          <li key={ataque.id}>
            {FIELDS.map(({ key, label }) => (
              <RoField key={key} label={label} value={ataque[key]} />
            ))}
          </li>
        ))}
      </ul>
    </section>
  )
}
