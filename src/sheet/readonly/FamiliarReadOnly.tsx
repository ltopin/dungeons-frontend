import type { FichaFamiliar } from '../../api/types'
import { SectionTitle } from '../theme'
import { RoField } from './RoFields'

const TEXT_FIELDS: Array<{ key: keyof FichaFamiliar; label: string }> = [
  { key: 'nome', label: 'Nome' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'dv', label: 'Dados de vida' },
  { key: 'tendencia', label: 'Tendência' },
  { key: 'face', label: 'Face' },
]

const NUM_FIELDS: Array<{ key: keyof FichaFamiliar; label: string }> = [
  { key: 'iniciativa', label: 'Iniciativa' },
  { key: 'deslocamento', label: 'Deslocamento' },
  { key: 'ca', label: 'CA' },
  { key: 'fortitude', label: 'Fortitude' },
  { key: 'reflexos', label: 'Reflexos' },
  { key: 'vontade', label: 'Vontade' },
  { key: 'cmb', label: 'CMB' },
  { key: 'cmd', label: 'CMD' },
]

const ATRIBUTOS: Array<{ key: keyof FichaFamiliar; label: string }> = [
  { key: 'str', label: 'FOR' },
  { key: 'dex', label: 'DES' },
  { key: 'con', label: 'CON' },
  { key: 'int', label: 'INT' },
  { key: 'wis', label: 'SAB' },
  { key: 'cha', label: 'CAR' },
]

const TEXTAREA_FIELDS: Array<{ key: keyof FichaFamiliar; label: string }> = [
  { key: 'ataques', label: 'Ataques' },
  { key: 'ae', label: 'Ataques especiais (AE)' },
  { key: 'qe', label: 'Qualidades especiais (QE)' },
]

export function FamiliarReadOnly({ familiar }: { familiar: FichaFamiliar | undefined }) {
  if (!familiar) {
    return (
      <section aria-label="Familiar" className="panel">
        <h2>Familiar / Companheiro Animal</h2>
        <p className="hint">Sem familiar.</p>
      </section>
    )
  }

  return (
    <section aria-label="Familiar" className="panel">
      <h2>Familiar / Companheiro Animal</h2>

      <SectionTitle accent="gold">Identidade</SectionTitle>
      <div className="field-grid">
        {TEXT_FIELDS.map(({ key, label }) => (
          <RoField key={key} label={label} value={familiar[key] as string} />
        ))}
      </div>

      <SectionTitle accent="blood">Estatísticas</SectionTitle>
      <div className="field-grid">
        {NUM_FIELDS.map(({ key, label }) => (
          <RoField key={key} label={label} value={familiar[key] as number} />
        ))}
      </div>

      <SectionTitle accent="gold">Atributos</SectionTitle>
      <div className="field-grid six">
        {ATRIBUTOS.map(({ key, label }) => (
          <RoField key={key} label={label} value={familiar[key] as number} />
        ))}
      </div>

      <SectionTitle accent="blue">Ataques e Qualidades</SectionTitle>
      <div className="field-grid">
        {TEXTAREA_FIELDS.map(({ key, label }) => (
          <RoField key={key} label={label} value={familiar[key] as string} />
        ))}
      </div>
    </section>
  )
}
