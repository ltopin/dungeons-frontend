import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { obterCampanha } from '../api/campaigns'
import { obterFicha } from '../api/sheets'
import type { Ficha } from '../api/types'
import { GeralTab } from '../sheet/tabs/GeralTab'
import { CombateTab } from '../sheet/tabs/CombateTab'
import { TalentosTab } from '../sheet/tabs/TalentosTab'
import { AtaquesTab } from '../sheet/tabs/AtaquesTab'
import { PericiasTab } from '../sheet/tabs/PericiasTab'
import { MagiasTab } from '../sheet/tabs/MagiasTab'
import { InventarioTab } from '../sheet/tabs/InventarioTab'
import { NotasTab } from '../sheet/tabs/NotasTab'

const ABAS = ['Geral', 'Combate', 'Talentos', 'Ataques', 'Perícias', 'Magias', 'Inventário', 'Notas'] as const
type Aba = (typeof ABAS)[number]

export function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [aba, setAba] = useState<Aba>('Geral')

  useEffect(() => {
    if (!id) return
    let cancelado = false
    setErro(null)
    setFicha(null)
    obterCampanha(id)
      .then((campanha) => {
        if (!campanha.fichaId) throw new Error('sem ficha')
        return obterFicha(campanha.fichaId)
      })
      .then((dados) => {
        if (!cancelado) setFicha(dados)
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar sua ficha.')
      })
    return () => {
      cancelado = true
    }
  }, [id])

  if (erro) return <p role="alert">{erro}</p>
  if (!ficha) return <p>Carregando ficha…</p>

  return (
    <main aria-label="Editor de ficha" className="ficha-sheet">
      <header className="masthead">
        <div className="eyebrow">Ficha de Personagem · D&amp;D 3.5</div>
      </header>

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

      {aba === 'Geral' && <GeralTab fichaId={ficha.id} geral={ficha.geral} />}
      {aba === 'Combate' && <CombateTab fichaId={ficha.id} combate={ficha.combate} />}
      {aba === 'Talentos' && <TalentosTab fichaId={ficha.id} talentos={ficha.talentos} />}
      {aba === 'Ataques' && <AtaquesTab fichaId={ficha.id} ataques={ficha.ataques} />}
      {aba === 'Perícias' && <PericiasTab fichaId={ficha.id} pericias={ficha.pericias} />}
      {aba === 'Magias' && (
        <MagiasTab
          fichaId={ficha.id}
          magiasConfig={ficha.magiasConfig}
          magiaNiveis={ficha.magiaNiveis}
          magias={ficha.magias}
        />
      )}
      {aba === 'Inventário' && <InventarioTab fichaId={ficha.id} moedas={ficha.moedas} itens={ficha.itens} />}
      {aba === 'Notas' && <NotasTab fichaId={ficha.id} notas={ficha.notas} />}
    </main>
  )
}
