import { useMemo, useState } from 'react'
import type { FichaGeral, FichaTalento } from '../../api/types'
import type { CompendioClasse, CompendioRaca, CompendioTalento } from '../../api/compendioTypes'
import { useListSection } from '../../sheet/useListSection'
import { ABILIDADES } from '../../sheet/abilityMod'
import { contextoDoCompendio, avaliarTalento, talentosDisponiveisNivel1 } from '../wizardValidation'

export function TalentosStep({
  fichaId,
  talentos,
  geral,
  raca,
  classe,
  catalogo,
  onItemsChange,
  onConcluir,
}: {
  fichaId: string
  talentos: FichaTalento[]
  geral: FichaGeral
  raca: CompendioRaca | undefined
  classe: CompendioClasse | undefined
  catalogo: CompendioTalento[]
  onItemsChange?: (talentos: FichaTalento[]) => void
  onConcluir: () => void
}) {
  const { items, addItem, removeItem, createError } = useListSection<FichaTalento>(
    fichaId,
    'talentos',
    talentos,
    undefined,
    onItemsChange,
  )

  const nomesTalentosEscolhidos = useMemo(
    () => new Set(items.filter((t) => catalogo.some((c) => c.nome === t.nome)).map((t) => t.nome.toLowerCase())),
    [items, catalogo],
  )
  const nomesTalentosCatalogo = useMemo(() => new Set(catalogo.map((c) => c.nome.toLowerCase())), [catalogo])

  const atributos = Object.fromEntries(ABILIDADES.map((a) => [a.key, geral[a.key] as number])) as Record<
    (typeof ABILIDADES)[number]['key'],
    number
  >

  const ctx = contextoDoCompendio({
    atributos,
    classe,
    nivelPersonagem: geral.nivel || 1,
    nomesTalentosEscolhidos,
  })

  const limite = talentosDisponiveisNivel1(classe, raca)
  const restantes = limite - nomesTalentosEscolhidos.size

  const [confirmando, setConfirmando] = useState(false)

  function confirmar() {
    setConfirmando(true)
    onConcluir()
    setConfirmando(false)
  }

  return (
    <section aria-label="Talentos" className="wizard-step">
      <div className="section-header">
        <h2>Talentos</h2>
      </div>
      {createError && <p role="alert">{createError}</p>}
      {!classe && <p className="hint">Escolha uma classe na primeira etapa para saber quantos talentos você tem.</p>}
      <p className="wizard-points-remaining">
        {Math.max(0, restantes)} de {limite} talento(s) restantes
      </p>

      <ul className="wizard-feat-list">
        {catalogo.map((talento) => {
          const jaEscolhido = nomesTalentosEscolhidos.has(talento.nome.toLowerCase())
          const avaliacao = avaliarTalento(talento, ctx, nomesTalentosCatalogo)
          const bloqueado = avaliacao.resultado === 'nao_atende'
          const naoVerificavel = avaliacao.resultado === 'nao_verificavel'
          const semVaga = restantes <= 0 && !jaEscolhido
          return (
            <li key={talento.id} className="wizard-feat-row" data-bloqueado={bloqueado || undefined}>
              <div>
                <span className="wizard-feat-nome">{talento.nome}</span>
                <p className="hint">{talento.beneficio}</p>
                {talento.pre_requisitos && (
                  <p className={bloqueado ? 'wizard-feat-bloqueio' : 'hint'} role={bloqueado ? 'alert' : undefined}>
                    Pré-requisito: {talento.pre_requisitos}
                    {naoVerificavel && ' (não verificado automaticamente)'}
                  </p>
                )}
              </div>
              {jaEscolhido ? (
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => {
                    const item = items.find((t) => t.nome === talento.nome)
                    if (item) removeItem(item.id)
                  }}
                >
                  Remover
                </button>
              ) : (
                <button
                  type="button"
                  className="add-btn"
                  disabled={bloqueado || semVaga}
                  title={bloqueado ? `Pré-requisito não atendido: ${avaliacao.motivo}` : semVaga ? 'Sem vagas de talento restantes' : undefined}
                  onClick={() => addItem({ nome: talento.nome, descricao: talento.beneficio, categoria: 'talento' })}
                >
                  Escolher
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <div className="wizard-step-actions">
        <button
          type="button"
          className="add-btn"
          disabled={nomesTalentosEscolhidos.size === 0 || confirmando}
          onClick={confirmar}
        >
          {confirmando ? 'Salvando…' : 'Confirmar talentos'}
        </button>
      </div>
    </section>
  )
}
