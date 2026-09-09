import { useEffect, useMemo, useState } from 'react'
import type { FichaMagia, FichaMagiaNivel, FichaMagiasConfig } from '../../api/types'
import type { CompendioClasse, CompendioMagia } from '../../api/compendioTypes'
import { listarMagiasCompendio } from '../../api/compendio'
import { useSectionAutosave } from '../../sheet/useSectionAutosave'
import { useListSection } from '../../sheet/useListSection'
import { useMagiaNiveis } from '../../sheet/useMagiaNiveis'

const LIMITE_POR_NIVEL: Record<0 | 1, number> = { 0: 3, 1: 2 }

export function MagiasStep({
  fichaId,
  magiasConfig,
  magiaNiveis,
  magias,
  classe,
  onMagiasConfigSaved,
  onMagiaNiveisSaved,
  onMagiasChange,
  onConcluir,
}: {
  fichaId: string
  magiasConfig: FichaMagiasConfig
  magiaNiveis: FichaMagiaNivel[]
  magias: FichaMagia[]
  classe: CompendioClasse | undefined
  onMagiasConfigSaved?: (magiasConfig: FichaMagiasConfig) => void
  onMagiaNiveisSaved?: (magiaNiveis: FichaMagiaNivel[]) => void
  onMagiasChange?: (magias: FichaMagia[]) => void
  onConcluir: () => void
}) {
  const config = useSectionAutosave<FichaMagiasConfig>(fichaId, 'magias-config', magiasConfig, undefined, onMagiasConfigSaved)
  const niveis = useMagiaNiveis(fichaId, magiaNiveis, onMagiaNiveisSaved)
  const lista = useListSection<FichaMagia>(fichaId, 'magias', magias, undefined, onMagiasChange)

  const [catalogo, setCatalogo] = useState<CompendioMagia[] | null>(null)
  const [erroCatalogo, setErroCatalogo] = useState<string | null>(null)

  useEffect(() => {
    if (!classe) return
    let cancelado = false
    setCatalogo(null)
    setErroCatalogo(null)
    Promise.all([
      listarMagiasCompendio({ classe: classe.nome, nivel: 0 }),
      listarMagiasCompendio({ classe: classe.nome, nivel: 1 }),
    ])
      .then(([nivel0, nivel1]) => {
        if (!cancelado) setCatalogo([...nivel0, ...nivel1])
      })
      .catch(() => {
        if (!cancelado) setErroCatalogo('Não foi possível carregar as magias do compêndio.')
      })
    return () => {
      cancelado = true
    }
  }, [classe])

  const magiasPorDiaNivel1 = classe?.magias_por_dia.find((m) => m.nivel_personagem === 1)

  useEffect(() => {
    if (!classe?.conjurador) return
    if (!config.value.atributoConjuracao && classe.atributo_conjuracao) {
      config.updateField('atributoConjuracao', classe.atributo_conjuracao.toUpperCase())
    }
    if (!config.value.nivelConjurador) {
      config.updateField('nivelConjurador', 1)
    }
    if (magiasPorDiaNivel1) {
      const nivel0 = niveis.items.find((n) => n.nivel === 0)
      const nivel1 = niveis.items.find((n) => n.nivel === 1)
      if (nivel0 && nivel0.espacosPorDia == null) niveis.updateEspacosPorDia(0, magiasPorDiaNivel1.espacos[0] ?? null)
      if (nivel1 && nivel1.espacosPorDia == null) niveis.updateEspacosPorDia(1, magiasPorDiaNivel1.espacos[1] ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classe])

  function escolhidasPorNivel(nivel: 0 | 1) {
    const nomesCatalogo = new Set((catalogo ?? []).filter((m) => nivelDaMagia(m, classe) === nivel).map((m) => m.nome))
    return lista.items.filter((m) => m.nivel === nivel && nomesCatalogo.has(m.nome))
  }

  function nivelDaMagia(magia: CompendioMagia, classeAtual: CompendioClasse | undefined): 0 | 1 {
    const entrada = magia.nivel_por_classe.find((n) => n.classe === classeAtual?.nome)
    return (entrada?.nivel as 0 | 1) ?? 0
  }

  function alternarMagia(magia: CompendioMagia) {
    const nivel = nivelDaMagia(magia, classe)
    const existente = lista.items.find((m) => m.nome === magia.nome)
    if (existente) {
      lista.removeItem(existente.id)
      return
    }
    if (escolhidasPorNivel(nivel).length >= LIMITE_POR_NIVEL[nivel]) return
    lista.addItem({
      nivel,
      nome: magia.nome,
      preparada: false,
      notas: '',
      escola: magia.escola,
      tempoFormulacao: magia.tempo_conjuracao,
      componentes: magia.componentes,
      alcance: magia.alcance,
      alvoEfeito: magia.alvo_efeito,
      duracao: magia.duracao,
      testeResistencia: magia.teste_resistencia ?? '',
      resistenciaMagia: magia.resistencia_magia ?? '',
      descricao: magia.descricao,
    })
  }

  const [confirmando, setConfirmando] = useState(false)

  async function confirmar() {
    setConfirmando(true)
    try {
      await config.flush()
      onConcluir()
    } catch {
      // erro já sinalizado pelo SaveStatusBadge; permanece na etapa
    } finally {
      setConfirmando(false)
    }
  }

  const catalogoPorNivel = useMemo(() => {
    const mapa: Record<0 | 1, CompendioMagia[]> = { 0: [], 1: [] }
    for (const magia of catalogo ?? []) {
      const nivel = nivelDaMagia(magia, classe)
      mapa[nivel].push(magia)
    }
    return mapa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogo, classe])

  if (!classe) {
    return (
      <section aria-label="Magias" className="wizard-step">
        <h2>Magias</h2>
        <p className="hint">Escolha uma classe na primeira etapa antes de selecionar magias.</p>
      </section>
    )
  }

  return (
    <section aria-label="Magias" className="wizard-step">
      <div className="section-header">
        <h2>Magias iniciais</h2>
      </div>
      {lista.createError && <p role="alert">{lista.createError}</p>}
      {erroCatalogo && <p role="alert">{erroCatalogo}</p>}
      {!catalogo && !erroCatalogo && <p className="hint">Carregando magias do compêndio…</p>}
      {catalogo && (
        <p className="hint">
          Escolha até {LIMITE_POR_NIVEL[0]} truques (nível 0) e {LIMITE_POR_NIVEL[1]} magias de 1º nível.
        </p>
      )}

      {catalogo &&
        ([0, 1] as const).map((nivel) => (
          <div key={nivel} className="wizard-spell-group">
            <h3>{nivel === 0 ? 'Truques (nível 0)' : 'Nível 1'}</h3>
            <p className="hint">
              {escolhidasPorNivel(nivel).length} de {LIMITE_POR_NIVEL[nivel]} escolhidas
            </p>
            <ul className="wizard-spell-list">
              {catalogoPorNivel[nivel].map((magia) => {
                const escolhida = lista.items.some((m) => m.nome === magia.nome)
                const semVaga = !escolhida && escolhidasPorNivel(nivel).length >= LIMITE_POR_NIVEL[nivel]
                return (
                  <li key={magia.id} className="wizard-spell-row">
                    <div>
                      <span className="wizard-feat-nome">{magia.nome}</span>
                      <p className="hint">
                        {magia.escola} — {magia.descricao}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={escolhida ? 'icon-btn danger' : 'add-btn'}
                      disabled={semVaga}
                      onClick={() => alternarMagia(magia)}
                    >
                      {escolhida ? 'Remover' : 'Escolher'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

      <div className="wizard-step-actions">
        <button type="button" className="add-btn" disabled={confirmando} onClick={confirmar}>
          {confirmando ? 'Salvando…' : 'Confirmar magias'}
        </button>
      </div>
    </section>
  )
}
