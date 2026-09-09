import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { obterCampanha } from '../api/campaigns'
import type { Campanha } from '../api/types'
import { MasterDashboard } from './MasterDashboard'
import { GeracaoMundoStatus } from './GeracaoMundoStatus'
import { EscolherPapelPage } from './EscolherPapelPage'

/** Enquanto a geração de mundo por IA está em andamento, reconsulta a campanha periodicamente. */
const INTERVALO_POLL_GERACAO_MS = 4000

export function CampaignPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [campanhaCriada] = useState(Boolean((location.state as { campanhaCriada?: boolean } | null)?.campanhaCriada))
  const [campanha, setCampanha] = useState<Campanha | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)
  const erroRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (erro) erroRef.current?.focus()
  }, [erro])

  useEffect(() => {
    if (!id) return
    setErro(null)
    setCampanha(null)
    let cancelado = false
    obterCampanha(id)
      .then((dados) => {
        if (!cancelado) setCampanha(dados)
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar esta campanha.')
      })
    return () => {
      cancelado = true
    }
  }, [id, tentativa])

  // Geração de mundo por IA é assíncrona no backend — enquanto está em
  // andamento, reconsulta a campanha até o mundo ficar pronto (ou falhar).
  useEffect(() => {
    if (!id) return undefined
    if (campanha?.role !== 'aguardando-papel' || campanha.statusGeracaoMundo !== 'gerando') return undefined
    const intervalo = setInterval(() => {
      obterCampanha(id).then(setCampanha).catch(() => {})
    }, INTERVALO_POLL_GERACAO_MS)
    return () => clearInterval(intervalo)
  }, [id, campanha?.role, campanha?.statusGeracaoMundo])

  if (!id) return null

  if (erro) {
    return (
      <main className="campaigns-screen">
        <section className="campaigns-screen__panel">
          <p ref={erroRef} role="alert" tabIndex={-1} className="campaigns-screen__error">
            {erro}
            <button type="button" className="campaigns-screen__retry" onClick={() => setTentativa((n) => n + 1)}>
              Tentar novamente
            </button>
          </p>
        </section>
      </main>
    )
  }

  if (!campanha) {
    return (
      <main className="campaigns-screen">
        <section className="campaigns-screen__panel">
          <p className="campaigns-screen__hint">Carregando campanha…</p>
        </section>
      </main>
    )
  }

  if (campanha.role === 'jogador') return <Navigate to={`/campanhas/${id}/ficha`} replace />

  if (campanha.role === 'aguardando-papel') {
    if (campanha.statusGeracaoMundo === 'erro') {
      return <GeracaoMundoStatus erro="Não foi possível gerar o mundo desta campanha. Tente criar novamente." />
    }
    if (campanha.statusGeracaoMundo === 'gerando') {
      return <GeracaoMundoStatus />
    }
    return <EscolherPapelPage campanha={campanha} />
  }

  return <MasterDashboard campanha={campanha} campanhaCriada={campanhaCriada} />
}
