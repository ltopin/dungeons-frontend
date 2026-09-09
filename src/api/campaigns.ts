import { apiRequest } from './client'
import type { Campanha, CampanhaDisponivel, FichaResumo } from './types'

export function listarCampanhas(): Promise<Campanha[]> {
  return apiRequest<Campanha[]>('/campanhas')
}

export function obterCampanha(id: string): Promise<Campanha> {
  return apiRequest<Campanha>(`/campanhas/${id}`)
}

export function criarCampanha(nome: string, descricao?: string, mundoId?: string): Promise<Campanha> {
  return apiRequest<Campanha>('/campanhas', { method: 'POST', body: { nome, descricao, mundoId } })
}

export function vincularMundoACampanha(campanhaId: string, mundoId: string): Promise<Campanha> {
  return apiRequest<Campanha>(`/campanhas/${campanhaId}/mundo`, { method: 'POST', body: { mundoId } })
}

export function listarCampanhasAbertas(): Promise<CampanhaDisponivel[]> {
  return apiRequest<CampanhaDisponivel[]>('/campanhas/disponiveis')
}

interface EntrarCampanhaRespostaApi {
  membership: { campanha_id: string }
  ficha: { id: string }
}

export async function entrarNaCampanha(campanhaId: string): Promise<{ campanhaId: string; fichaId: string }> {
  const resposta = await apiRequest<EntrarCampanhaRespostaApi>(`/campanhas/${campanhaId}/entrar`, {
    method: 'POST',
  })
  return { campanhaId: resposta.membership.campanha_id, fichaId: resposta.ficha.id }
}

interface FichaResumoApi extends FichaResumo {
  /** A API expõe o nome do jogador em snake_case; mapeado para `nomeJogador` abaixo. */
  nome_jogador?: string
}

export async function listarFichasDaCampanha(campanhaId: string): Promise<FichaResumo[]> {
  const resumos = await apiRequest<FichaResumoApi[]>(`/campanhas/${campanhaId}/fichas`)
  return resumos.map(({ nome_jogador, ...resumo }) => ({
    ...resumo,
    nomeJogador: resumo.nomeJogador ?? nome_jogador,
  }))
}
