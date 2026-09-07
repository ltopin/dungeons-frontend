import type { FichaGeral } from '../../api/types'
import { SectionTitle } from '../theme'
import { RoField, RoSeal } from './RoFields'

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

export function GeralReadOnly({ geral }: { geral: FichaGeral }) {
  return (
    <section aria-label="Geral" className="panel">
      <h2>Geral</h2>

      <SectionTitle accent="gold">Atributos</SectionTitle>
      <div className="seals-row">
        {ATRIBUTOS.map(({ key, label, abbr }) => (
          <RoSeal
            key={key}
            abbr={abbr}
            label={label}
            mod={fmt(mod(geral[key] as number))}
            value={geral[key] as number}
          />
        ))}
      </div>

      <SectionTitle accent="gold">Identidade</SectionTitle>
      <div className="field-grid">
        {TEXT_FIELDS.map(({ key, label }) => (
          <RoField key={key} label={label} value={geral[key] as string} />
        ))}
      </div>
    </section>
  )
}
