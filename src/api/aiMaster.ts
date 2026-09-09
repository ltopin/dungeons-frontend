import { apiRequest } from './client'
import type { ContextoMundoIA } from './types'

interface IniciarGeracaoMundoRespostaApi {
  campanha_id: string
}

/**
 * Envia o contexto coletado pelo wizard de criação de mundo e inicia a
 * geração assíncrona no backend (change irmã `ai-dungeon-master` no
 * `dungeons-api`). A campanha já existe ao retornar, mas seu mundo ainda
 * pode estar em geração — ver `obterCampanha` + `Campanha.statusGeracaoMundo`.
 */
export async function iniciarGeracaoMundo(contexto: ContextoMundoIA): Promise<{ campanhaId: string }> {
  const resposta = await apiRequest<IniciarGeracaoMundoRespostaApi>('/campanhas/gerar-ia', {
    method: 'POST',
    body: {
      genero_tom: contexto.generoTom,
      nivel_poder: contexto.nivelPoder,
      restricoes_conteudo: contexto.restricoesConteudo,
      tamanho_grupo: contexto.tamanhoGrupo,
      inspiracoes: contexto.inspiracoes || undefined,
      idioma: contexto.idioma || undefined,
      nome_mundo: contexto.nomeMundo || undefined,
    },
  })
  return { campanhaId: resposta.campanha_id }
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
