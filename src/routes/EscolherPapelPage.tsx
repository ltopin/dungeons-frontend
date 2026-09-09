import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { entrarNaCampanha } from '../api/campaigns'
import type { Campanha } from '../api/types'
import { AssumirMestreConfirm } from './AssumirMestreConfirm'
import { HandoffResumoView } from './HandoffResumoView'

/**
 * Escolha de papel do criador ao final da geração de mundo por IA
 * (`ai-world-generation`): entrar como jogador (a IA segue como mestre) ou
 * assumir como mestre imediatamente. O criador também pode sair sem escolher
 * — a campanha continua disponível na lista, jogável com a IA, e ele volta
 * a ver esta mesma tela da próxima vez que acessá-la.
 */
export function EscolherPapelPage({ campanha }: { campanha: Campanha }) {
  const navigate = useNavigate()
  const [entrando, setEntrando] = useState(false)
  const [erroEntrar, setErroEntrar] = useState<string | null>(null)
  const [resumoHandoff, setResumoHandoff] = useState<string | null>(null)

  async function entrarComoJogador() {
    setErroEntrar(null)
    setEntrando(true)
    try {
      await entrarNaCampanha(campanha.id)
      navigate(`/campanhas/${campanha.id}/ficha`)
    } catch {
      setErroEntrar('Não foi possível entrar na campanha agora. Tente novamente em instantes.')
      setEntrando(false)
    }
  }

  if (resumoHandoff) {
    return (
      <main className="campaigns-screen">
        <header className="campaigns-screen__masthead">
          <h1>{campanha.nome}</h1>
        </header>
        <HandoffResumoView resumo={resumoHandoff} onFechar={() => navigate(`/campanhas/${campanha.id}`)} />
      </main>
    )
  }

  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="escolher-papel-heading">{campanha.nome}</h1>
        <Link to="/campanhas" className="campaigns-screen__logout">
          Voltar às campanhas
        </Link>
      </header>

      <section className="campaigns-screen__panel" aria-labelledby="escolher-papel-heading">
        <p className="campaigns-screen__hint">
          O mundo está pronto! A IA já pode conduzir esta campanha como mestre. Escolha como você quer participar —
          se preferir decidir depois, pode sair agora e voltar por aqui mais tarde.
        </p>

        <div className="campaigns-screen__masthead-actions">
          <button type="button" className="campaigns-screen__join" disabled={entrando} onClick={entrarComoJogador}>
            {entrando ? 'Entrando…' : 'Entrar como jogador'}
          </button>
          <AssumirMestreConfirm campanhaId={campanha.id} onHandoffConcluido={setResumoHandoff} />
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
