import type { FichaMagia, FichaMagiaNivel, FichaMagiasConfig } from '../../api/types'
import { useSectionAutosave } from '../useSectionAutosave'
import { useListSection } from '../useListSection'
import { useMagiaNiveis } from '../useMagiaNiveis'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { IconButton, SectionTitle } from '../theme'

export function MagiasTab({
  fichaId,
  magiasConfig,
  magiaNiveis,
  magias,
}: {
  fichaId: string
  magiasConfig: FichaMagiasConfig
  magiaNiveis: FichaMagiaNivel[]
  magias: FichaMagia[]
}) {
  const configAutosave = useSectionAutosave<FichaMagiasConfig>(fichaId, 'magias-config', magiasConfig)
  const niveis = useMagiaNiveis(fichaId, magiaNiveis)
  const lista = useListSection<FichaMagia>(fichaId, 'magias', magias)

  const magiasPorNivel = (nivel: number) => lista.items.filter((m) => m.nivel === nivel)

  return (
    <section aria-label="Magias" className="panel">
      <div className="section-header">
        <h2>Configuração de magias</h2>
        <SaveStatusBadge status={configAutosave.status} onRetry={configAutosave.retry} />
      </div>
      <div className="field-grid">
        <label>
          <span>Atributo de conjuração</span>
          <input
            type="text"
            value={configAutosave.value.atributoConjuracao}
            onChange={(e) => configAutosave.updateField('atributoConjuracao', e.target.value)}
          />
        </label>
        <label>
          <span>Nível de conjurador</span>
          <input
            type="number"
            value={configAutosave.value.nivelConjurador}
            onChange={(e) => configAutosave.updateField('nivelConjurador', Number(e.target.value))}
          />
        </label>
        <label>
          <span>CD (outros)</span>
          <input
            type="number"
            value={configAutosave.value.cdOutros}
            onChange={(e) => configAutosave.updateField('cdOutros', Number(e.target.value))}
          />
        </label>
      </div>

      <div className="section-header">
        <SectionTitle accent="blue">Espaços por dia e magias</SectionTitle>
        <SaveStatusBadge status={niveis.status} onRetry={niveis.retry} />
      </div>
      {lista.createError && <p role="alert">{lista.createError}</p>}
      <div className="spell-levels">
        {[...niveis.items]
          .sort((a, b) => a.nivel - b.nivel)
          .map((nivel) => (
            <div className="spell-level-card" key={nivel.id}>
              <div className="spell-level-head">
                <div className="spell-level-badge">{nivel.nivel}</div>
                <label>
                  <span>Espaços/dia</span>
                  <input
                    type="number"
                    value={nivel.espacosPorDia ?? ''}
                    onChange={(e) =>
                      niveis.updateEspacosPorDia(
                        nivel.nivel,
                        e.target.value === '' ? null : Number(e.target.value),
                      )
                    }
                  />
                </label>
                <button
                  className="add-btn small"
                  type="button"
                  onClick={() => lista.addItem({ nivel: nivel.nivel, nome: 'Nova magia', preparada: false, notas: '' })}
                >
                  + magia
                </button>
              </div>
              {magiasPorNivel(nivel.nivel).length > 0 && (
                <div className="spell-entries">
                  {magiasPorNivel(nivel.nivel).map((magia) => (
                    <div className="spell-entry" key={magia.id}>
                      <label title="Preparada">
                        <input
                          className="star-toggle"
                          type="checkbox"
                          checked={magia.preparada}
                          onChange={(e) => lista.updateItemField(magia.id, 'preparada', e.target.checked)}
                        />
                        <span>Preparada</span>
                      </label>
                      <label>
                        <span>Nome</span>
                        <input
                          type="text"
                          value={magia.nome}
                          onChange={(e) => lista.updateItemField(magia.id, 'nome', e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Notas</span>
                        <input
                          type="text"
                          value={magia.notas}
                          onChange={(e) => lista.updateItemField(magia.id, 'notas', e.target.value)}
                        />
                      </label>
                      <SaveStatusBadge status={lista.statusById[magia.id] ?? 'idle'} onRetry={() => lista.retryItem(magia.id)} />
                      <IconButton danger title={`Remover magia ${magia.nome}`} onClick={() => lista.removeItem(magia.id)}>
                        ✕
                      </IconButton>
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
