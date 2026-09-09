import { useMemo } from 'react'
import type { FichaCombate, FichaGeral } from '../../api/types'
import { useSectionAutosave } from '../useSectionAutosave'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { SectionTitle, NumBox, Dial, Field } from '../theme'
import { attributeModifier, sizeModifier } from '../../rules/attributeMods'
import { armorClass, cmb, cmd, initiative, meleeAttackBonus, rangedAttackBonus, savingThrow } from '../../rules/combat'

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

function saveRow(
  label: string,
  total: number,
  base: number,
  magico: number,
  outros: number,
  onBase: (v: string) => void,
  onMagico: (v: string) => void,
  onOutros: (v: string) => void,
) {
  return (
    <div className="save-row">
      <div className="save-name">{label}</div>
      <div className="save-total">{fmt(total)}</div>
      <span className="save-eq">=</span>
      <NumBox label="base" value={base} onChange={onBase} width={44} />
      <span className="save-plus">+</span>
      <NumBox label="mágico" value={magico} onChange={onMagico} width={44} />
      <span className="save-plus">+</span>
      <NumBox label="outros" value={outros} onChange={onOutros} width={44} />
    </div>
  )
}

function derivedRow(label: string, total: number, outros: number, onOutros: (v: string) => void) {
  return (
    <div className="save-row">
      <div className="save-name">{label}</div>
      <div className="save-total">{fmt(total)}</div>
      <span className="save-eq">=</span>
      <NumBox label="outros" value={outros} onChange={onOutros} width={44} />
    </div>
  )
}

export function CombateTab({
  fichaId,
  combate,
  geral,
  onSaved,
}: {
  fichaId: string
  combate: FichaCombate
  geral: FichaGeral
  onSaved?: (combate: FichaCombate) => void
}) {
  const forcaMod = attributeModifier(geral.str)
  const destrezaMod = attributeModifier(geral.dex)
  const tamanhoMod = sizeModifier(geral.tamanho)

  const { value, updateField, status, retry } = useSectionAutosave<FichaCombate>(
    fichaId,
    'combate',
    combate,
    (v) => {
      const ca = armorClass({
        armadura: v.caArmadura,
        escudo: v.caEscudo,
        destreza: destrezaMod,
        tamanho: tamanhoMod,
        natural: v.caNatural,
        desvio: v.caDesvio,
        outros: v.caOutros,
      })
      return {
        caDestreza: destrezaMod,
        caTamanho: tamanhoMod,
        caTotal: ca.total,
        caToque: ca.toque,
        caSurpreendido: ca.surpreendido,
        cmbTotal: cmb({ bab: v.bab, forcaMod, tamanhoMod, outros: v.cmbOutros }),
        cmdTotal: cmd({ bab: v.bab, forcaMod, destrezaMod, tamanhoMod, outros: v.cmdOutros }),
        iniciativaTotal: initiative({ destrezaMod, outros: v.iniciativaOutros }),
      }
    },
    onSaved,
  )

  const setNum = (key: keyof FichaCombate) => (v: string) => updateField(key, Number(v) as FichaCombate[typeof key])

  const ca = useMemo(
    () =>
      armorClass({
        armadura: value.caArmadura,
        escudo: value.caEscudo,
        destreza: destrezaMod,
        tamanho: tamanhoMod,
        natural: value.caNatural,
        desvio: value.caDesvio,
        outros: value.caOutros,
      }),
    [value.caArmadura, value.caEscudo, destrezaMod, tamanhoMod, value.caNatural, value.caDesvio, value.caOutros],
  )

  const fortTotal = savingThrow({
    base: value.fortBase,
    atributoMod: attributeModifier(geral.con),
    magico: value.fortMagico,
    outros: value.fortOutros,
  })
  const reflexosTotal = savingThrow({
    base: value.reflexosBase,
    atributoMod: destrezaMod,
    magico: value.reflexosMagico,
    outros: value.reflexosOutros,
  })
  const vontadeTotal = savingThrow({
    base: value.vontadeBase,
    atributoMod: attributeModifier(geral.wis),
    magico: value.vontadeMagico,
    outros: value.vontadeOutros,
  })

  const corpoACorpoTotal = meleeAttackBonus({ bab: value.bab, forcaMod, tamanhoMod, outros: value.corpoACorpoOutros })
  const distanciaTotal = rangedAttackBonus({ bab: value.bab, destrezaMod, tamanhoMod, outros: value.distanciaOutros })

  const cmbTotal = cmb({ bab: value.bab, forcaMod, tamanhoMod, outros: value.cmbOutros })
  const cmdTotal = cmd({ bab: value.bab, forcaMod, destrezaMod, tamanhoMod, outros: value.cmdOutros })

  const iniciativaTotal = initiative({ destrezaMod, outros: value.iniciativaOutros })

  return (
    <section aria-label="Combate" className="panel">
      <div className="section-header">
        <h2>Combate</h2>
        <SaveStatusBadge status={status} onRetry={retry} />
      </div>

      <SectionTitle accent="blood">Pontos de Vida</SectionTitle>
      <div className="dial-row three-big">
        <Dial label="PV máximo">
          <input
            className="dial-input"
            type="number"
            value={value.pvMax}
            onChange={(e) => updateField('pvMax', Number(e.target.value))}
          />
        </Dial>
        <Dial label="PV atual">
          <input
            className="dial-input"
            type="number"
            value={value.pvAtual}
            onChange={(e) => updateField('pvAtual', Number(e.target.value))}
          />
        </Dial>
        <Dial label="PV temporário">
          <input
            className="dial-input"
            type="number"
            value={value.pvTemp}
            onChange={(e) => updateField('pvTemp', Number(e.target.value))}
          />
        </Dial>
      </div>
      <div className="field-grid">
        <Field label="Dados de vida">
          <input type="text" value={value.dadosDeVida} onChange={(e) => updateField('dadosDeVida', e.target.value)} />
        </Field>
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
          <NumBox key={key} label={label} value={value[key] as number} onChange={setNum(key)} />
        ))}
        <NumBox label="destreza (de Geral)" value={destrezaMod} readOnly />
        <NumBox label="tamanho (de Geral)" value={tamanhoMod} readOnly />
      </div>

      <SectionTitle accent="blue">Testes de Resistência</SectionTitle>
      {saveRow(
        'Fortitude',
        fortTotal,
        value.fortBase,
        value.fortMagico,
        value.fortOutros,
        setNum('fortBase'),
        setNum('fortMagico'),
        setNum('fortOutros'),
      )}
      {saveRow(
        'Reflexos',
        reflexosTotal,
        value.reflexosBase,
        value.reflexosMagico,
        value.reflexosOutros,
        setNum('reflexosBase'),
        setNum('reflexosMagico'),
        setNum('reflexosOutros'),
      )}
      {saveRow(
        'Vontade',
        vontadeTotal,
        value.vontadeBase,
        value.vontadeMagico,
        value.vontadeOutros,
        setNum('vontadeBase'),
        setNum('vontadeMagico'),
        setNum('vontadeOutros'),
      )}

      <SectionTitle accent="gold">Estatísticas de Ataque</SectionTitle>
      <div className="field-grid">
        <NumBox label="base de ataque (BAB)" value={value.bab} onChange={setNum('bab')} />
        <NumBox label="deslocamento" value={value.deslocamento} onChange={setNum('deslocamento')} />
        {MISC_FIELDS.map(({ key, label }) => (
          <NumBox key={key} label={label} value={value[key] as number} onChange={setNum(key)} />
        ))}
      </div>
      {derivedRow('Iniciativa', iniciativaTotal, value.iniciativaOutros, setNum('iniciativaOutros'))}
      {derivedRow('Corpo a corpo', corpoACorpoTotal, value.corpoACorpoOutros, setNum('corpoACorpoOutros'))}
      {derivedRow('À distância', distanciaTotal, value.distanciaOutros, setNum('distanciaOutros'))}

      <SectionTitle accent="blue">Manobra de Combate</SectionTitle>
      {derivedRow('CMB', cmbTotal, value.cmbOutros, setNum('cmbOutros'))}
      {derivedRow('CMD', cmdTotal, value.cmdOutros, setNum('cmdOutros'))}
    </section>
  )
}
