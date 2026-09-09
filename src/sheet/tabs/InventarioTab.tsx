import { useMemo } from 'react'
import type { FichaGeral, FichaItem, FichaMoedas } from '../../api/types'
import { useSectionAutosave } from '../useSectionAutosave'
import { useListSection } from '../useListSection'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { ConfirmIconButton, Field, NumBox, SectionTitle } from '../theme'
import { carryingCapacity, heavyLoadMultiples } from '../../rules/carryingCapacity'

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
  geral,
  onMoedasSaved,
  onItensChange,
}: {
  fichaId: string
  moedas: FichaMoedas
  itens: FichaItem[]
  geral: FichaGeral
  onMoedasSaved?: (moedas: FichaMoedas) => void
  onItensChange?: (itens: FichaItem[]) => void
}) {
  const { items, addItem, removeItem, updateItemField, statusById, retryItem, createError } =
    useListSection<FichaItem>(fichaId, 'itens', itens, undefined, onItensChange)

  const pesoTotal = items.reduce((acc, item) => acc + Number(item.peso || 0) * Number(item.quantidade || 1), 0)

  const moedasAutosave = useSectionAutosave<FichaMoedas>(
    fichaId,
    'moedas',
    moedas,
    () => {
      const carga = carryingCapacity({ forca: geral.str, tamanho: geral.tamanho })
      return {
        cargaLeve: carga.leve,
        cargaMedia: carga.media,
        cargaPesada: carga.pesada,
        pesoTotalCarregado: pesoTotal,
      }
    },
    onMoedasSaved,
  )

  const carga = useMemo(
    () => carryingCapacity({ forca: geral.str, tamanho: geral.tamanho }),
    [geral.str, geral.tamanho],
  )
  const multiplos = useMemo(() => heavyLoadMultiples(carga.pesada), [carga.pesada])

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

      <SectionTitle accent="blue">Capacidade de Carga</SectionTitle>
      <div className="field-grid">
        <NumBox label="carga leve" value={carga.leve} readOnly />
        <NumBox label="carga média" value={carga.media} readOnly />
        <NumBox label="carga pesada" value={carga.pesada} readOnly />
      </div>
      <div className="field-grid">
        <NumBox label="erguer sobre a cabeça" value={multiplos.ergerSobreCabeca} readOnly />
        <NumBox label="erguer do chão" value={multiplos.ergerDoChao} readOnly />
        <NumBox label="empurrar ou arrastar" value={multiplos.empurrarOuArrastar} readOnly />
      </div>

      <div className="section-header">
        <h2>Itens</h2>
        <button className="add-btn" type="button" onClick={() => addItem({ nome: 'Novo item', quantidade: 1, peso: 0, notas: '' })}>
          Adicionar item
        </button>
      </div>
      {createError && <p role="alert">{createError}</p>}
      {items.length === 0 && (
        <p className="hint">Nenhum item cadastrado ainda — adicione o primeiro item do inventário.</p>
      )}
      <ul className="list-section">
        {items.map((item) => (
          <li key={item.id}>
            <div className="field-grid">
              <Field label="Nome">
                <input type="text" value={item.nome} onChange={(e) => updateItemField(item.id, 'nome', e.target.value)} />
              </Field>
              <Field label="Quantidade">
                <input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => updateItemField(item.id, 'quantidade', Number(e.target.value))}
                />
              </Field>
              <Field label="Peso">
                <input
                  type="number"
                  value={item.peso}
                  onChange={(e) => updateItemField(item.id, 'peso', Number(e.target.value))}
                />
              </Field>
              <Field label="Notas">
                <input type="text" value={item.notas} onChange={(e) => updateItemField(item.id, 'notas', e.target.value)} />
              </Field>
            </div>
            <div className="list-item-actions">
              <SaveStatusBadge status={statusById[item.id] ?? 'idle'} onRetry={() => retryItem(item.id)} />
              <ConfirmIconButton
                title={`Remover item ${item.nome}`}
                confirmLabel="Remover?"
                onConfirm={() => removeItem(item.id)}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="weight-total">Peso total carregado: {pesoTotal.toFixed(1)} kg</div>
    </section>
  )
}
