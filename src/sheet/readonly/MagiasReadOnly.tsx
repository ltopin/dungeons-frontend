import type { FichaMagia, FichaMagiaNivel, FichaMagiasConfig } from '../../api/types'
import { SectionTitle } from '../theme'
import { RoField, RoStar } from './RoFields'

export function MagiasReadOnly({
  magiasConfig,
  magiaNiveis,
  magias,
}: {
  magiasConfig: FichaMagiasConfig
  magiaNiveis: FichaMagiaNivel[]
  magias: FichaMagia[]
}) {
  const magiasPorNivel = (nivel: number) => magias.filter((m) => m.nivel === nivel)
  const niveisComEspacoOuMagia = [...magiaNiveis]
    .sort((a, b) => a.nivel - b.nivel)
    .filter((nivel) => nivel.espacosPorDia !== null || magiasPorNivel(nivel.nivel).length > 0)

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
            </div>
            {magiasPorNivel(nivel.nivel).length > 0 && (
              <div className="spell-entries">
                {magiasPorNivel(nivel.nivel).map((magia) => (
                  <div className="spell-entry" key={magia.id}>
                    <RoStar active={magia.preparada} title="Preparada" />
                    <RoField label="Nome" value={magia.nome} />
                    <RoField label="Notas" value={magia.notas} />
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
