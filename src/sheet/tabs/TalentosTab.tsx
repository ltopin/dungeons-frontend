import type { FichaTalento } from '../../api/types'
import { useListSection } from '../useListSection'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { IconButton } from '../theme'

export function TalentosTab({ fichaId, talentos }: { fichaId: string; talentos: FichaTalento[] }) {
  const { items, addItem, removeItem, updateItemField, statusById, retryItem, createError } =
    useListSection<FichaTalento>(fichaId, 'talentos', talentos)

  return (
    <section aria-label="Talentos" className="panel">
      <div className="section-header">
        <h2>Talentos</h2>
        <button className="add-btn" type="button" onClick={() => addItem({ nome: 'Novo talento', descricao: '' })}>
          Adicionar talento
        </button>
      </div>
      {createError && <p role="alert">{createError}</p>}

      <div className="list-stack">
        {items.map((talento) => (
          <div key={talento.id} className="row-card">
            <label>
              <span>Nome</span>
              <input
                type="text"
                value={talento.nome}
                onChange={(e) => updateItemField(talento.id, 'nome', e.target.value)}
              />
            </label>
            <label>
              <span>Descrição</span>
              <input
                type="text"
                value={talento.descricao}
                onChange={(e) => updateItemField(talento.id, 'descricao', e.target.value)}
              />
            </label>
            <SaveStatusBadge status={statusById[talento.id] ?? 'idle'} onRetry={() => retryItem(talento.id)} />
            <IconButton danger title={`Remover talento ${talento.nome}`} onClick={() => removeItem(talento.id)}>
              ✕
            </IconButton>
          </div>
        ))}
      </div>
    </section>
  )
}
