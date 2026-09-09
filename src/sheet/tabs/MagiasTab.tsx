import type { FichaGeral, FichaMagia, FichaMagiaNivel, FichaMagiasConfig } from '../../api/types'
import { useSectionAutosave } from '../useSectionAutosave'
import { useListSection } from '../useListSection'
import { useMagiaNiveis } from '../useMagiaNiveis'
import { SaveStatusBadge } from '../SaveStatusBadge'
import { ConfirmIconButton, Field, SectionTitle } from '../theme'
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

export function MagiasTab({
  fichaId,
  magiasConfig,
  magiaNiveis,
  magias,
  geral,
  onMagiasConfigSaved,
  onMagiaNiveisSaved,
  onMagiasChange,
}: {
  fichaId: string
  magiasConfig: FichaMagiasConfig
  magiaNiveis: FichaMagiaNivel[]
  magias: FichaMagia[]
  geral: FichaGeral
  onMagiasConfigSaved?: (magiasConfig: FichaMagiasConfig) => void
  onMagiaNiveisSaved?: (magiaNiveis: FichaMagiaNivel[]) => void
  onMagiasChange?: (magias: FichaMagia[]) => void
}) {
  const configAutosave = useSectionAutosave<FichaMagiasConfig>(
    fichaId,
    'magias-config',
    magiasConfig,
    undefined,
    onMagiasConfigSaved,
  )
  const niveis = useMagiaNiveis(fichaId, magiaNiveis, onMagiaNiveisSaved)
  const lista = useListSection<FichaMagia>(fichaId, 'magias', magias, undefined, onMagiasChange)

  const magiasPorNivel = (nivel: number) => lista.items.filter((m) => m.nivel === nivel)

  const cdDaMagia = (nivel: number) =>
    spellDC({
      nivel,
      atributoMod: attributeModifier(atributoScore(geral, configAutosave.value.atributoConjuracao)),
      outros: configAutosave.value.cdOutros,
    })

  return (
    <section aria-label="Magias" className="panel">
      <div className="section-header">
        <h2>Configuração de magias</h2>
        <SaveStatusBadge status={configAutosave.status} onRetry={configAutosave.retry} />
      </div>
      <div className="field-grid three">
        <Field label="Atributo de conjuração">
          <input
            type="text"
            value={configAutosave.value.atributoConjuracao ?? ''}
            onChange={(e) => configAutosave.updateField('atributoConjuracao', e.target.value)}
          />
        </Field>
        <Field label="Nível de conjurador">
          <input
            type="number"
            value={configAutosave.value.nivelConjurador}
            onChange={(e) => configAutosave.updateField('nivelConjurador', Number(e.target.value))}
          />
        </Field>
        <Field label="CD (outros)">
          <input
            type="number"
            value={configAutosave.value.cdOutros}
            onChange={(e) => configAutosave.updateField('cdOutros', Number(e.target.value))}
          />
        </Field>
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
                <Field label="Espaços/dia">
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
                </Field>
                <span className="spell-dc" title="CD de resistência para esse nível">
                  CD {fmt(cdDaMagia(nivel.nivel))}
                </span>
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
                      <div className="spell-entry-header">
                        <label title="Preparada">
                          <input
                            className="star-toggle"
                            type="checkbox"
                            checked={magia.preparada}
                            onChange={(e) => lista.updateItemField(magia.id, 'preparada', e.target.checked)}
                          />
                          <span>Preparada</span>
                        </label>
                        <span className="spell-dc" title="CD de resistência dessa magia">
                          CD {fmt(cdDaMagia(magia.nivel))}
                        </span>
                      </div>
                      <div className="field-grid">
                        <Field label="Nome">
                          <input
                            type="text"
                            value={magia.nome}
                            onChange={(e) => lista.updateItemField(magia.id, 'nome', e.target.value)}
                          />
                        </Field>
                        {DETALHE_FIELDS.map(({ key, label }) => (
                          <Field key={key} label={label}>
                            <input
                              type="text"
                              value={(magia[key] as string) ?? ''}
                              onChange={(e) => lista.updateItemField(magia.id, key, e.target.value)}
                            />
                          </Field>
                        ))}
                        <Field label="Notas">
                          <input
                            type="text"
                            value={magia.notas}
                            onChange={(e) => lista.updateItemField(magia.id, 'notas', e.target.value)}
                          />
                        </Field>
                      </div>
                      <div className="list-item-actions">
                        <SaveStatusBadge
                          status={lista.statusById[magia.id] ?? 'idle'}
                          onRetry={() => lista.retryItem(magia.id)}
                        />
                        <ConfirmIconButton
                          title={`Remover magia ${magia.nome}`}
                          confirmLabel="Remover?"
                          onConfirm={() => lista.removeItem(magia.id)}
                        />
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
