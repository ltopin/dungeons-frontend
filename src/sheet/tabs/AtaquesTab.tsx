import type { FichaAtaque } from '../../api/types'
import { useListSection } from '../useListSection'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { ConfirmIconButton, Field } from '../theme'

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
]

export function AtaquesTab({
  fichaId,
  ataques,
  onItemsChange,
  onRolar,
  rolarDesabilitado,
}: {
  fichaId: string
  ataques: FichaAtaque[]
  onItemsChange?: (ataques: FichaAtaque[]) => void
  onRolar?: (itemId: string) => void
  /** Título exibido no botão de rolar quando desabilitado (ex.: de quem é a vez em combate). */
  rolarDesabilitado?: string
}) {
  const { items, addItem, removeItem, updateItemField, statusById, retryItem, createError } =
    useListSection<FichaAtaque>(fichaId, 'ataques', ataques, undefined, onItemsChange)

  return (
    <section aria-label="Ataques" className="panel">
      <div className="section-header">
        <h2>Ataques</h2>
        <button
          className="add-btn"
          type="button"
          onClick={() =>
            addItem({
              arma: 'Nova arma',
              bonus: '',
              dano: '',
              critico: '',
              tipo: '',
              alcance: '',
              peso: 0,
              tamanho: '',
              propriedadesEspeciais: '',
            })
          }
        >
          Adicionar ataque
        </button>
      </div>
      {createError && <p role="alert">{createError}</p>}
      {items.length === 0 && (
        <p className="hint">Nenhum ataque cadastrado ainda — adicione sua arma para registrar seus ataques.</p>
      )}

      <ul className="list-section">
        {items.map((ataque) => (
          <li key={ataque.id}>
            <div className="field-grid five">
              {FIELDS_COMBATE.map(({ key, label }) => (
                <Field key={key} label={label}>
                  <input
                    type="text"
                    value={ataque[key] ?? ''}
                    onChange={(e) => updateItemField(ataque.id, key, e.target.value)}
                  />
                </Field>
              ))}
            </div>
            <div className="field-grid">
              {FIELDS_LOGISTICA.map(({ key, label }) => (
                <Field key={key} label={label}>
                  <input
                    type="text"
                    value={ataque[key] ?? ''}
                    onChange={(e) => updateItemField(ataque.id, key, e.target.value)}
                  />
                </Field>
              ))}
              <Field label="Peso">
                <input
                  type="number"
                  value={ataque.peso}
                  onChange={(e) => updateItemField(ataque.id, 'peso', Number(e.target.value))}
                />
              </Field>
            </div>
            <div className="list-item-actions">
              {onRolar && (
                <button
                  type="button"
                  className="roll-btn"
                  aria-label={`Rolar ${ataque.arma}`}
                  disabled={Boolean(rolarDesabilitado)}
                  title={rolarDesabilitado}
                  onClick={() => onRolar(ataque.id)}
                >
                  Rolar
                </button>
              )}
              <SaveStatusBadge status={statusById[ataque.id] ?? 'idle'} onRetry={() => retryItem(ataque.id)} />
              <ConfirmIconButton
                title={`Remover ataque ${ataque.arma}`}
                confirmLabel="Remover?"
                onConfirm={() => removeItem(ataque.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
