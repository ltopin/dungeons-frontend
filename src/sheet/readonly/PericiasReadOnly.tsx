import type { FichaPericia } from '../../api/types'
import { RoField, RoStar } from './RoFields'

export function PericiasReadOnly({ pericias }: { pericias: FichaPericia[] }) {
  return (
    <section aria-label="Perícias" className="panel">
      <h2>Perícias</h2>
      <p className="hint">A estrela marca perícia de classe.</p>

      {pericias.length === 0 && <p className="hint">Nenhuma perícia registrada.</p>}

      <ul className="list-section">
        {pericias.map((pericia) => (
          <li key={pericia.id}>
            <RoStar active={pericia.periciaDeClasse} title="Perícia de classe" />
            <RoField label="Nome" value={pericia.nome} />
            <RoField label="Atributo" value={pericia.atributo} />
            <RoField label="Graduações" value={pericia.graduacoes} />
            <RoField label="Outros" value={pericia.outros} />
          </li>
        ))}
      </ul>
    </section>
  )
}
