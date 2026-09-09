import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarFichasDaCampanha, vincularMundoACampanha } from '../api/campaigns'
import { listarMundos } from '../api/worlds'
import { obterResumoHandoff } from '../api/aiMaster'
import type { Campanha, FichaResumo, Mundo } from '../api/types'
import { useCampaignEvents } from '../realtime/useCampaignEvents'
import { EventosMesaPanel } from '../realtime/EventosMesaPanel'
import { PedirRolagemForm } from '../realtime/PedirRolagemForm'
import { HandoffResumoView } from './HandoffResumoView'

export function MasterDashboard({
  campanha,
  campanhaCriada = false,
}: {
  campanha: Campanha
  campanhaCriada?: boolean
}) {
  const [fichas, setFichas] = useState<FichaResumo[] | null>(null)
  const [erroFichas, setErroFichas] = useState<string | null>(null)
  const erroFichasRef = useRef<HTMLParagraphElement>(null)
  const { eventos, status, pedirRolagem, reconectar } = useCampaignEvents(campanha.id)
  const [erroPedido, setErroPedido] = useState<string | null>(null)

  const [resumoHandoff, setResumoHandoff] = useState<string | null>(null)
  const [carregandoResumoHandoff, setCarregandoResumoHandoff] = useState(false)
  const [erroResumoHandoff, setErroResumoHandoff] = useState<string | null>(null)

  function reabrirResumoHandoff() {
    setErroResumoHandoff(null)
    setCarregandoResumoHandoff(true)
    obterResumoHandoff(campanha.id)
      .then(({ resumo }) => setResumoHandoff(resumo))
      .catch(() => setErroResumoHandoff('Não foi possível carregar o resumo da transição agora.'))
      .finally(() => setCarregandoResumoHandoff(false))
  }

  const [mundos, setMundos] = useState<Mundo[]>([])
  const [mundoIdAtual, setMundoIdAtual] = useState(campanha.mundoId)
  const [mundoSelecionado, setMundoSelecionado] = useState('')
  const [vinculando, setVinculando] = useState(false)
  const [erroVincular, setErroVincular] = useState<string | null>(null)

  useEffect(() => {
    if (erroFichas) erroFichasRef.current?.focus()
  }, [erroFichas])

  useEffect(() => {
    listarMundos()
      .then(setMundos)
      .catch(() => setMundos([]))
  }, [])

  const mundoAtual = mundos.find((m) => m.id === mundoIdAtual) ?? null

  async function handleVincularMundo() {
    if (!mundoSelecionado) return
    setErroVincular(null)
    setVinculando(true)
    try {
      const atualizada = await vincularMundoACampanha(campanha.id, mundoSelecionado)
      setMundoIdAtual(atualizada.mundoId)
      setMundoSelecionado('')
    } catch {
      setErroVincular('Não foi possível vincular o mundo agora. Tente novamente em instantes.')
    } finally {
      setVinculando(false)
    }
  }

  function carregarFichas() {
    setErroFichas(null)
    setFichas(null)
    listarFichasDaCampanha(campanha.id)
      .then(setFichas)
      .catch(() => setErroFichas('Não foi possível carregar as fichas da campanha.'))
  }

  useEffect(() => {
    carregarFichas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campanha.id])

  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="campanha-heading">{campanha.nome}</h1>
        <Link to="/campanhas" className="campaigns-screen__logout">
          Voltar às campanhas
        </Link>
      </header>

      {campanhaCriada && (
        <p role="status" className="welcome-banner">
          Campanha criada! Seus jogadores já podem encontrá-la na lista de campanhas abertas para entrar.
        </p>
      )}

      {campanha.handoffDisponivel && !resumoHandoff && (
        <p className="campaigns-screen__hint">
          <button type="button" className="campaigns-screen__retry" disabled={carregandoResumoHandoff} onClick={reabrirResumoHandoff}>
            {carregandoResumoHandoff ? 'Carregando resumo…' : 'Ver resumo da transição para mestre humano'}
          </button>
        </p>
      )}
      {erroResumoHandoff && (
        <p role="alert" className="campaigns-screen__error">
          {erroResumoHandoff}
        </p>
      )}
      {resumoHandoff && (
        <HandoffResumoView resumo={resumoHandoff} onFechar={() => setResumoHandoff(null)} fecharLabel="Fechar" />
      )}

      <section className="campaigns-screen__panel" aria-labelledby="mundo-vinculado-heading">
        <h2 id="mundo-vinculado-heading" className="campaigns-screen__section-title">
          Mundo
        </h2>

        {mundoIdAtual ? (
          <p className="campaigns-screen__hint">
            Mundo vinculado: <Link to={`/mundos/${mundoIdAtual}`}>{mundoAtual?.nome ?? mundoIdAtual}</Link>
          </p>
        ) : (
          <p className="campaigns-screen__hint">Nenhum mundo vinculado a esta campanha ainda.</p>
        )}

        {mundoIdAtual && (
          <p className="campaigns-screen__hint">
            <Link to={`/campanhas/${campanha.id}/historia`}>Ver história da campanha</Link>
          </p>
        )}

        {mundos.length > 0 && (
          <div className="campaigns-screen__masthead-actions">
            <select
              aria-label="Escolher mundo"
              value={mundoSelecionado}
              onChange={(e) => setMundoSelecionado(e.target.value)}
            >
              <option value="">Selecione um mundo</option>
              {mundos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="campaigns-screen__join"
              disabled={!mundoSelecionado || vinculando}
              onClick={handleVincularMundo}
            >
              {vinculando ? 'Vinculando…' : mundoIdAtual ? 'Trocar mundo' : 'Vincular mundo'}
            </button>
          </div>
        )}

        {erroVincular && (
          <p role="alert" className="campaigns-screen__error">
            {erroVincular}
          </p>
        )}
      </section>

      <section className="campaigns-screen__panel" aria-labelledby="fichas-heading">
        <h2 id="fichas-heading" className="campaigns-screen__section-title">
          Fichas
        </h2>

        {erroFichas && (
          <p ref={erroFichasRef} role="alert" tabIndex={-1} className="campaigns-screen__error">
            {erroFichas}
            <button type="button" className="campaigns-screen__retry" onClick={carregarFichas}>
              Tentar novamente
            </button>
          </p>
        )}
        {!erroFichas && fichas === null && <p className="campaigns-screen__hint">Carregando fichas…</p>}
        {fichas !== null && fichas.length === 0 && (
          <p className="campaigns-screen__empty">
            Nenhum jogador entrou nesta campanha ainda. Ela já aparece na lista de campanhas abertas para outros
            jogadores encontrarem e entrarem.
          </p>
        )}
        {fichas !== null && fichas.length > 0 && (
          <ul className="campaigns-screen__list">
            {fichas.map((f) => (
              <li key={f.id}>
                <Link to={`/campanhas/${campanha.id}/fichas/${f.id}`} className="campaigns-screen__campaign-link">
                  <span className="campaigns-screen__entry-name">
                    {f.nomePersonagem}
                    {f.nomeJogador ? ` — ${f.nomeJogador}` : ''}
                  </span>
                  <span className="campaigns-screen__entry-meta">
                    {f.classe} · nível {f.nivel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <EventosMesaPanel eventos={eventos} status={status} onReconectar={reconectar} />
      <PedirRolagemForm
        jogadores={(fichas ?? []).map((f) => ({ contaId: f.contaId, nome: f.nomeJogador ?? f.nomePersonagem }))}
        onPedir={(input) => {
          setErroPedido(null)
          return pedirRolagem(input).catch((err: Error) => {
            setErroPedido(err.message)
            throw err
          })
        }}
        disabled={status === 'indisponivel'}
      />
      {erroPedido && <p role="alert">{erroPedido}</p>}
    </main>
  )
}
