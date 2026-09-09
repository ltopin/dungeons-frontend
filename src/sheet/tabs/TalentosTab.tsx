import type { FichaTalento, FichaTalentoCategoria } from '../../api/types'
import { useListSection } from '../useListSection'
import { SaveStatusBadge } from '../SaveStatusBadge'
import type { SaveStatus } from '../useSectionAutosave'
import { ConfirmIconButton, Field, SectionTitle } from '../theme'

const CATEGORIAS: Array<{ value: FichaTalentoCategoria; label: string }> = [
  { value: 'talento', label: 'Talento' },
  { value: 'qualidade_especial', label: 'Qualidade especial' },
]

function TalentoList({
  items,
  statusById,
  updateItemField,
  retryItem,
  removeItem,
  emptyHint,
  onRolar,
  rolarDesabilitado,
}: {
  items: FichaTalento[]
  statusById: Record<string, SaveStatus>
  updateItemField: <K extends keyof FichaTalento>(id: string, field: K, value: FichaTalento[K]) => void
  retryItem: (id: string) => void
  removeItem: (id: string) => void
  emptyHint: string
  onRolar?: (itemId: string) => void
  rolarDesabilitado?: string
}) {
  if (items.length === 0) return <p className="hint">{emptyHint}</p>

  return (
    <ul className="list-section">
      {items.map((talento) => (
        <li key={talento.id}>
          <div className="field-grid three">
            <Field label="Nome">
              <input
                type="text"
                value={talento.nome}
                onChange={(e) => updateItemField(talento.id, 'nome', e.target.value)}
              />
            </Field>
            <Field label="Descrição">
              <input
                type="text"
                value={talento.descricao}
                onChange={(e) => updateItemField(talento.id, 'descricao', e.target.value)}
              />
            </Field>
            <Field label="Categoria">
              <select
                value={talento.categoria ?? 'talento'}
                onChange={(e) => updateItemField(talento.id, 'categoria', e.target.value as FichaTalentoCategoria)}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="list-item-actions">
            {onRolar && (
              <button
                type="button"
                className="roll-btn"
                aria-label={`Rolar ${talento.nome}`}
                disabled={Boolean(rolarDesabilitado)}
                title={rolarDesabilitado}
                onClick={() => onRolar(talento.id)}
              >
                Rolar
              </button>
            )}
            <SaveStatusBadge status={statusById[talento.id] ?? 'idle'} onRetry={() => retryItem(talento.id)} />
            <ConfirmIconButton
              title={`Remover ${talento.nome}`}
              confirmLabel="Remover?"
              onConfirm={() => removeItem(talento.id)}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function TalentosTab({
  fichaId,
  talentos,
  onItemsChange,
  onRolar,
  rolarDesabilitado,
}: {
  fichaId: string
  talentos: FichaTalento[]
  onItemsChange?: (talentos: FichaTalento[]) => void
  onRolar?: (itemId: string) => void
  /** Título exibido no botão de rolar quando desabilitado (ex.: de quem é a vez em combate). */
  rolarDesabilitado?: string
}) {
  const { items, addItem, removeItem, updateItemField, statusById, retryItem, createError } =
    useListSection<FichaTalento>(fichaId, 'talentos', talentos, undefined, onItemsChange)

  const talentosComuns = items.filter((t) => t.categoria !== 'qualidade_especial')
  const qualidadesEspeciais = items.filter((t) => t.categoria === 'qualidade_especial')

  return (
    <section aria-label="Talentos" className="panel">
      <div className="section-header">
        <h2>Talentos e Qualidades Especiais</h2>
        <button
          className="add-btn"
          type="button"
          onClick={() => addItem({ nome: 'Novo talento', descricao: '', categoria: 'talento' })}
        >
          Adicionar talento
        </button>
      </div>
      {createError && <p role="alert">{createError}</p>}

      <SectionTitle accent="gold">Talentos</SectionTitle>
      <TalentoList
        items={talentosComuns}
        statusById={statusById}
        updateItemField={updateItemField}
        retryItem={retryItem}
        removeItem={removeItem}
        emptyHint="Nenhum talento cadastrado ainda — adicione o primeiro talento do personagem."
        onRolar={onRolar}
        rolarDesabilitado={rolarDesabilitado}
      />

      <SectionTitle accent="blue">Qualidades Especiais</SectionTitle>
      <TalentoList
        items={qualidadesEspeciais}
        statusById={statusById}
        updateItemField={updateItemField}
        retryItem={retryItem}
        removeItem={removeItem}
        emptyHint="Nenhuma qualidade especial cadastrada ainda."
        onRolar={onRolar}
        rolarDesabilitado={rolarDesabilitado}
      />
    </section>
  )
}
