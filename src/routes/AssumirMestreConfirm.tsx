import { useState } from 'react'
import { assumirComoMestre } from '../api/aiMaster'

/**
 * Ação "assumir como mestre" (`ai-master-handoff`): exige confirmação
 * explícita de irreversibilidade antes de disparar o handoff. Reaproveitado
 * tanto na tela de escolha de papel (logo após a geração) quanto na ficha do
 * jogador (a qualquer momento durante a campanha).
 */
export function AssumirMestreConfirm({
  campanhaId,
  onHandoffConcluido,
}: {
  campanhaId: string
  onHandoffConcluido: (resumo: string) => void
}) {
  const [confirmando, setConfirmando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function confirmar() {
    setErro(null)
    setEnviando(true)
    try {
      const { resumo } = await assumirComoMestre(campanhaId)
      onHandoffConcluido(resumo)
    } catch {
      setErro('Não foi possível assumir como mestre agora. Tente novamente em instantes.')
      setEnviando(false)
    }
  }

  if (!confirmando) {
    return (
      <button type="button" className="campaigns-screen__retry" onClick={() => setConfirmando(true)}>
        Assumir como mestre
      </button>
    )
  }

  return (
    <div
      className="campaigns-screen__panel campaigns-screen__panel--aviso"
      role="alertdialog"
      aria-label="Confirmar assumir como mestre"
    >
      <p>
        <strong>Esta ação é irreversível.</strong> A IA será desativada permanentemente para esta campanha e você
        passará a conduzi-la como mestre humano.
      </p>
      {erro && (
        <p role="alert" className="campaigns-screen__error">
          {erro}
        </p>
      )}
      <div className="campaigns-screen__masthead-actions">
        <button type="button" className="campaigns-screen__join" disabled={enviando} onClick={confirmar}>
          {enviando ? 'Assumindo…' : 'Confirmar — assumir como mestre'}
        </button>
        <button
          type="button"
          className="campaigns-screen__logout"
          disabled={enviando}
          onClick={() => setConfirmando(false)}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
