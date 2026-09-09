import { Field, SectionTitle } from '../../sheet/theme'

export function RestricoesStep({
  semRestricoes,
  texto,
  onChangeSemRestricoes,
  onChangeTexto,
  onConcluir,
}: {
  semRestricoes: boolean
  texto: string
  onChangeSemRestricoes: (value: boolean) => void
  onChangeTexto: (value: string) => void
  onConcluir: () => void
}) {
  const podeConcluir = semRestricoes || texto.trim().length > 0

  return (
    <section aria-label="Restrições de Conteúdo" className="wizard-step">
      <SectionTitle accent="gold">Restrições de conteúdo</SectionTitle>
      <p className="hint">
        O que a IA deve evitar ao narrar esta campanha? A IA não modera conteúdo em tempo real além do que for
        informado aqui.
      </p>

      <Field label="Sem restrições especiais">
        <input
          type="checkbox"
          checked={semRestricoes}
          onChange={(e) => onChangeSemRestricoes(e.target.checked)}
        />
      </Field>

      {!semRestricoes && (
        <Field label="Restrições de conteúdo">
          <textarea
            rows={4}
            value={texto}
            placeholder="Ex.: sem violência gráfica, sem temas de horror corporal…"
            onChange={(e) => onChangeTexto(e.target.value)}
          />
        </Field>
      )}

      <div className="wizard-step-actions">
        <button type="button" className="add-btn" disabled={!podeConcluir} onClick={onConcluir}>
          Confirmar restrições
        </button>
        {!podeConcluir && (
          <span className="hint">Descreva as restrições ou marque "sem restrições especiais" para continuar.</span>
        )}
      </div>
    </section>
  )
}
