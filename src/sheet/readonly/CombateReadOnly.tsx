import type { FichaCombate } from '../../api/types'
import { SectionTitle, Dial } from '../theme'
import { RoField, RoNumBox } from './RoFields'

const fmt = (m: number) => (m >= 0 ? `+${m}` : `${m}`)

const AC_FIELDS: Array<{ key: keyof FichaCombate; label: string }> = [
  { key: 'caArmadura', label: 'armadura' },
  { key: 'caEscudo', label: 'escudo' },
  { key: 'caDestreza', label: 'destreza' },
  { key: 'caTamanho', label: 'tamanho' },
  { key: 'caNatural', label: 'natural' },
  { key: 'caDesvio', label: 'desvio' },
  { key: 'caOutros', label: 'outros' },
]

const MISC_FIELDS: Array<{ key: keyof FichaCombate; label: string }> = [
  { key: 'iniciativaOutros', label: 'iniciativa (outros)' },
  { key: 'agarraoOutros', label: 'agarrão (outros)' },
  { key: 'corpoACorpoOutros', label: 'corpo-a-corpo (outros)' },
  { key: 'distanciaOutros', label: 'à distância (outros)' },
]

function roSaveRow(label: string, base: number, magico: number, outros: number) {
  const total = Number(base || 0) + Number(magico || 0) + Number(outros || 0)
  return (
    <div className="save-row" key={label}>
      <div className="save-name">{label}</div>
      <div className="save-total">{fmt(total)}</div>
      <span className="save-eq">=</span>
      <RoNumBox label="base" value={base} width={44} />
      <span className="save-plus">+</span>
      <RoNumBox label="mágico" value={magico} width={44} />
      <span className="save-plus">+</span>
      <RoNumBox label="outros" value={outros} width={44} />
    </div>
  )
}

export function CombateReadOnly({ combate }: { combate: FichaCombate }) {
  return (
    <section aria-label="Combate" className="panel">
      <h2>Combate</h2>

      <SectionTitle accent="blood">Pontos de Vida</SectionTitle>
      <div className="dial-row three-big">
        <Dial label="PV máximo">
          <span className="dial-value">{combate.pvMax}</span>
        </Dial>
        <Dial label="PV atual">
          <span className="dial-value">{combate.pvAtual}</span>
        </Dial>
        <Dial label="PV temporário">
          <span className="dial-value">{combate.pvTemp}</span>
        </Dial>
      </div>
      <RoField label="Dados de vida" value={combate.dadosDeVida} />

      <SectionTitle accent="gold">Classe de Armadura</SectionTitle>
      <div className="dial-row three-big">
        <Dial label="CA">
          <span className="dial-value">{combate.caTotal}</span>
        </Dial>
        <Dial label="Toque">
          <span className="dial-value">{combate.caToque}</span>
        </Dial>
        <Dial label="Desprevenido">
          <span className="dial-value">{combate.caSurpreendido}</span>
        </Dial>
      </div>
      <div className="field-grid six">
        {AC_FIELDS.map(({ key, label }) => (
          <RoNumBox key={key} label={label} value={combate[key] as number} />
        ))}
      </div>

      <SectionTitle accent="blue">Testes de Resistência</SectionTitle>
      {roSaveRow('Fortitude', combate.fortBase, combate.fortMagico, combate.fortOutros)}
      {roSaveRow('Reflexos', combate.reflexosBase, combate.reflexosMagico, combate.reflexosOutros)}
      {roSaveRow('Vontade', combate.vontadeBase, combate.vontadeMagico, combate.vontadeOutros)}

      <SectionTitle accent="gold">Estatísticas de Ataque</SectionTitle>
      <div className="field-grid">
        <RoNumBox label="base de ataque (BAB)" value={combate.bab} />
        <RoNumBox label="deslocamento" value={combate.deslocamento} />
        {MISC_FIELDS.map(({ key, label }) => (
          <RoNumBox key={key} label={label} value={combate[key] as number} />
        ))}
      </div>
    </section>
  )
}
