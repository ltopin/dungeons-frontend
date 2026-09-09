import { apiRequest } from './client'
import type { ElementoHistoria, Mundo } from './types'

export function criarMundo(nome: string): Promise<Mundo> {
  return apiRequest<Mundo>('/mundos', { method: 'POST', body: { nome } })
}

export function listarMundos(): Promise<Mundo[]> {
  return apiRequest<Mundo[]>('/mundos')
}

export interface DadosElemento {
  titulo: string
  categoria: string
  conteudo: string
}

export function criarElemento(mundoId: string, dados: DadosElemento): Promise<ElementoHistoria> {
  return apiRequest<ElementoHistoria>(`/mundos/${mundoId}/elementos`, { method: 'POST', body: dados })
}

export function editarElemento(mundoId: string, elementoId: string, dados: DadosElemento): Promise<ElementoHistoria> {
  return apiRequest<ElementoHistoria>(`/mundos/${mundoId}/elementos/${elementoId}`, { method: 'PATCH', body: dados })
}

export function publicarElemento(mundoId: string, elementoId: string): Promise<ElementoHistoria> {
  return apiRequest<ElementoHistoria>(`/mundos/${mundoId}/elementos/${elementoId}/publicar`, { method: 'POST' })
}

export function listarElementosDoMundo(mundoId: string): Promise<ElementoHistoria[]> {
  return apiRequest<ElementoHistoria[]>(`/mundos/${mundoId}/elementos`)
}

export function listarElementosPublicadosDaCampanha(campanhaId: string): Promise<ElementoHistoria[]> {
  return apiRequest<ElementoHistoria[]>(`/campanhas/${campanhaId}/mundo/elementos`)
}
