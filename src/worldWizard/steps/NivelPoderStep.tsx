import { SectionTitle } from '../../sheet/theme'

const NIVEIS_DE_PODER = [
  { valor: 'baixo', nome: 'Baixo', detalhe: 'Personagens mundanos, sobrevivência dura, sem grandes poderes.' },
  { valor: 'padrao', nome: 'Padrão', detalhe: 'Início heroico clássico, nível 1, riscos reais.' },
  { valor: 'alto', nome: 'Alto', detalhe: 'Heróis já capazes, nível 3+, feitos notáveis desde o início.' },
  { valor: 'epico', nome: 'Épico', detalhe: 'Figuras lendárias desde o início, ameaças de escala mundial.' },
]

export function NivelPoderStep({
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
    <section aria-label="Nível de Poder" className="wizard-step">
      <SectionTitle accent="gold">Nível de poder inicial</SectionTitle>
      <p className="hint">Define quão poderosos os personagens já começam a campanha.</p>

      <div className="wizard-choice-grid">
        {NIVEIS_DE_PODER.map((nivel) => (
          <button
            key={nivel.valor}
            type="button"
            className="wizard-choice-card"
            aria-pressed={value === nivel.valor}
            onClick={() => onChange(nivel.valor)}
          >
            <span className="wizard-choice-nome">{nivel.nome}</span>
            <span className="wizard-choice-detalhe">{nivel.detalhe}</span>
          </button>
        ))}
      </div>

      <div className="wizard-step-actions">
        <button type="button" className="add-btn" disabled={!podeConcluir} onClick={onConcluir}>
          Confirmar nível de poder
        </button>
        {!podeConcluir && <span className="hint">Escolha um nível de poder para continuar.</span>}
      </div>
    </section>
  )
}
