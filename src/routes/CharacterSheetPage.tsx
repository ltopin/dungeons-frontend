import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { obterCampanha } from '../api/campaigns'
import { obterFicha } from '../api/sheets'
import { listarElementosPublicadosDaCampanha } from '../api/worlds'
import type { ElementoHistoria, Ficha, FichaGeral } from '../api/types'
import { fichaAindaNaoIniciada } from '../wizard/wizardSteps'
import { CampaignLoreWelcome } from './CampaignLoreWelcome'
import { GeralTab } from '../sheet/tabs/GeralTab'
import { CombateTab } from '../sheet/tabs/CombateTab'
import { TalentosTab } from '../sheet/tabs/TalentosTab'
import { AtaquesTab } from '../sheet/tabs/AtaquesTab'
import { PericiasTab } from '../sheet/tabs/PericiasTab'
import { MagiasTab } from '../sheet/tabs/MagiasTab'
import { InventarioTab } from '../sheet/tabs/InventarioTab'
import { NotasTab } from '../sheet/tabs/NotasTab'
import { FamiliarTab } from '../sheet/tabs/FamiliarTab'
import { subscribeSaveAlerts } from '../sheet/saveAlerts'
import { getContaAtual } from '../auth/session'
import { useCampaignEvents } from '../realtime/useCampaignEvents'
import { EventosMesaPanel } from '../realtime/EventosMesaPanel'
import { RolagemLivreForm } from '../realtime/RolagemLivreForm'
import { RodadaPanel } from '../realtime/RodadaPanel'
import { montarCatalogoRolagem, type CatalogoRolagemEntry } from '../realtime/catalogoRolagem'
import type { TipoItemFicha } from '../realtime/types'
import { AssumirMestreConfirm } from './AssumirMestreConfirm'
import { HandoffResumoView } from './HandoffResumoView'

const ABAS = [
  'Geral',
  'Combate',
  'Talentos',
  'Ataques',
  'Perícias',
  'Magias',
  'Inventário',
  'Familiar',
  'Notas',
] as const
type Aba = (typeof ABAS)[number]

// Mapeia as chaves de seção usadas pelos hooks de autosave (useSectionAutosave/
// useListSection/useMagiaNiveis) para a aba onde o usuário pode revisar e
// tentar salvar de novo — ver saveAlerts.ts: uma falha reportada por uma aba já
// desmontada não tem mais estado local próprio para exibir o erro.
const SECAO_PARA_ABA: Record<string, Aba> = {
  geral: 'Geral',
  combate: 'Combate',
  talentos: 'Talentos',
  ataques: 'Ataques',
  pericias: 'Perícias',
  'magias-config': 'Magias',
  magias: 'Magias',
  'magia-niveis': 'Magias',
  moedas: 'Inventário',
  itens: 'Inventário',
  familiar: 'Familiar',
  notas: 'Notas',
}

function abasComFalha(failedKeys: string[]): Aba[] {
  const abas = new Set<Aba>()
  for (const key of failedKeys) {
    const secao = key.split(':')[0]
    const aba = SECAO_PARA_ABA[secao]
    if (aba) abas.add(aba)
  }
  return Array.from(abas)
}

export function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [aba, setAba] = useState<Aba>('Geral')
  // Espelha o valor mais recente de Geral (atualizado a cada digitação, não só
  // após o autosave confirmar) para que Combate/Perícias/Inventário/Magias
  // recalculem seus campos derivados imediatamente — ver design.md, decisão 2.
  const [geralAoVivo, setGeralAoVivo] = useState<FichaGeral | null>(null)
  const [falhasDeSave, setFalhasDeSave] = useState<string[]>([])
  const [erroRolagem, setErroRolagem] = useState<string | null>(null)
  const { eventos, status, emitirRolagem, reconectar, rodada, enviarResumoRodada, fecharRodada, narrarChegada } =
    useCampaignEvents(id)
  // Narração de chegada individual por personagem (`narracao-chegada`):
  // gerada uma única vez por personagem, disparada quando o histórico de
  // eventos já carregou e ainda não há uma `narracao_chegada` para esta
  // ficha. O ref evita disparo duplicado em re-renders da mesma montagem.
  const [erroChegada, setErroChegada] = useState<string | null>(null)
  const [chegadaGerando, setChegadaGerando] = useState(false)
  const chegadaDisparadaParaFichaRef = useRef<string | null>(null)
  // Decidido uma única vez a partir do GET inicial — não recomputado a cada
  // sync de autosave, para não arrancar o usuário de volta para a trilha só
  // porque um campo de Geral ficou temporariamente vazio durante uma edição.
  const [redirecionarParaTrilha, setRedirecionarParaTrilha] = useState(false)
  // Elementos de história publicados a exibir antes do assistente — só
  // populado quando a ficha está em branco e a campanha tem mundo vinculado
  // com pelo menos um elemento publicado (ver design.md, decisão 1).
  const [loreBoasVindas, setLoreBoasVindas] = useState<ElementoHistoria[] | null>(null)
  const [mundoId, setMundoId] = useState<string | undefined>(undefined)
  // Campos de `ai-master-handoff`/`ai-session-narration`: ausentes (undefined/false)
  // para campanhas com mestre humano, sem mudança de comportamento.
  const [mestre, setMestre] = useState<'humano' | 'ia' | undefined>(undefined)
  const [souCriador, setSouCriador] = useState(false)
  const [resumoHandoff, setResumoHandoff] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => subscribeSaveAlerts(setFalhasDeSave), [])

  // Mantém `ficha` sincronizada com o retorno confirmado de cada save de
  // seção, para que uma aba desmontada e remontada (troca de aba) sempre
  // reidrate a partir do dado mais recente em vez do snapshot do GET inicial
  // — ver fix-character-sheet-tab-state-sync/design.md, decisão 1.
  const atualizarSecao = useCallback(
    <K extends keyof Ficha>(chave: K) =>
      (valor: Ficha[K]) => {
        setFicha((f) => (f ? { ...f, [chave]: valor } : f))
      },
    [],
  )

  useEffect(() => {
    if (!id) return
    let cancelado = false
    setErro(null)
    setFicha(null)
    setRedirecionarParaTrilha(false)
    setLoreBoasVindas(null)
    let mundoIdCampanha: string | undefined
    obterCampanha(id)
      .then((campanha) => {
        if (!cancelado) {
          setMundoId(campanha.mundoId)
          setMestre(campanha.mestre)
          setSouCriador(campanha.souCriador ?? false)
        }
        mundoIdCampanha = campanha.mundoId
        if (!campanha.fichaId) throw new Error('sem ficha')
        return obterFicha(campanha.fichaId)
      })
      .then((dados) => {
        if (cancelado) return
        setFicha(dados)
        setGeralAoVivo(dados.geral)
        if (!fichaAindaNaoIniciada(dados)) return
        if (!mundoIdCampanha) {
          setRedirecionarParaTrilha(true)
          return
        }
        // Falha nessa busca não deve bloquear a entrada no assistente — trata
        // como "sem história disponível" e segue direto (design.md, decisão 3).
        return listarElementosPublicadosDaCampanha(id)
          .then((elementos) => {
            if (cancelado) return
            if (elementos.length > 0) {
              setLoreBoasVindas(elementos)
            } else {
              setRedirecionarParaTrilha(true)
            }
          })
          .catch(() => {
            if (!cancelado) setRedirecionarParaTrilha(true)
          })
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar sua ficha.')
      })
    return () => {
      cancelado = true
    }
  }, [id])

  const chegadaNarrada = ficha
    ? eventos.some((e) => e.tipo === 'narracao_chegada' && e.payload.personagemId === ficha.id)
    : false

  function dispararNarracaoChegada(fichaId: string): void {
    chegadaDisparadaParaFichaRef.current = fichaId
    setErroChegada(null)
    setChegadaGerando(true)
    narrarChegada().then(
      () => setChegadaGerando(false),
      () => {
        setChegadaGerando(false)
        setErroChegada('Não foi possível narrar a chegada do seu personagem agora.')
      },
    )
  }

  useEffect(() => {
    if (!ficha || mestre !== 'ia' || status !== 'conectado' || chegadaNarrada) return
    if (chegadaDisparadaParaFichaRef.current === ficha.id) return
    dispararNarracaoChegada(ficha.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- guardado pelo ref por fichaId; não deve redisparar por causa de identidade de narrarChegada
  }, [ficha, mestre, status, chegadaNarrada])

  function rolarItem(tipoItem: TipoItemFicha, itemId: string, pedidoEventoId?: string): void {
    setErroRolagem(null)
    emitirRolagem({ tipoItem, itemId }, pedidoEventoId).catch(() =>
      setErroRolagem('Não foi possível enviar a rolagem.'),
    )
  }

  /** `pedidoEventoId` presente = esta rolagem responde a um `pedido_rolagem` específico do card — ver `pedido-rolagem-reacao-imediata`. */
  function rolarEntradaCatalogo(entrada: CatalogoRolagemEntry, pedidoEventoId: string): void {
    if (entrada.tipo === 'item') {
      rolarItem(entrada.tipoItem, entrada.itemId, pedidoEventoId)
      return
    }
    setErroRolagem(null)
    emitirRolagem({ notacao: entrada.notacao }, pedidoEventoId).catch(() =>
      setErroRolagem('Não foi possível enviar a rolagem.'),
    )
  }

  if (erro) return <p role="alert">{erro}</p>
  if (!ficha || !geralAoVivo) return <p>Carregando ficha…</p>
  if (loreBoasVindas) {
    return (
      <CampaignLoreWelcome
        elementos={loreBoasVindas}
        onIniciar={() => navigate(`/campanhas/${id}/ficha/criar`)}
      />
    )
  }
  if (redirecionarParaTrilha) return <Navigate to={`/campanhas/${id}/ficha/criar`} replace />

  if (resumoHandoff) {
    return (
      <main className="campaigns-screen">
        <header className="campaigns-screen__masthead">
          <h1>{ficha.geral.nomePersonagem}</h1>
        </header>
        <HandoffResumoView resumo={resumoHandoff} onFechar={() => navigate(`/campanhas/${id}`)} />
      </main>
    )
  }

  const catalogoRolagem = montarCatalogoRolagem(ficha)
  const contaAtualId = getContaAtual()?.id
  const bloqueadoPorTurno =
    rodada?.modo === 'combate' && rodada.turnoAtualContaId !== null && rodada.turnoAtualContaId !== contaAtualId
  const rolarDesabilitado = bloqueadoPorTurno
    ? `Aguarde o turno de ${rodada?.ordemIniciativa?.find((i) => i.contaId === rodada.turnoAtualContaId)?.nome ?? 'outro combatente'}.`
    : undefined

  return (
    <main aria-label="Editor de ficha" className="ficha-sheet">
      <header className="masthead">
        <div className="eyebrow">Ficha de Personagem · D&amp;D 3.5</div>
        {mundoId && (
          <Link to={`/campanhas/${id}/historia`} className="ro-back-link">
            História da campanha
          </Link>
        )}
        <Link to="/campanhas" className="ro-back-link">
          Voltar às campanhas
        </Link>
      </header>

      {mestre === 'ia' && souCriador && id && (
        <div className="campaigns-screen__hint">
          <AssumirMestreConfirm campanhaId={id} onHandoffConcluido={setResumoHandoff} />
        </div>
      )}

      {falhasDeSave.length > 0 && (
        <div className="autosave-alert" role="alert">
          <span>
            Não foi possível salvar uma alteração em{' '}
            {abasComFalha(falhasDeSave).map((abaComFalha, i, arr) => (
              <span key={abaComFalha}>
                <button type="button" className="autosave-alert-link" onClick={() => setAba(abaComFalha)}>
                  {abaComFalha}
                </button>
                {i < arr.length - 1 ? ', ' : ''}
              </span>
            ))}
            . Volte à aba para tentar novamente.
          </span>
        </div>
      )}

      <nav aria-label="Abas da ficha" className="tabbar">
        {ABAS.map((nomeAba) => (
          <button
            key={nomeAba}
            type="button"
            className="tab"
            aria-current={aba === nomeAba}
            onClick={() => setAba(nomeAba)}
          >
            {nomeAba}
          </button>
        ))}
      </nav>

      {aba === 'Geral' && (
        <GeralTab
          fichaId={ficha.id}
          geral={ficha.geral}
          onChange={setGeralAoVivo}
          onSaved={atualizarSecao('geral')}
        />
      )}
      {aba === 'Combate' && (
        <CombateTab
          fichaId={ficha.id}
          combate={ficha.combate}
          geral={geralAoVivo}
          onSaved={atualizarSecao('combate')}
        />
      )}
      {aba === 'Talentos' && (
        <TalentosTab
          fichaId={ficha.id}
          talentos={ficha.talentos}
          onItemsChange={atualizarSecao('talentos')}
          onRolar={(itemId) => rolarItem('talento', itemId)}
          rolarDesabilitado={rolarDesabilitado}
        />
      )}
      {aba === 'Ataques' && (
        <AtaquesTab
          fichaId={ficha.id}
          ataques={ficha.ataques}
          onItemsChange={atualizarSecao('ataques')}
          onRolar={(itemId) => rolarItem('ataque', itemId)}
          rolarDesabilitado={rolarDesabilitado}
        />
      )}
      {aba === 'Perícias' && (
        <PericiasTab
          fichaId={ficha.id}
          pericias={ficha.pericias}
          geral={geralAoVivo}
          onItemsChange={atualizarSecao('pericias')}
          onRolar={(itemId) => rolarItem('pericia', itemId)}
          rolarDesabilitado={rolarDesabilitado}
        />
      )}
      {aba === 'Magias' && (
        <MagiasTab
          fichaId={ficha.id}
          magiasConfig={ficha.magiasConfig}
          magiaNiveis={ficha.magiaNiveis}
          magias={ficha.magias}
          geral={geralAoVivo}
          onMagiasConfigSaved={atualizarSecao('magiasConfig')}
          onMagiaNiveisSaved={atualizarSecao('magiaNiveis')}
          onMagiasChange={atualizarSecao('magias')}
        />
      )}
      {aba === 'Inventário' && (
        <InventarioTab
          fichaId={ficha.id}
          moedas={ficha.moedas}
          itens={ficha.itens}
          geral={geralAoVivo}
          onMoedasSaved={atualizarSecao('moedas')}
          onItensChange={atualizarSecao('itens')}
        />
      )}
      {aba === 'Familiar' && (
        <FamiliarTab fichaId={ficha.id} familiar={ficha.familiar} onSaved={atualizarSecao('familiar')} />
      )}
      {aba === 'Notas' && <NotasTab fichaId={ficha.id} notas={ficha.notas} onSaved={atualizarSecao('notas')} />}

      {rodada && !chegadaNarrada && (
        <ChegadaPersonagemPanel
          gerando={chegadaGerando}
          erro={erroChegada}
          onTentarNovamente={() => ficha && dispararNarracaoChegada(ficha.id)}
        />
      )}
      {rodada && chegadaNarrada && (
        <RodadaPanel
          rodada={rodada}
          onEnviarResumo={enviarResumoRodada}
          onFecharRodada={fecharRodada}
          disabled={status === 'indisponivel'}
        />
      )}
      <EventosMesaPanel
        eventos={eventos}
        status={status}
        onReconectar={reconectar}
        catalogoRolagem={catalogoRolagem}
        onRolar={rolarEntradaCatalogo}
      />
      <RolagemLivreForm
        onRolar={(notacao) => {
          setErroRolagem(null)
          return emitirRolagem({ notacao })
        }}
        onErroEnvio={setErroRolagem}
        disabled={status === 'indisponivel'}
      />
      {erroRolagem && (
        <p role="alert" className="save-status save-status--erro">
          {erroRolagem}
        </p>
      )}
    </main>
  )
}

/**
 * Substitui `RodadaPanel`/`ResumoRodadaPanel` enquanto a narração de chegada
 * do personagem atual ainda não chegou pelo canal de eventos — ver
 * `narracao-chegada`/design.md, decisão "Estado de carregamento substitui o
 * painel de resumo". Evita que o jogador escreva uma ação de rodada antes de
 * saber a cena.
 */
function ChegadaPersonagemPanel({
  gerando,
  erro,
  onTentarNovamente,
}: {
  gerando: boolean
  erro: string | null
  onTentarNovamente: () => void
}) {
  return (
    <section aria-label="Chegada" className="panel rodada-panel">
      {erro ? (
        <>
          <p role="alert" className="save-status save-status--erro">
            {erro}
          </p>
          <button type="button" className="roll-btn" onClick={onTentarNovamente} disabled={gerando}>
            {gerando ? 'Tentando novamente…' : 'Tentar novamente'}
          </button>
        </>
      ) : (
        <p role="status">A cena está sendo narrada…</p>
      )}
    </section>
  )
}
