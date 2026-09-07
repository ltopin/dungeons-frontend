import type { FichaGeral } from '../../api/types'
import { useSectionAutosave } from '../useSectionAutosave'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { SectionTitle, Seal } from '../theme'

const ATRIBUTOS: Array<{ key: keyof FichaGeral; label: string; abbr: string }> = [
  { key: 'str', label: 'Força', abbr: 'STR' },
  { key: 'dex', label: 'Destreza', abbr: 'DEX' },
  { key: 'con', label: 'Constituição', abbr: 'CON' },
  { key: 'int', label: 'Inteligência', abbr: 'INT' },
  { key: 'wis', label: 'Sabedoria', abbr: 'WIS' },
  { key: 'cha', label: 'Carisma', abbr: 'CHA' },
]

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

const mod = (score: number) => Math.floor((Number(score || 10) - 10) / 2)
const fmt = (m: number) => (m >= 0 ? `+${m}` : `${m}`)

export function GeralTab({ fichaId, geral }: { fichaId: string; geral: FichaGeral }) {
  const { value, updateField, status, retry } = useSectionAutosave<FichaGeral>(fichaId, 'geral', geral)

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
          <label key={key}>
            <span>{label}</span>
            <input
              type="text"
              value={value[key] as string}
              onChange={(e) => updateField(key, e.target.value as FichaGeral[typeof key])}
            />
          </label>
        ))}
      </div>
    </section>
  )
}
