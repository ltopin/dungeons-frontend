import type { FichaCombate, FichaGeral } from '../../api/types'
import { SectionTitle, Dial } from '../theme'
import { RoField, RoNumBox } from './RoFields'
import { attributeModifier, sizeModifier } from '../../rules/attributeMods'
import { armorClass, meleeAttackBonus, rangedAttackBonus, savingThrow } from '../../rules/combat'

const fmt = (m: number) => (m >= 0 ? `+${m}` : `${m}`)

const AC_MANUAL_FIELDS: Array<{ key: keyof FichaCombate; label: string }> = [
  { key: 'caArmadura', label: 'armadura' },
  { key: 'caEscudo', label: 'escudo' },
  { key: 'caNatural', label: 'natural' },
  { key: 'caDesvio', label: 'desvio' },
  { key: 'caOutros', label: 'outros' },
]

const MISC_FIELDS: Array<{ key: keyof FichaCombate; label: string }> = [
  { key: 'agarraoOutros', label: 'agarrão (outros)' },
]

function roSaveRow(label: string, total: number, base: number, magico: number, outros: number) {
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

function roDerivedRow(label: string, total: number, outros: number) {
  return (
    <div className="save-row" key={label}>
      <div className="save-name">{label}</div>
      <div className="save-total">{fmt(total)}</div>
      <span className="save-eq">=</span>
      <RoNumBox label="outros" value={outros} width={44} />
    </div>
  )
}

export function CombateReadOnly({ combate, geral }: { combate: FichaCombate; geral: FichaGeral }) {
  const forcaMod = attributeModifier(geral.str)
  const destrezaMod = attributeModifier(geral.dex)
  const tamanhoMod = sizeModifier(geral.tamanho)

  const ca = armorClass({
    armadura: combate.caArmadura,
    escudo: combate.caEscudo,
    destreza: destrezaMod,
    tamanho: tamanhoMod,
    natural: combate.caNatural,
    desvio: combate.caDesvio,
    outros: combate.caOutros,
  })

  const fortTotal = savingThrow({
    base: combate.fortBase,
    atributoMod: attributeModifier(geral.con),
    magico: combate.fortMagico,
    outros: combate.fortOutros,
  })
  const reflexosTotal = savingThrow({
    base: combate.reflexosBase,
    atributoMod: destrezaMod,
    magico: combate.reflexosMagico,
    outros: combate.reflexosOutros,
  })
  const vontadeTotal = savingThrow({
    base: combate.vontadeBase,
    atributoMod: attributeModifier(geral.wis),
    magico: combate.vontadeMagico,
    outros: combate.vontadeOutros,
  })
  const corpoACorpoTotal = meleeAttackBonus({
    bab: combate.bab,
    forcaMod,
    tamanhoMod,
    outros: combate.corpoACorpoOutros,
  })
  const distanciaTotal = rangedAttackBonus({
    bab: combate.bab,
    destrezaMod,
    tamanhoMod,
    outros: combate.distanciaOutros,
  })

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
      <div className="field-grid">
        <RoField label="Dados de vida" value={combate.dadosDeVida} />
      </div>

      <SectionTitle accent="gold">Classe de Armadura</SectionTitle>
      <div className="dial-row three-big">
        <Dial label="CA">
          <span className="dial-value">{ca.total}</span>
        </Dial>
        <Dial label="Toque">
          <span className="dial-value">{ca.toque}</span>
        </Dial>
        <Dial label="Desprevenido">
          <span className="dial-value">{ca.surpreendido}</span>
        </Dial>
      </div>
      <div className="field-grid six">
        {AC_MANUAL_FIELDS.map(({ key, label }) => (
          <RoNumBox key={key} label={label} value={combate[key] as number} />
        ))}
        <RoNumBox label="destreza (de Geral)" value={destrezaMod} />
        <RoNumBox label="tamanho (de Geral)" value={tamanhoMod} />
      </div>

      <SectionTitle accent="blue">Testes de Resistência</SectionTitle>
      {roSaveRow('Fortitude', fortTotal, combate.fortBase, combate.fortMagico, combate.fortOutros)}
      {roSaveRow('Reflexos', reflexosTotal, combate.reflexosBase, combate.reflexosMagico, combate.reflexosOutros)}
      {roSaveRow('Vontade', vontadeTotal, combate.vontadeBase, combate.vontadeMagico, combate.vontadeOutros)}

      <SectionTitle accent="gold">Estatísticas de Ataque</SectionTitle>
      <div className="field-grid">
        <RoNumBox label="base de ataque (BAB)" value={combate.bab} />
        <RoNumBox label="deslocamento" value={combate.deslocamento} />
        {MISC_FIELDS.map(({ key, label }) => (
          <RoNumBox key={key} label={label} value={combate[key] as number} />
        ))}
      </div>
      {roDerivedRow('Iniciativa', combate.iniciativaTotal, combate.iniciativaOutros)}
      {roDerivedRow('Corpo a corpo', corpoACorpoTotal, combate.corpoACorpoOutros)}
      {roDerivedRow('À distância', distanciaTotal, combate.distanciaOutros)}

      <SectionTitle accent="blue">Manobra de Combate</SectionTitle>
      {roDerivedRow('CMB', combate.cmbTotal, combate.cmbOutros)}
      {roDerivedRow('CMD', combate.cmdTotal, combate.cmdOutros)}
    </section>
  )
}
