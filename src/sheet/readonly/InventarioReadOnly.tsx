import type { FichaItem, FichaMoedas } from '../../api/types'
import { SectionTitle } from '../theme'
import { RoField, RoNumBox } from './RoFields'

const MOEDAS: Array<{ key: keyof FichaMoedas; label: string }> = [
  { key: 'pp', label: 'Platina' },
  { key: 'gp', label: 'Ouro' },
  { key: 'sp', label: 'Prata' },
  { key: 'cp', label: 'Cobre' },
]

export function InventarioReadOnly({ moedas, itens }: { moedas: FichaMoedas; itens: FichaItem[] }) {
  const pesoTotal = itens.reduce((acc, item) => acc + Number(item.peso || 0) * Number(item.quantidade || 1), 0)

  return (
    <section aria-label="Inventário" className="panel">
      <h2>Moedas</h2>
      <SectionTitle accent="gold">Tesouro</SectionTitle>
      <div className="currency-row">
        {MOEDAS.map(({ key, label }) => (
          <RoNumBox key={key} label={label} value={moedas[key]} />
        ))}
      </div>

      <h2>Itens</h2>
      {itens.length === 0 && <p className="hint">Nenhum item registrado.</p>}
      <ul className="list-section">
        {itens.map((item) => (
          <li key={item.id}>
            <RoField label="Nome" value={item.nome} />
            <RoField label="Quantidade" value={item.quantidade} />
            <RoField label="Peso" value={item.peso} />
            <RoField label="Notas" value={item.notas} />
          </li>
        ))}
      </ul>
      <div className="weight-total">Peso total carregado: {pesoTotal.toFixed(1)} kg</div>
    </section>
  )
}
