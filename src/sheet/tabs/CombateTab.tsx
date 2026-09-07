import type { FichaCombate } from '../../api/types'
import { useSectionAutosave } from '../useSectionAutosave'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { SectionTitle, NumBox, Dial } from '../theme'

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

function saveRow(
  label: string,
  base: number,
  magico: number,
  outros: number,
  onBase: (v: string) => void,
  onMagico: (v: string) => void,
  onOutros: (v: string) => void,
) {
  const total = Number(base || 0) + Number(magico || 0) + Number(outros || 0)
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

export function CombateTab({ fichaId, combate }: { fichaId: string; combate: FichaCombate }) {
  const { value, updateField, status, retry } = useSectionAutosave<FichaCombate>(
    fichaId,
    'combate',
    combate,
  )

  const setNum = (key: keyof FichaCombate) => (v: string) => updateField(key, Number(v) as FichaCombate[typeof key])

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
      <label>
        <span>Dados de vida</span>
        <input
          type="text"
          value={value.dadosDeVida}
          onChange={(e) => updateField('dadosDeVida', e.target.value)}
        />
      </label>

      <SectionTitle accent="gold">Classe de Armadura</SectionTitle>
      <div className="dial-row three-big">
        <Dial label="CA">
          <input
            className="dial-input"
            type="number"
            value={value.caTotal}
            onChange={(e) => updateField('caTotal', Number(e.target.value))}
          />
        </Dial>
        <Dial label="Toque">
          <input
            className="dial-input"
            type="number"
            value={value.caToque}
            onChange={(e) => updateField('caToque', Number(e.target.value))}
          />
        </Dial>
        <Dial label="Desprevenido">
          <input
            className="dial-input"
            type="number"
            value={value.caSurpreendido}
            onChange={(e) => updateField('caSurpreendido', Number(e.target.value))}
          />
        </Dial>
      </div>
      <div className="field-grid six">
        {AC_FIELDS.map(({ key, label }) => (
          <NumBox key={key} label={label} value={value[key] as number} onChange={setNum(key)} />
        ))}
      </div>

      <SectionTitle accent="blue">Testes de Resistência</SectionTitle>
      {saveRow(
        'Fortitude',
        value.fortBase,
        value.fortMagico,
        value.fortOutros,
        setNum('fortBase'),
        setNum('fortMagico'),
        setNum('fortOutros'),
      )}
      {saveRow(
        'Reflexos',
        value.reflexosBase,
        value.reflexosMagico,
        value.reflexosOutros,
        setNum('reflexosBase'),
        setNum('reflexosMagico'),
        setNum('reflexosOutros'),
      )}
      {saveRow(
        'Vontade',
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
    </section>
  )
}
