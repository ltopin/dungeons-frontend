import { apiRequest } from './client'
import type { ContextoMundoIA, GeracaoMundoIA, StatusGeracaoMundoIA } from './types'

interface GeracaoMundoIAApi {
  id: string
  status: StatusGeracaoMundoIA
  campanha_id?: string
  erro?: string
}

function mapGeracao(api: GeracaoMundoIAApi): GeracaoMundoIA {
  return { id: api.id, status: api.status, campanhaId: api.campanha_id, erro: api.erro }
}

/**
 * Dispara a geração assíncrona de mundo no backend (change irmã
 * `ai-dungeon-master` no `dungeons-api`, montada em `/geracao-mundo-ia`, não
 * em `/campanhas`). O backend não cria a campanha de imediato — ela só passa
 * a existir quando a geração conclui (`status === 'concluida'`), ver
 * `consultarStatusGeracaoMundo`. `idioma` e `nomeMundo` são campos separados
 * no wizard, mas o backend espera um único `idioma_nome_mundo`.
 */
export async function iniciarGeracaoMundo(contexto: ContextoMundoIA): Promise<GeracaoMundoIA> {
  const idiomaNomeMundo = [contexto.idioma, contexto.nomeMundo].filter(Boolean).join(' — ') || undefined
  const resposta = await apiRequest<GeracaoMundoIAApi>('/geracao-mundo-ia', {
    method: 'POST',
    body: {
      genero_tom: contexto.generoTom,
      nivel_poder: contexto.nivelPoder,
      restricoes_conteudo: contexto.restricoesConteudo,
      tamanho_grupo: contexto.tamanhoGrupo,
      inspiracoes: contexto.inspiracoes || undefined,
      idioma_nome_mundo: idiomaNomeMundo,
    },
  })
  return mapGeracao(resposta)
}

/** Consulta o status de uma geração de mundo em andamento, para polling. */
export async function consultarStatusGeracaoMundo(geracaoId: string): Promise<GeracaoMundoIA> {
  const resposta = await apiRequest<GeracaoMundoIAApi>(`/geracao-mundo-ia/${geracaoId}`)
  return mapGeracao(resposta)
}

interface EntrarAposGeracaoRespostaApi {
  membership: { campanha_id: string }
  ficha: { id: string }
}

/**
 * Criador entra como jogador comum na campanha recém-gerada; a IA permanece
 * mestre. Só é válido depois que a geração indicada por `geracaoId` concluiu.
 */
export async function entrarComoJogadorAposGeracao(
  geracaoId: string,
): Promise<{ campanhaId: string; fichaId: string }> {
  const resposta = await apiRequest<EntrarAposGeracaoRespostaApi>(
    `/geracao-mundo-ia/${geracaoId}/entrar-como-jogador`,
    { method: 'POST' },
  )
  return { campanhaId: resposta.membership.campanha_id, fichaId: resposta.ficha.id }
}

interface ResumoHandoffApi {
  resumo: string
}

/**
 * Assume como mestre humano permanentemente (ação irreversível — ver
 * `ai-master-handoff`). Retorna o resumo gerado pela IA para o novo mestre.
 */
export async function assumirComoMestre(campanhaId: string): Promise<{ resumo: string }> {
  const resposta = await apiRequest<ResumoHandoffApi>(`/campanhas/${campanhaId}/assumir-mestre`, {
    method: 'POST',
  })
  return { resumo: resposta.resumo }
}

/** Reabre o resumo de handoff já gerado, para campanhas com `handoffDisponivel`. */
export async function obterResumoHandoff(campanhaId: string): Promise<{ resumo: string }> {
  const resposta = await apiRequest<ResumoHandoffApi>(`/campanhas/${campanhaId}/handoff-resumo`)
  return { resumo: resposta.resumo }
}
