import { Field, SectionTitle } from '../../sheet/theme'

export function TamanhoGrupoStep({
  value,
  onChange,
  onConcluir,
}: {
  value: number | ''
  onChange: (value: number | '') => void
  onConcluir: () => void
}) {
  const podeConcluir = typeof value === 'number' && value >= 1

  return (
    <section aria-label="Tamanho do Grupo" className="wizard-step">
      <SectionTitle accent="gold">Tamanho do grupo</SectionTitle>
      <p className="hint">Quantos jogadores esta campanha deve esperar acomodar?</p>

      <Field label="Número de jogadores">
        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </Field>

      <div className="wizard-step-actions">
        <button type="button" className="add-btn" disabled={!podeConcluir} onClick={onConcluir}>
          Confirmar tamanho do grupo
        </button>
        {!podeConcluir && <span className="hint">Informe quantos jogadores para continuar.</span>}
      </div>
    </section>
  )
}
