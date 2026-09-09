import { Field, SectionTitle } from '../../sheet/theme'

export function GeneroTomStep({
  value,
  onChange,
  onConcluir,
}: {
  value: string
  onChange: (value: string) => void
  onConcluir: () => void
}) {
  const podeConcluir = value.trim().length > 0

  return (
    <section aria-label="Gênero e Tom" className="wizard-step">
      <SectionTitle accent="gold">Gênero e tom do mundo</SectionTitle>
      <p className="hint">
        Descreva em poucas palavras o gênero e o tom da campanha — isso guia a IA na geração do mundo, da lore e da
        narração.
      </p>
      <Field label="Gênero e tom">
        <input
          type="text"
          value={value}
          placeholder="Ex.: fantasia sombria e tom sério, ou aventura heroica e tom leve"
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>

      <div className="wizard-step-actions">
        <button type="button" className="add-btn" disabled={!podeConcluir} onClick={onConcluir}>
          Confirmar gênero e tom
        </button>
        {!podeConcluir && <span className="hint">Descreva o gênero e o tom para continuar.</span>}
      </div>
    </section>
  )
}
