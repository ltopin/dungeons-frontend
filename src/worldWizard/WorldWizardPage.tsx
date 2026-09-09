import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { iniciarGeracaoMundo } from '../api/aiMaster'
import { ApiError } from '../api/client'
import { WizardSidebar } from '../wizard/WizardSidebar'
import { WORLD_WIZARD_STEPS, proximoPassoMundo, type WorldWizardStepId } from './worldWizardSteps'
import { GeneroTomStep } from './steps/GeneroTomStep'
import { NivelPoderStep } from './steps/NivelPoderStep'
import { RestricoesStep } from './steps/RestricoesStep'
import { TamanhoGrupoStep } from './steps/TamanhoGrupoStep'
import { ExtrasStep } from './steps/ExtrasStep'

interface WorldWizardState {
  generoTom: string
  nivelPoder: string
  semRestricoes: boolean
  restricoesConteudo: string
  tamanhoGrupo: number | ''
  inspiracoes: string
  idioma: string
  nomeMundo: string
}

const ESTADO_INICIAL: WorldWizardState = {
  generoTom: '',
  nivelPoder: '',
  semRestricoes: false,
  restricoesConteudo: '',
  tamanhoGrupo: '',
  inspiracoes: '',
  idioma: '',
  nomeMundo: '',
}

/**
 * Wizard de criação de mundo por IA (`ai-world-generation`). Não existe uma
 * campanha (nem um id de recurso) até a última etapa ser confirmada, então,
 * diferente do `character-creation-wizard`, não há autosave por campo contra
 * um endpoint — o progresso por etapa é mantido aqui mesmo, em memória, e só
 * vai para o backend de uma vez, ao concluir a última etapa. A barra lateral,
 * a navegação livre entre etapas e o bloqueio de avanço com campo obrigatório
 * vazio reaproveitam o mesmo `WizardSidebar` do wizard de personagem.
 */
export function WorldWizardPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<WorldWizardStepId>('genero-tom')
  const [concluidos, setConcluidos] = useState<Set<WorldWizardStepId>>(new Set())
  const [estado, setEstado] = useState<WorldWizardState>(ESTADO_INICIAL)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function atualizar<K extends keyof WorldWizardState>(chave: K) {
    return (valor: WorldWizardState[K]) => setEstado((s) => ({ ...s, [chave]: valor }))
  }

  function marcarConcluidoEAvancar(passo: WorldWizardStepId) {
    setConcluidos((prev) => new Set(prev).add(passo))
    setStep(proximoPassoMundo(passo))
  }

  async function confirmarGeracao() {
    setErro(null)
    setEnviando(true)
    try {
      const geracao = await iniciarGeracaoMundo({
        generoTom: estado.generoTom.trim(),
        nivelPoder: estado.nivelPoder,
        restricoesConteudo: estado.semRestricoes ? 'Nenhuma restrição informada.' : estado.restricoesConteudo.trim(),
        tamanhoGrupo: Number(estado.tamanhoGrupo),
        inspiracoes: estado.inspiracoes.trim() || undefined,
        idioma: estado.idioma.trim() || undefined,
        nomeMundo: estado.nomeMundo.trim() || undefined,
      })
      setConcluidos((prev) => new Set(prev).add('extras'))
      navigate(`/campanhas/nova-ia/${geracao.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setErro('Não foi possível iniciar a geração do mundo agora. Tente novamente em instantes.')
      } else {
        setErro('Sem conexão com o servidor. Verifique sua internet e tente novamente.')
      }
      setEnviando(false)
    }
  }

  return (
    <main aria-label="Criação de mundo por IA" className="ficha-sheet wizard-screen">
      <header className="masthead">
        <div className="eyebrow">Criação de Campanha · Mestre IA</div>
        <Link to="/campanhas/nova" className="ro-back-link">
          Voltar
        </Link>
      </header>

      <div className="wizard-layout">
        <WizardSidebar
          ariaLabel="Etapas da criação de mundo"
          steps={WORLD_WIZARD_STEPS}
          current={step}
          concluidos={concluidos}
          onSelect={setStep}
        />

        <div className="wizard-main panel">
          {step === 'genero-tom' && (
            <GeneroTomStep
              value={estado.generoTom}
              onChange={atualizar('generoTom')}
              onConcluir={() => marcarConcluidoEAvancar('genero-tom')}
            />
          )}
          {step === 'nivel-poder' && (
            <NivelPoderStep
              value={estado.nivelPoder}
              onChange={atualizar('nivelPoder')}
              onConcluir={() => marcarConcluidoEAvancar('nivel-poder')}
            />
          )}
          {step === 'restricoes' && (
            <RestricoesStep
              semRestricoes={estado.semRestricoes}
              texto={estado.restricoesConteudo}
              onChangeSemRestricoes={atualizar('semRestricoes')}
              onChangeTexto={atualizar('restricoesConteudo')}
              onConcluir={() => marcarConcluidoEAvancar('restricoes')}
            />
          )}
          {step === 'grupo' && (
            <TamanhoGrupoStep
              value={estado.tamanhoGrupo}
              onChange={atualizar('tamanhoGrupo')}
              onConcluir={() => marcarConcluidoEAvancar('grupo')}
            />
          )}
          {step === 'extras' && (
            <ExtrasStep
              inspiracoes={estado.inspiracoes}
              idioma={estado.idioma}
              nomeMundo={estado.nomeMundo}
              onChangeInspiracoes={atualizar('inspiracoes')}
              onChangeIdioma={atualizar('idioma')}
              onChangeNomeMundo={atualizar('nomeMundo')}
              enviando={enviando}
              erro={erro}
              onConcluir={confirmarGeracao}
            />
          )}
        </div>
      </div>
    </main>
  )
}
