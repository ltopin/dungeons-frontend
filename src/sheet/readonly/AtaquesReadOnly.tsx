import type { FichaAtaque } from '../../api/types'
import { RoField } from './RoFields'

const FIELDS_COMBATE: Array<{ key: keyof FichaAtaque; label: string }> = [
  { key: 'arma', label: 'Arma' },
  { key: 'bonus', label: 'Bônus de ataque' },
  { key: 'dano', label: 'Dano' },
  { key: 'critico', label: 'Crítico' },
  { key: 'tipo', label: 'Tipo' },
]

const FIELDS_LOGISTICA: Array<{ key: keyof FichaAtaque; label: string }> = [
  { key: 'alcance', label: 'Alcance' },
  { key: 'tamanho', label: 'Tamanho' },
  { key: 'propriedadesEspeciais', label: 'Propriedades especiais' },
  { key: 'peso', label: 'Peso' },
]

export function AtaquesReadOnly({ ataques }: { ataques: FichaAtaque[] }) {
  return (
    <section aria-label="Ataques" className="panel">
      <h2>Ataques</h2>

      {ataques.length === 0 && <p className="hint">Nenhum ataque registrado.</p>}

      <ul className="list-section">
        {ataques.map((ataque) => (
          <li key={ataque.id}>
            <div className="field-grid five">
              {FIELDS_COMBATE.map(({ key, label }) => (
                <RoField key={key} label={label} value={ataque[key]} />
              ))}
            </div>
            <div className="field-grid">
              {FIELDS_LOGISTICA.map(({ key, label }) => (
                <RoField key={key} label={label} value={ataque[key]} />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
