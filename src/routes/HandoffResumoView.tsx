/**
 * Exibe o resumo de handoff gerado pela IA (o que já aconteceu, ganchos em
 * aberto, segredos não revelados) para o novo mestre humano — ver
 * `ai-master-handoff`. Reaproveitado tanto logo após o handoff quanto ao
 * reabrir o resumo a partir do dashboard depois.
 */
export function HandoffResumoView({
  resumo,
  onFechar,
  fecharLabel = 'Ir para o dashboard',
}: {
  resumo: string
  onFechar?: () => void
  fecharLabel?: string
}) {
  return (
    <section className="campaigns-screen__panel" aria-label="Resumo da transição para mestre humano">
      <h2 className="campaigns-screen__section-title">Resumo para o novo mestre</h2>
      <p className="campaigns-screen__lore-content">{resumo}</p>
      {onFechar && (
        <button type="button" className="campaigns-screen__join" onClick={onFechar}>
          {fecharLabel}
        </button>
      )}
    </section>
  )
}
