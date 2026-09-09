import { useEffect, useState } from 'react'
import type { FichaGeral } from '../../api/types'
import type { CompendioClasse, CompendioRaca } from '../../api/compendioTypes'
import { useSectionAutosave } from '../../sheet/useSectionAutosave'
import { SaveStatusBadge } from '../../sheet/SaveStatusBadge'
import { Field, SectionTitle } from '../../sheet/theme'

export function RacaClasseStep({
  fichaId,
  geral,
  racas,
  classes,
  racaId,
  classeId,
  onEscolha,
  onChange,
  onSaved,
  onConcluir,
}: {
  fichaId: string
  geral: FichaGeral
  racas: CompendioRaca[]
  classes: CompendioClasse[]
  racaId: string | undefined
  classeId: string | undefined
  onEscolha: (racaId: string | undefined, classeId: string | undefined) => void
  onChange?: (geral: FichaGeral) => void
  onSaved?: (geral: FichaGeral) => void
  onConcluir: () => void
}) {
  const { value, updateField, status, retry, flush } = useSectionAutosave<FichaGeral>(
    fichaId,
    'geral',
    geral,
    undefined,
    onSaved,
  )
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    onChange?.(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  async function confirmar() {
    setConfirmando(true)
    try {
      await flush()
      onConcluir()
    } catch {
      // erro já sinalizado pelo SaveStatusBadge; permanece na etapa
    } finally {
      setConfirmando(false)
    }
  }

  const raca = racas.find((r) => r.id === racaId)
  const classe = classes.find((c) => c.id === classeId)
  const podeConcluir = Boolean(racaId && classeId && (value.nomePersonagem ?? '').trim())
  const caracteristicasNivel1 = classe?.caracteristicas.filter((c) => c.nivel === 1) ?? []

  return (
    <section aria-label="Raça e Classe" className="wizard-step">
      <div className="section-header">
        <h2>Raça e Classe</h2>
        <SaveStatusBadge status={status} onRetry={retry} />
      </div>

      <SectionTitle accent="gold">Identidade</SectionTitle>
      <div className="field-grid three">
        <Field label="Nome do personagem">
          <input
            type="text"
            value={value.nomePersonagem ?? ''}
            onChange={(e) => updateField('nomePersonagem', e.target.value)}
          />
        </Field>
        <Field label="Alinhamento">
          <input
            type="text"
            value={value.alinhamento ?? ''}
            onChange={(e) => updateField('alinhamento', e.target.value)}
          />
        </Field>
        <Field label="Divindade">
          <input
            type="text"
            value={value.divindade ?? ''}
            onChange={(e) => updateField('divindade', e.target.value)}
          />
        </Field>
      </div>

      <SectionTitle accent="gold">Raça</SectionTitle>
      <div className="wizard-choice-grid">
        {racas.map((r) => (
          <button
            key={r.id}
            type="button"
            className="wizard-choice-card"
            aria-pressed={racaId === r.id}
            onClick={() => {
              onEscolha(r.id, classeId)
              updateField('raca', r.nome)
              updateField('tamanho', r.tamanho)
            }}
          >
            <span className="wizard-choice-nome">{r.nome}</span>
            <span className="wizard-choice-detalhe">
              {Object.entries(r.ajustes_atributo).length === 0
                ? '+2 à escolha (definido na etapa Atributos)'
                : Object.entries(r.ajustes_atributo)
                    .map(([k, v]) => `${k.toUpperCase()} ${v > 0 ? '+' : ''}${v}`)
                    .join(', ')}
            </span>
          </button>
        ))}
      </div>
      {raca && (
        <ul className="wizard-tracos">
          {raca.tracos.map((t) => (
            <li key={t.nome}>
              <strong>{t.nome}:</strong> {t.descricao}
            </li>
          ))}
        </ul>
      )}

      <SectionTitle accent="gold">Classe</SectionTitle>
      <div className="wizard-choice-grid">
        {classes.map((c) => (
          <button
            key={c.id}
            type="button"
            className="wizard-choice-card"
            aria-pressed={classeId === c.id}
            onClick={() => {
              onEscolha(racaId, c.id)
              updateField('classe', c.nome)
              if (!value.nivel) updateField('nivel', 1)
            }}
          >
            <span className="wizard-choice-nome">{c.nome}</span>
            <span className="wizard-choice-detalhe">
              Dado de vida {c.dado_vida} · BAB {c.bab_progressao}
              {c.conjurador ? ` · conjurador (${(c.atributo_conjuracao ?? '').toUpperCase()})` : ''}
            </span>
          </button>
        ))}
      </div>
      {classe && (
        <>
          <p className="hint">
            {classe.pontos_pericia_por_nivel} pontos de perícia/nível
          </p>
          {caracteristicasNivel1.length > 0 && (
            <ul className="wizard-tracos">
              {caracteristicasNivel1.map((c) => (
                <li key={c.nome}>
                  <strong>{c.nome}:</strong> {c.descricao}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="wizard-step-actions">
        <button type="button" className="add-btn" disabled={!podeConcluir || confirmando} onClick={confirmar}>
          {confirmando ? 'Salvando…' : 'Confirmar raça e classe'}
        </button>
        {!podeConcluir && <span className="hint">Escolha nome, raça e classe para continuar.</span>}
      </div>
    </section>
  )
}
