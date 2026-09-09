import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { obterCampanha } from '../api/campaigns'
import { obterFicha } from '../api/sheets'
import type { Ficha, FichaGeral } from '../api/types'
import { fichaAindaNaoIniciada } from '../wizard/wizardSteps'
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
import { useCampaignEvents } from '../realtime/useCampaignEvents'
import { EventosMesaPanel } from '../realtime/EventosMesaPanel'
import { RolagemLivreForm } from '../realtime/RolagemLivreForm'
import type { TipoItemFicha } from '../realtime/types'

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
  const { eventos, status, emitirRolagem, reconectar } = useCampaignEvents(id)
  // Decidido uma única vez a partir do GET inicial — não recomputado a cada
  // sync de autosave, para não arrancar o usuário de volta para a trilha só
  // porque um campo de Geral ficou temporariamente vazio durante uma edição.
  const [redirecionarParaTrilha, setRedirecionarParaTrilha] = useState(false)
  const [mundoId, setMundoId] = useState<string | undefined>(undefined)

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
    obterCampanha(id)
      .then((campanha) => {
        if (!cancelado) setMundoId(campanha.mundoId)
        if (!campanha.fichaId) throw new Error('sem ficha')
        return obterFicha(campanha.fichaId)
      })
      .then((dados) => {
        if (!cancelado) {
          setFicha(dados)
          setGeralAoVivo(dados.geral)
          setRedirecionarParaTrilha(fichaAindaNaoIniciada(dados))
        }
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar sua ficha.')
      })
    return () => {
      cancelado = true
    }
  }, [id])

  function rolarItem(tipoItem: TipoItemFicha, itemId: string): void {
    setErroRolagem(null)
    emitirRolagem({ tipoItem, itemId }).catch(() => setErroRolagem('Não foi possível enviar a rolagem.'))
  }

  if (erro) return <p role="alert">{erro}</p>
  if (!ficha || !geralAoVivo) return <p>Carregando ficha…</p>
  if (redirecionarParaTrilha) return <Navigate to={`/campanhas/${id}/ficha/criar`} replace />

  return (
    <main aria-label="Editor de ficha" className="ficha-sheet">
      <header className="masthead">
        <div className="eyebrow">Ficha de Personagem · D&amp;D 3.5</div>
        {mundoId && (
          <Link to={`/campanhas/${id}/historia`} className="ro-back-link">
            História da campanha
          </Link>
        )}
        <Link to={`/campanhas/${id}`} className="ro-back-link">
          Voltar à campanha
        </Link>
      </header>

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
        />
      )}
      {aba === 'Ataques' && (
        <AtaquesTab
          fichaId={ficha.id}
          ataques={ficha.ataques}
          onItemsChange={atualizarSecao('ataques')}
          onRolar={(itemId) => rolarItem('ataque', itemId)}
        />
      )}
      {aba === 'Perícias' && (
        <PericiasTab
          fichaId={ficha.id}
          pericias={ficha.pericias}
          geral={geralAoVivo}
          onItemsChange={atualizarSecao('pericias')}
          onRolar={(itemId) => rolarItem('pericia', itemId)}
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

      <EventosMesaPanel eventos={eventos} status={status} onReconectar={reconectar} />
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
