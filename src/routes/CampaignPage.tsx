import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { obterCampanha } from '../api/campaigns'
import type { Campanha } from '../api/types'
import { MasterDashboard } from './MasterDashboard'

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

  return <MasterDashboard campanha={campanha} campanhaCriada={campanhaCriada} />
}
