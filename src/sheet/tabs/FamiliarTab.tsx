import type { FichaFamiliar } from '../../api/types'
import { useSectionAutosave } from '../useSectionAutosave'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { Field, SectionTitle } from '../theme'

const FAMILIAR_VAZIO: FichaFamiliar = {
  nome: '',
  tipo: '',
  dv: '',
  iniciativa: 0,
  deslocamento: 0,
  ca: 0,
  ataques: '',
  ae: '',
  qe: '',
  tendencia: '',
  fortitude: 0,
  reflexos: 0,
  vontade: 0,
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
  cmb: 0,
  cmd: 0,
  face: '',
}

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

export function FamiliarTab({
  fichaId,
  familiar,
  onSaved,
}: {
  fichaId: string
  familiar: FichaFamiliar | undefined
  onSaved?: (familiar: FichaFamiliar) => void
}) {
  const { value, updateField, status, retry } = useSectionAutosave<FichaFamiliar>(
    fichaId,
    'familiar',
    familiar ?? FAMILIAR_VAZIO,
    undefined,
    onSaved,
  )

  return (
    <section aria-label="Familiar" className="panel">
      <div className="section-header">
        <h2>Familiar / Companheiro Animal</h2>
        <SaveStatusBadge status={status} onRetry={retry} />
      </div>
      {!familiar && <p className="hint">Nenhum familiar registrado ainda — preencha um campo para criar a seção.</p>}

      <SectionTitle accent="gold">Identidade</SectionTitle>
      <div className="field-grid">
        {TEXT_FIELDS.map(({ key, label }) => (
          <Field key={key} label={label}>
            <input
              type="text"
              value={(value[key] as string) ?? ''}
              onChange={(e) => updateField(key, e.target.value as FichaFamiliar[typeof key])}
            />
          </Field>
        ))}
      </div>

      <SectionTitle accent="blood">Estatísticas</SectionTitle>
      <div className="field-grid">
        {NUM_FIELDS.map(({ key, label }) => (
          <Field key={key} label={label}>
            <input
              type="number"
              value={(value[key] as number) ?? 0}
              onChange={(e) => updateField(key, Number(e.target.value) as FichaFamiliar[typeof key])}
            />
          </Field>
        ))}
      </div>

      <SectionTitle accent="gold">Atributos</SectionTitle>
      <div className="field-grid six">
        {ATRIBUTOS.map(({ key, label }) => (
          <Field key={key} label={label}>
            <input
              type="number"
              value={(value[key] as number) ?? 0}
              onChange={(e) => updateField(key, Number(e.target.value) as FichaFamiliar[typeof key])}
            />
          </Field>
        ))}
      </div>

      <SectionTitle accent="blue">Ataques e Qualidades</SectionTitle>
      <div className="field-grid">
        {TEXTAREA_FIELDS.map(({ key, label }) => (
          <Field key={key} label={label}>
            <input
              type="text"
              value={(value[key] as string) ?? ''}
              onChange={(e) => updateField(key, e.target.value as FichaFamiliar[typeof key])}
            />
          </Field>
        ))}
      </div>
    </section>
  )
}
