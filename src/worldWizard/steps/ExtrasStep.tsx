import { Field, SectionTitle } from '../../sheet/theme'

export function ExtrasStep({
  inspiracoes,
  idioma,
  nomeMundo,
  onChangeInspiracoes,
  onChangeIdioma,
  onChangeNomeMundo,
  enviando,
  erro,
  onConcluir,
}: {
  inspiracoes: string
  idioma: string
  nomeMundo: string
  onChangeInspiracoes: (value: string) => void
  onChangeIdioma: (value: string) => void
  onChangeNomeMundo: (value: string) => void
  enviando: boolean
  erro: string | null
  onConcluir: () => void
}) {
  return (
    <section aria-label="Extras" className="wizard-step">
      <SectionTitle accent="gold">Extras (opcional)</SectionTitle>
      <p className="hint">Estes campos ajudam a IA a dar um toque mais específico ao mundo, mas não são obrigatórios.</p>

      <Field label="Inspirações">
        <textarea
          rows={3}
          value={inspiracoes}
          placeholder="Ex.: O Nome do Vento, Dark Souls, Avatar…"
          onChange={(e) => onChangeInspiracoes(e.target.value)}
        />
      </Field>
      <div className="field-grid">
        <Field label="Idioma">
          <input
            type="text"
            value={idioma}
            placeholder="Ex.: Português"
            onChange={(e) => onChangeIdioma(e.target.value)}
          />
        </Field>
        <Field label="Nome do mundo">
          <input
            type="text"
            value={nomeMundo}
            placeholder="Deixe em branco para a IA escolher"
            onChange={(e) => onChangeNomeMundo(e.target.value)}
          />
        </Field>
      </div>

      {erro && (
        <p role="alert" className="save-status save-status--erro">
          {erro}
        </p>
      )}

      <div className="wizard-step-actions">
        <button type="button" className="add-btn" disabled={enviando} onClick={onConcluir}>
          {enviando ? 'Gerando mundo…' : 'Confirmar e gerar mundo'}
        </button>
      </div>
    </section>
  )
}
