import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { entrarComoJogadorAposGeracao } from '../api/aiMaster'
import { AssumirMestreConfirm } from './AssumirMestreConfirm'
import { HandoffResumoView } from './HandoffResumoView'

/**
 * Escolha de papel do criador ao final da geração de mundo por IA
 * (`ai-world-generation`): entrar como jogador (a IA segue como mestre) ou
 * assumir como mestre imediatamente. Recebe `geracaoId`/`campanhaId` em vez
 * de um `Campanha` completo porque o criador ainda não tem membership nessa
 * campanha — `GET /campanhas/:id` retornaria 403 até ele escolher um papel.
 */
export function EscolherPapelPage({ geracaoId, campanhaId }: { geracaoId: string; campanhaId: string }) {
  const navigate = useNavigate()
  const [entrando, setEntrando] = useState(false)
  const [erroEntrar, setErroEntrar] = useState<string | null>(null)
  const [resumoHandoff, setResumoHandoff] = useState<string | null>(null)

  async function entrarComoJogador() {
    setErroEntrar(null)
    setEntrando(true)
    try {
      const { campanhaId: id } = await entrarComoJogadorAposGeracao(geracaoId)
      navigate(`/campanhas/${id}/ficha`)
    } catch {
      setErroEntrar('Não foi possível entrar na campanha agora. Tente novamente em instantes.')
      setEntrando(false)
    }
  }

  if (resumoHandoff) {
    return (
      <main className="campaigns-screen">
        <header className="campaigns-screen__masthead">
          <h1>Sua campanha</h1>
        </header>
        <HandoffResumoView resumo={resumoHandoff} onFechar={() => navigate(`/campanhas/${campanhaId}`)} />
      </main>
    )
  }

  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="escolher-papel-heading">O mundo está pronto!</h1>
        <Link to="/campanhas" className="campaigns-screen__logout">
          Voltar às campanhas
        </Link>
      </header>

      <section className="campaigns-screen__panel" aria-labelledby="escolher-papel-heading">
        <p className="campaigns-screen__hint">
          A IA já pode conduzir esta campanha como mestre. Escolha como você quer participar — se preferir decidir
          depois, pode sair agora e voltar por aqui mais tarde.
        </p>

        <div className="campaigns-screen__masthead-actions">
          <button type="button" className="campaigns-screen__join" disabled={entrando} onClick={entrarComoJogador}>
            {entrando ? 'Entrando…' : 'Entrar como jogador'}
          </button>
          <AssumirMestreConfirm campanhaId={campanhaId} onHandoffConcluido={setResumoHandoff} />
        </div>

        {erroEntrar && (
          <p role="alert" className="campaigns-screen__error">
            {erroEntrar}
          </p>
        )}
      </section>
    </main>
  )
}
