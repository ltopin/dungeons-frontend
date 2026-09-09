import type { FichaItem, FichaMoedas } from '../../api/types'
import { SectionTitle } from '../theme'
import { RoField, RoNumBox } from './RoFields'
import { heavyLoadMultiples } from '../../rules/carryingCapacity'

const MOEDAS: Array<{ key: keyof FichaMoedas; label: string }> = [
  { key: 'pp', label: 'Platina' },
  { key: 'gp', label: 'Ouro' },
  { key: 'sp', label: 'Prata' },
  { key: 'cp', label: 'Cobre' },
]

export function InventarioReadOnly({ moedas, itens }: { moedas: FichaMoedas; itens: FichaItem[] }) {
  const multiplos = heavyLoadMultiples(moedas.cargaPesada)

  return (
    <section aria-label="Inventário" className="panel">
      <h2>Moedas</h2>
      <SectionTitle accent="gold">Tesouro</SectionTitle>
      <div className="currency-row">
        {MOEDAS.map(({ key, label }) => (
          <RoNumBox key={key} label={label} value={moedas[key]} />
        ))}
      </div>

      <SectionTitle accent="blue">Capacidade de Carga</SectionTitle>
      <div className="field-grid">
        <RoNumBox label="carga leve" value={moedas.cargaLeve} />
        <RoNumBox label="carga média" value={moedas.cargaMedia} />
        <RoNumBox label="carga pesada" value={moedas.cargaPesada} />
      </div>
      <div className="field-grid">
        <RoNumBox label="erguer sobre a cabeça" value={multiplos.ergerSobreCabeca} />
        <RoNumBox label="erguer do chão" value={multiplos.ergerDoChao} />
        <RoNumBox label="empurrar ou arrastar" value={multiplos.empurrarOuArrastar} />
      </div>

      <h2>Itens</h2>
      {itens.length === 0 && <p className="hint">Nenhum item registrado.</p>}
      <ul className="list-section">
        {itens.map((item) => (
          <li key={item.id}>
            <div className="field-grid">
              <RoField label="Nome" value={item.nome} />
              <RoField label="Quantidade" value={item.quantidade} />
              <RoField label="Peso" value={item.peso} />
              <RoField label="Notas" value={item.notas} />
            </div>
          </li>
        ))}
      </ul>
      <div className="weight-total">Peso total carregado: {moedas.pesoTotalCarregado.toFixed(1)} kg</div>
    </section>
  )
}
