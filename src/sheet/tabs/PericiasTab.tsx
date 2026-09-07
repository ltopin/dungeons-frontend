import type { FichaPericia } from '../../api/types'
import { useListSection } from '../useListSection'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { IconButton } from '../theme'

export function PericiasTab({ fichaId, pericias }: { fichaId: string; pericias: FichaPericia[] }) {
  const { items, addItem, removeItem, updateItemField, statusById, retryItem, createError } =
    useListSection<FichaPericia>(fichaId, 'pericias', pericias)

  return (
    <section aria-label="Perícias" className="panel">
      <div className="section-header">
        <h2>Perícias</h2>
        <button
          className="add-btn"
          type="button"
          onClick={() =>
            addItem({ nome: 'Nova perícia', atributo: '', periciaDeClasse: false, graduacoes: 0, outros: 0 })
          }
        >
          Adicionar perícia
        </button>
      </div>
      {createError && <p role="alert">{createError}</p>}
      <p className="hint">A estrela marca perícia de classe.</p>

      <ul className="list-section">
        {items.map((pericia) => (
          <li key={pericia.id}>
            <label title="Perícia de classe">
              <input
                className="star-toggle"
                type="checkbox"
                checked={pericia.periciaDeClasse}
                onChange={(e) => updateItemField(pericia.id, 'periciaDeClasse', e.target.checked)}
              />
              <span>Perícia de classe</span>
            </label>
            <label>
              <span>Nome</span>
              <input
                type="text"
                value={pericia.nome}
                onChange={(e) => updateItemField(pericia.id, 'nome', e.target.value)}
              />
            </label>
            <label>
              <span>Atributo</span>
              <input
                type="text"
                value={pericia.atributo}
                onChange={(e) => updateItemField(pericia.id, 'atributo', e.target.value)}
              />
            </label>
            <label>
              <span>Graduações</span>
              <input
                type="number"
                value={pericia.graduacoes}
                onChange={(e) => updateItemField(pericia.id, 'graduacoes', Number(e.target.value))}
              />
            </label>
            <label>
              <span>Outros</span>
              <input
                type="number"
                value={pericia.outros}
                onChange={(e) => updateItemField(pericia.id, 'outros', Number(e.target.value))}
              />
            </label>
            <SaveStatusBadge status={statusById[pericia.id] ?? 'idle'} onRetry={() => retryItem(pericia.id)} />
            <IconButton danger title={`Remover perícia ${pericia.nome}`} onClick={() => removeItem(pericia.id)}>
              ✕
            </IconButton>
          </li>
        ))}
      </ul>
    </section>
  )
}
