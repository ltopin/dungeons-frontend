import type { FichaItem, FichaMoedas } from '../../api/types'
import { useSectionAutosave } from '../useSectionAutosave'
import { useListSection } from '../useListSection'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { IconButton, NumBox, SectionTitle } from '../theme'

const MOEDAS: Array<{ key: keyof FichaMoedas; label: string }> = [
  { key: 'pp', label: 'Platina' },
  { key: 'gp', label: 'Ouro' },
  { key: 'sp', label: 'Prata' },
  { key: 'cp', label: 'Cobre' },
]

export function InventarioTab({
  fichaId,
  moedas,
  itens,
}: {
  fichaId: string
  moedas: FichaMoedas
  itens: FichaItem[]
}) {
  const moedasAutosave = useSectionAutosave<FichaMoedas>(fichaId, 'moedas', moedas)
  const { items, addItem, removeItem, updateItemField, statusById, retryItem, createError } =
    useListSection<FichaItem>(fichaId, 'itens', itens)

  const pesoTotal = items.reduce((acc, item) => acc + Number(item.peso || 0) * Number(item.quantidade || 1), 0)

  return (
    <section aria-label="Inventário" className="panel">
      <div className="section-header">
        <h2>Moedas</h2>
        <SaveStatusBadge status={moedasAutosave.status} onRetry={moedasAutosave.retry} />
      </div>
      <SectionTitle accent="gold">Tesouro</SectionTitle>
      <div className="currency-row">
        {MOEDAS.map(({ key, label }) => (
          <NumBox
            key={key}
            label={label}
            value={moedasAutosave.value[key]}
            onChange={(v) => moedasAutosave.updateField(key, Number(v))}
          />
        ))}
      </div>

      <div className="section-header">
        <h2>Itens</h2>
        <button className="add-btn" type="button" onClick={() => addItem({ nome: 'Novo item', quantidade: 1, peso: 0, notas: '' })}>
          Adicionar item
        </button>
      </div>
      {createError && <p role="alert">{createError}</p>}
      <ul className="list-section">
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <span>Nome</span>
              <input type="text" value={item.nome} onChange={(e) => updateItemField(item.id, 'nome', e.target.value)} />
            </label>
            <label>
              <span>Quantidade</span>
              <input
                type="number"
                value={item.quantidade}
                onChange={(e) => updateItemField(item.id, 'quantidade', Number(e.target.value))}
              />
            </label>
            <label>
              <span>Peso</span>
              <input
                type="number"
                value={item.peso}
                onChange={(e) => updateItemField(item.id, 'peso', Number(e.target.value))}
              />
            </label>
            <label>
              <span>Notas</span>
              <input type="text" value={item.notas} onChange={(e) => updateItemField(item.id, 'notas', e.target.value)} />
            </label>
            <SaveStatusBadge status={statusById[item.id] ?? 'idle'} onRetry={() => retryItem(item.id)} />
            <IconButton danger title={`Remover item ${item.nome}`} onClick={() => removeItem(item.id)}>
              ✕
            </IconButton>
          </li>
        ))}
      </ul>
      <div className="weight-total">Peso total carregado: {pesoTotal.toFixed(1)} kg</div>
    </section>
  )
}
