import type { FichaGeral, FichaMagia, FichaMagiaNivel, FichaMagiasConfig } from '../../api/types'
import { SectionTitle } from '../theme'
import { RoField, RoStar } from './RoFields'
import { atributoScore, fmt } from '../abilityMod'
import { attributeModifier } from '../../rules/attributeMods'
import { spellDC } from '../../rules/spells'

const DETALHE_FIELDS: Array<{ key: keyof FichaMagia; label: string }> = [
  { key: 'escola', label: 'Escola' },
  { key: 'tempoFormulacao', label: 'Tempo de formulação' },
  { key: 'componentes', label: 'Componentes' },
  { key: 'alcance', label: 'Alcance' },
  { key: 'alvoEfeito', label: 'Alvo/Efeito' },
  { key: 'duracao', label: 'Duração' },
  { key: 'testeResistencia', label: 'Teste de resistência' },
  { key: 'resistenciaMagia', label: 'Resistência à magia' },
  { key: 'descricao', label: 'Descrição' },
]

export function MagiasReadOnly({
  magiasConfig,
  magiaNiveis,
  magias,
  geral,
}: {
  magiasConfig: FichaMagiasConfig
  magiaNiveis: FichaMagiaNivel[]
  magias: FichaMagia[]
  geral: FichaGeral
}) {
  const magiasPorNivel = (nivel: number) => magias.filter((m) => m.nivel === nivel)
  const niveisComEspacoOuMagia = [...magiaNiveis]
    .sort((a, b) => a.nivel - b.nivel)
    .filter((nivel) => nivel.espacosPorDia !== null || magiasPorNivel(nivel.nivel).length > 0)
  const cdDaMagia = (nivel: number) =>
    spellDC({
      nivel,
      atributoMod: attributeModifier(atributoScore(geral, magiasConfig.atributoConjuracao)),
      outros: magiasConfig.cdOutros,
    })

  return (
    <section aria-label="Magias" className="panel">
      <h2>Configuração de magias</h2>
      <div className="field-grid">
        <RoField label="Atributo de conjuração" value={magiasConfig.atributoConjuracao} />
        <RoField label="Nível de conjurador" value={magiasConfig.nivelConjurador} />
        <RoField label="CD (outros)" value={magiasConfig.cdOutros} />
      </div>

      <SectionTitle accent="blue">Espaços por dia e magias</SectionTitle>
      {niveisComEspacoOuMagia.length === 0 && <p className="hint">Nenhuma magia ou espaço configurado ainda.</p>}
      <div className="spell-levels">
        {niveisComEspacoOuMagia.map((nivel) => (
          <div className="spell-level-card" key={nivel.id}>
            <div className="spell-level-head">
              <div className="spell-level-badge">{nivel.nivel}</div>
              <RoField label="Espaços/dia" value={nivel.espacosPorDia ?? '—'} />
              <RoField label="Magias adicionais" value={nivel.magiasAdicionais ?? '—'} />
              <RoField label="Magias conhecidas" value={nivel.magiasConhecidas ?? '—'} />
              <span className="spell-dc" title="CD de resistência para esse nível">
                CD {fmt(cdDaMagia(nivel.nivel))}
              </span>
            </div>
            {magiasPorNivel(nivel.nivel).length > 0 && (
              <div className="spell-entries">
                {magiasPorNivel(nivel.nivel).map((magia) => (
                  <div className="spell-entry" key={magia.id}>
                    <div className="spell-entry-header">
                      <RoStar active={magia.preparada} title="Preparada" />
                      <span className="spell-dc" title="CD de resistência dessa magia">
                        CD {fmt(cdDaMagia(magia.nivel))}
                      </span>
                    </div>
                    <div className="field-grid">
                      <RoField label="Nome" value={magia.nome} />
                      {DETALHE_FIELDS.map(({ key, label }) => (
                        <RoField key={key} label={label} value={magia[key] as string} />
                      ))}
                      <RoField label="Notas" value={magia.notas} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
