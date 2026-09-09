import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { obterCampanha } from '../api/campaigns'
import { obterFicha } from '../api/sheets'
import { listarClassesCompendio, listarPericiasCompendio, listarRacasCompendio, listarTalentosCompendio } from '../api/compendio'
import type { Ficha, FichaGeral } from '../api/types'
import type { CompendioClasse, CompendioPericia, CompendioRaca, CompendioTalento } from '../api/compendioTypes'
import { WIZARD_STEPS, type WizardStepId } from './wizardSteps'
import { WizardSidebar } from './WizardSidebar'
import { RacaClasseStep } from './steps/RacaClasseStep'
import { AtributosStep } from './steps/AtributosStep'
import { PericiasStep } from './steps/PericiasStep'
import { TalentosStep } from './steps/TalentosStep'
import { MagiasStep } from './steps/MagiasStep'
import { EquipamentoStep } from './steps/EquipamentoStep'
import { RevisaoStep } from './steps/RevisaoStep'

function proximoPasso(atual: WizardStepId): WizardStepId {
  const indice = WIZARD_STEPS.findIndex((s) => s.id === atual)
  return WIZARD_STEPS[Math.min(indice + 1, WIZARD_STEPS.length - 1)].id
}

interface CompendioBasico {
  racas: CompendioRaca[]
  classes: CompendioClasse[]
  pericias: CompendioPericia[]
  talentos: CompendioTalento[]
}

export function CharacterWizardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [compendio, setCompendio] = useState<CompendioBasico | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [step, setStep] = useState<WizardStepId>('raca-classe')
  const [concluidos, setConcluidos] = useState<Set<WizardStepId>>(new Set())
  const [racaId, setRacaId] = useState<string | undefined>(undefined)
  const [classeId, setClasseId] = useState<string | undefined>(undefined)
  const [geralAoVivo, setGeralAoVivo] = useState<FichaGeral | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelado = false
    setErro(null)
    setFicha(null)
    setCompendio(null)
    Promise.all([
      obterCampanha(id).then((campanha) => {
        if (!campanha.fichaId) throw new Error('sem ficha')
        return obterFicha(campanha.fichaId)
      }),
      listarRacasCompendio(),
      listarClassesCompendio(),
      listarPericiasCompendio(),
      listarTalentosCompendio(),
    ])
      .then(([dados, racas, classes, pericias, talentos]) => {
        if (cancelado) return
        setFicha(dados)
        setGeralAoVivo(dados.geral)
        setCompendio({ racas, classes, pericias, talentos })
        const racaEncontrada = racas.find((r) => r.nome.toLowerCase() === (dados.geral.raca ?? '').trim().toLowerCase())
        const classeEncontrada = classes.find(
          (c) => c.nome.toLowerCase() === (dados.geral.classe ?? '').trim().toLowerCase(),
        )
        setRacaId(racaEncontrada?.id)
        setClasseId(classeEncontrada?.id)
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar sua ficha ou o compêndio de regras.')
      })
    return () => {
      cancelado = true
    }
  }, [id])

  const atualizarSecaoLocal = useCallback(
    <K extends keyof Ficha>(chave: K) =>
      (valor: Ficha[K]) => {
        setFicha((f) => (f ? { ...f, [chave]: valor } : f))
      },
    [],
  )

  const marcarConcluido = useCallback((passo: WizardStepId, proximo: WizardStepId) => {
    setConcluidos((prev) => {
      const next = new Set(prev)
      next.add(passo)
      return next
    })
    setStep(proximo)
  }, [])

  const raca = compendio?.racas.find((r) => r.id === racaId)
  const classe = compendio?.classes.find((c) => c.id === classeId)
  const magiasNaoSeAplica = Boolean(classeId) && !classe?.conjurador

  useEffect(() => {
    if (!magiasNaoSeAplica) return
    setConcluidos((prev) => (prev.has('magias') ? prev : new Set(prev).add('magias')))
  }, [magiasNaoSeAplica])

  if (erro) return <p role="alert">{erro}</p>
  if (!ficha || !geralAoVivo || !compendio || !id) return <p>Preparando a trilha de criação…</p>

  return (
    <main aria-label="Trilha de criação de personagem" className="ficha-sheet wizard-screen">
      <header className="masthead">
        <div className="eyebrow">Trilha de Criação de Personagem · D&amp;D 3.5</div>
        <Link to="/campanhas" className="ro-back-link">
          Voltar às campanhas
        </Link>
      </header>

      <div className="wizard-layout">
        <WizardSidebar current={step} concluidos={concluidos} onSelect={setStep} magiasNaoSeAplica={magiasNaoSeAplica} />

        <div className="wizard-main panel">
          {step === 'raca-classe' && (
            <RacaClasseStep
              fichaId={ficha.id}
              geral={ficha.geral}
              talentos={ficha.talentos}
              racas={compendio.racas}
              classes={compendio.classes}
              racaId={racaId}
              classeId={classeId}
              onEscolha={(novaRacaId, novaClasseId) => {
                setRacaId(novaRacaId)
                setClasseId(novaClasseId)
              }}
              onChange={setGeralAoVivo}
              onSaved={atualizarSecaoLocal('geral')}
              onItemsChange={atualizarSecaoLocal('talentos')}
              onConcluir={() => marcarConcluido('raca-classe', proximoPasso('raca-classe'))}
            />
          )}
          {step === 'atributos' && (
            <AtributosStep
              fichaId={ficha.id}
              geral={ficha.geral}
              raca={raca}
              onChange={setGeralAoVivo}
              onSaved={atualizarSecaoLocal('geral')}
              onConcluir={() => marcarConcluido('atributos', proximoPasso('atributos'))}
            />
          )}
          {step === 'pericias' && (
            <PericiasStep
              fichaId={ficha.id}
              pericias={ficha.pericias}
              geral={geralAoVivo}
              raca={raca}
              classe={classe}
              catalogo={compendio.pericias}
              onItemsChange={atualizarSecaoLocal('pericias')}
              onConcluir={() => marcarConcluido('pericias', proximoPasso('pericias'))}
            />
          )}
          {step === 'talentos' && (
            <TalentosStep
              fichaId={ficha.id}
              talentos={ficha.talentos}
              geral={geralAoVivo}
              raca={raca}
              classe={classe}
              catalogo={compendio.talentos}
              onItemsChange={atualizarSecaoLocal('talentos')}
              onConcluir={() => marcarConcluido('talentos', proximoPasso('talentos'))}
            />
          )}
          {step === 'magias' &&
            (magiasNaoSeAplica ? (
              <section aria-label="Magias" className="wizard-step">
                <h2>Magias</h2>
                <p className="hint">
                  {classe ? `${classe.nome} não conjura magias — esta etapa não se aplica.` : 'Escolha uma classe primeiro.'}
                </p>
                <div className="wizard-step-actions">
                  <button type="button" className="add-btn" onClick={() => setStep(proximoPasso('magias'))}>
                    Continuar
                  </button>
                </div>
              </section>
            ) : (
              <MagiasStep
                fichaId={ficha.id}
                magiasConfig={ficha.magiasConfig}
                magiaNiveis={ficha.magiaNiveis}
                magias={ficha.magias}
                classe={classe}
                onMagiasConfigSaved={atualizarSecaoLocal('magiasConfig')}
                onMagiaNiveisSaved={atualizarSecaoLocal('magiaNiveis')}
                onMagiasChange={atualizarSecaoLocal('magias')}
                onConcluir={() => marcarConcluido('magias', proximoPasso('magias'))}
              />
            ))}
          {step === 'equipamento' && (
            <EquipamentoStep
              fichaId={ficha.id}
              moedas={ficha.moedas}
              itens={ficha.itens}
              classe={classe}
              onMoedasSaved={atualizarSecaoLocal('moedas')}
              onItensChange={atualizarSecaoLocal('itens')}
              onConcluir={() => marcarConcluido('equipamento', proximoPasso('equipamento'))}
            />
          )}
          {step === 'revisao' && (
            <RevisaoStep ficha={ficha} classe={classe} raca={raca} onConcluir={() => navigate(`/campanhas/${id}/ficha`)} />
          )}
        </div>
      </div>
    </main>
  )
}
