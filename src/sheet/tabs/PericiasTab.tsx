import type { FichaGeral, FichaPericia } from '../../api/types'
import { useListSection } from '../useListSection'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { ConfirmIconButton, Field } from '../theme'
import { ABILIDADES, atributoScore, fmt } from '../abilityMod'
import { attributeModifier } from '../../rules/attributeMods'
import { skillTotal } from '../../rules/skills'

export function PericiasTab({
  fichaId,
  pericias,
  geral,
  onItemsChange,
  onRolar,
  rolarDesabilitado,
}: {
  fichaId: string
  pericias: FichaPericia[]
  geral: FichaGeral
  onItemsChange?: (pericias: FichaPericia[]) => void
  onRolar?: (itemId: string) => void
  /** Título exibido no botão de rolar quando desabilitado (ex.: de quem é a vez em combate). */
  rolarDesabilitado?: string
}) {
  const { items, addItem, removeItem, updateItemField, statusById, retryItem, createError } =
    useListSection<FichaPericia>(
      fichaId,
      'pericias',
      pericias,
      (pericia) => ({
        total: skillTotal({
          graduacoes: Number(pericia.graduacoes || 0),
          atributoMod: attributeModifier(atributoScore(geral, pericia.atributo)),
          periciaDeClasse: pericia.periciaDeClasse,
          outros: Number(pericia.outros || 0),
        }),
      }),
      onItemsChange,
    )

  return (
    <section aria-label="Perícias" className="panel">
      <div className="section-header">
        <h2>Perícias</h2>
        <button
          className="add-btn"
          type="button"
          onClick={() => addItem({ nome: 'Nova perícia', atributo: '', periciaDeClasse: false, graduacoes: 0, outros: 0 })}
        >
          Adicionar perícia
        </button>
      </div>
      {createError && <p role="alert">{createError}</p>}
      {items.length === 0 && <p className="hint">Nenhuma perícia cadastrada ainda — adicione a primeira.</p>}

      <ul className="list-section">
        {items.map((pericia) => (
          <li key={pericia.id}>
            <div className="field-grid five">
              <Field label="Nome">
                <input
                  type="text"
                  value={pericia.nome}
                  onChange={(e) => updateItemField(pericia.id, 'nome', e.target.value)}
                />
              </Field>
              <Field label="Atributo">
                <select
                  value={pericia.atributo ?? ''}
                  onChange={(e) => updateItemField(pericia.id, 'atributo', e.target.value)}
                >
                  <option value="">—</option>
                  {ABILIDADES.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.abbr}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="De classe" title="Perícia de classe">
                <input
                  type="checkbox"
                  checked={pericia.periciaDeClasse}
                  onChange={(e) => updateItemField(pericia.id, 'periciaDeClasse', e.target.checked)}
                />
              </Field>
              <Field label="Graduações">
                <input
                  type="number"
                  value={pericia.graduacoes}
                  onChange={(e) => updateItemField(pericia.id, 'graduacoes', Number(e.target.value))}
                />
              </Field>
              <Field label="Outros">
                <input
                  type="number"
                  value={pericia.outros}
                  onChange={(e) => updateItemField(pericia.id, 'outros', Number(e.target.value))}
                />
              </Field>
            </div>
            <div className="list-item-actions">
              <div
                className="save-total"
                style={{ marginRight: 'auto' }}
                title="Total (graduações + atributo + classe + outros)"
              >
                Total {fmt(
                  skillTotal({
                    graduacoes: Number(pericia.graduacoes || 0),
                    atributoMod: attributeModifier(atributoScore(geral, pericia.atributo)),
                    periciaDeClasse: pericia.periciaDeClasse,
                    outros: Number(pericia.outros || 0),
                  }),
                )}
              </div>
              {onRolar && (
                <button
                  type="button"
                  className="roll-btn"
                  aria-label={`Rolar ${pericia.nome}`}
                  disabled={Boolean(rolarDesabilitado)}
                  title={rolarDesabilitado}
                  onClick={() => onRolar(pericia.id)}
                >
                  Rolar
                </button>
              )}
              <SaveStatusBadge status={statusById[pericia.id] ?? 'idle'} onRetry={() => retryItem(pericia.id)} />
              <ConfirmIconButton
                title={`Remover perícia ${pericia.nome}`}
                confirmLabel="Remover?"
                onConfirm={() => removeItem(pericia.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
