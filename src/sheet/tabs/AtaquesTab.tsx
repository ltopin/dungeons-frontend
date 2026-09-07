import type { FichaAtaque } from '../../api/types'
import { useListSection } from '../useListSection'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { IconButton } from '../theme'

const FIELDS: Array<{ key: keyof FichaAtaque; label: string }> = [
  { key: 'arma', label: 'Arma' },
  { key: 'bonus', label: 'Bônus de ataque' },
  { key: 'dano', label: 'Dano' },
  { key: 'critico', label: 'Crítico' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'alcance', label: 'Alcance' },
]

export function AtaquesTab({ fichaId, ataques }: { fichaId: string; ataques: FichaAtaque[] }) {
  const { items, addItem, removeItem, updateItemField, statusById, retryItem, createError } =
    useListSection<FichaAtaque>(fichaId, 'ataques', ataques)

  return (
    <section aria-label="Ataques" className="panel">
      <div className="section-header">
        <h2>Ataques</h2>
        <button
          className="add-btn"
          type="button"
          onClick={() => addItem({ arma: 'Nova arma', bonus: '', dano: '', critico: '', tipo: '', alcance: '' })}
        >
          Adicionar ataque
        </button>
      </div>
      {createError && <p role="alert">{createError}</p>}

      <ul className="list-section">
        {items.map((ataque) => (
          <li key={ataque.id}>
            {FIELDS.map(({ key, label }) => (
              <label key={key}>
                <span>{label}</span>
                <input
                  type="text"
                  value={ataque[key]}
                  onChange={(e) => updateItemField(ataque.id, key, e.target.value)}
                />
              </label>
            ))}
            <SaveStatusBadge status={statusById[ataque.id] ?? 'idle'} onRetry={() => retryItem(ataque.id)} />
            <IconButton danger title={`Remover ataque ${ataque.arma}`} onClick={() => removeItem(ataque.id)}>
              ✕
            </IconButton>
          </li>
        ))}
      </ul>
    </section>
  )
}
