import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { consultarStatusGeracaoMundo } from '../api/aiMaster'
import type { GeracaoMundoIA } from '../api/types'
import { EscolherPapelPage } from './EscolherPapelPage'
import { GeracaoMundoStatus } from './GeracaoMundoStatus'

const INTERVALO_POLL_GERACAO_MS = 4000

/**
 * Acompanha a geração assíncrona de mundo por `geracaoId` (`ai-world-generation`).
 * A campanha só passa a existir quando a geração conclui — por isso o
 * acompanhamento é feito pelo id da geração, não pelo id de uma campanha.
 */
export function GeracaoMundoPage() {
  const { geracaoId } = useParams<{ geracaoId: string }>()
  const [geracao, setGeracao] = useState<GeracaoMundoIA | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!geracaoId) return undefined
    let cancelado = false
    consultarStatusGeracaoMundo(geracaoId)
      .then((dados) => {
        if (!cancelado) setGeracao(dados)
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível acompanhar a geração deste mundo.')
      })
    return () => {
      cancelado = true
    }
  }, [geracaoId])

  // Geração assíncrona no backend — enquanto está pendente/em andamento,
  // reconsulta até concluir ou falhar.
  useEffect(() => {
    if (!geracaoId) return undefined
    if (geracao?.status !== 'pendente' && geracao?.status !== 'em_andamento') return undefined
    const intervalo = setInterval(() => {
      consultarStatusGeracaoMundo(geracaoId).then(setGeracao).catch(() => {})
    }, INTERVALO_POLL_GERACAO_MS)
    return () => clearInterval(intervalo)
  }, [geracaoId, geracao?.status])

  if (!geracaoId) return null

  if (erro) return <GeracaoMundoStatus erro={erro} />
  if (!geracao || geracao.status === 'pendente' || geracao.status === 'em_andamento') {
    return <GeracaoMundoStatus />
  }
  if (geracao.status === 'erro') {
    return (
      <GeracaoMundoStatus erro={geracao.erro ?? 'Não foi possível gerar o mundo desta campanha. Tente criar novamente.'} />
    )
  }
  if (geracao.campanhaId) {
    return <EscolherPapelPage geracaoId={geracaoId} campanhaId={geracao.campanhaId} />
  }
  return <GeracaoMundoStatus erro="Geração concluída, mas sem campanha associada. Tente criar novamente." />
}
