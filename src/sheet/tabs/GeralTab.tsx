import { useEffect } from 'react'
import type { FichaGeral } from '../../api/types'
import { useSectionAutosave } from '../useSectionAutosave'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { Field, SectionTitle, Seal } from '../theme'
import { ABILIDADES, fmt, mod } from '../abilityMod'

const ATRIBUTOS: Array<{ key: keyof FichaGeral; label: string; abbr: string }> = ABILIDADES.map((a) => ({
  key: a.key,
  label: a.label,
  abbr: a.abbr,
}))

const TEXT_FIELDS: Array<{ key: keyof FichaGeral; label: string }> = [
  { key: 'nomePersonagem', label: 'Nome do personagem' },
  { key: 'classe', label: 'Classe' },
  { key: 'raca', label: 'Raça' },
  { key: 'alinhamento', label: 'Alinhamento' },
  { key: 'divindade', label: 'Divindade' },
  { key: 'tamanho', label: 'Tamanho' },
  { key: 'genero', label: 'Gênero' },
  { key: 'idade', label: 'Idade' },
  { key: 'altura', label: 'Altura' },
  { key: 'peso', label: 'Peso' },
]

export function GeralTab({
  fichaId,
  geral,
  onChange,
  onSaved,
}: {
  fichaId: string
  geral: FichaGeral
  onChange?: (geral: FichaGeral) => void
  onSaved?: (geral: FichaGeral) => void
}) {
  const { value, updateField, status, retry } = useSectionAutosave<FichaGeral>(
    fichaId,
    'geral',
    geral,
    undefined,
    onSaved,
  )

  useEffect(() => {
    onChange?.(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <section aria-label="Geral" className="panel">
      <div className="section-header">
        <h2>Geral</h2>
        <SaveStatusBadge status={status} onRetry={retry} />
      </div>

      <SectionTitle accent="gold">Atributos</SectionTitle>
      <div className="seals-row">
        {ATRIBUTOS.map(({ key, label, abbr }) => (
          <Seal key={key} abbr={abbr} label={label} mod={fmt(mod(value[key] as number))}>
            <input
              type="number"
              value={value[key] as number}
              onChange={(e) => updateField(key, Number(e.target.value) as FichaGeral[typeof key])}
            />
          </Seal>
        ))}
      </div>

      <SectionTitle accent="gold">Identidade</SectionTitle>
      <div className="field-grid">
        {TEXT_FIELDS.map(({ key, label }) => (
          <Field key={key} label={label}>
            <input
              type="text"
              value={value[key] as string}
              onChange={(e) => updateField(key, e.target.value as FichaGeral[typeof key])}
            />
          </Field>
        ))}
      </div>
    </section>
  )
}
