import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obterFicha } from '../api/sheets'
import type { Ficha } from '../api/types'
import { GeralReadOnly } from '../sheet/readonly/GeralReadOnly'
import { CombateReadOnly } from '../sheet/readonly/CombateReadOnly'
import { TalentosReadOnly } from '../sheet/readonly/TalentosReadOnly'
import { AtaquesReadOnly } from '../sheet/readonly/AtaquesReadOnly'
import { PericiasReadOnly } from '../sheet/readonly/PericiasReadOnly'
import { MagiasReadOnly } from '../sheet/readonly/MagiasReadOnly'
import { InventarioReadOnly } from '../sheet/readonly/InventarioReadOnly'
import { NotasReadOnly } from '../sheet/readonly/NotasReadOnly'

const ABAS = ['Geral', 'Combate', 'Talentos', 'Ataques', 'Perícias', 'Magias', 'Inventário', 'Notas'] as const
type Aba = (typeof ABAS)[number]

export function CharacterSheetReadOnlyPage() {
  const { id, fichaId } = useParams<{ id: string; fichaId: string }>()
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [aba, setAba] = useState<Aba>('Geral')

  useEffect(() => {
    if (!fichaId) return
    let cancelado = false
    setErro(null)
    setFicha(null)
    obterFicha(fichaId)
      .then((dados) => {
        if (!cancelado) setFicha(dados)
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar esta ficha.')
      })
    return () => {
      cancelado = true
    }
  }, [fichaId])

  if (!id || !fichaId) return null
  if (erro) return <p role="alert">{erro}</p>
  if (!ficha) return <p>Carregando ficha…</p>

  return (
    <main aria-label="Ficha (somente leitura)" className="ficha-sheet">
      <header className="masthead">
        <div className="eyebrow">Ficha de Personagem · Somente leitura</div>
        <Link to={`/campanhas/${id}`} className="ro-back-link">
          Voltar à campanha
        </Link>
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

      {aba === 'Geral' && <GeralReadOnly geral={ficha.geral} />}
      {aba === 'Combate' && <CombateReadOnly combate={ficha.combate} />}
      {aba === 'Talentos' && <TalentosReadOnly talentos={ficha.talentos} />}
      {aba === 'Ataques' && <AtaquesReadOnly ataques={ficha.ataques} />}
      {aba === 'Perícias' && <PericiasReadOnly pericias={ficha.pericias} />}
      {aba === 'Magias' && (
        <MagiasReadOnly magiasConfig={ficha.magiasConfig} magiaNiveis={ficha.magiaNiveis} magias={ficha.magias} />
      )}
      {aba === 'Inventário' && <InventarioReadOnly moedas={ficha.moedas} itens={ficha.itens} />}
      {aba === 'Notas' && <NotasReadOnly notas={ficha.notas} />}
    </main>
  )
}
