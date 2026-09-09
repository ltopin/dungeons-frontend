import { apiRequest } from './client'
import type { CompendioClasse, CompendioMagia, CompendioPericia, CompendioRaca, CompendioTalento } from './compendioTypes'

export function listarRacasCompendio(): Promise<CompendioRaca[]> {
  return apiRequest<CompendioRaca[]>('/compendio/racas')
}

export function listarClassesCompendio(): Promise<CompendioClasse[]> {
  return apiRequest<CompendioClasse[]>('/compendio/classes')
}

export function listarPericiasCompendio(): Promise<CompendioPericia[]> {
  return apiRequest<CompendioPericia[]>('/compendio/pericias')
}

export function listarTalentosCompendio(): Promise<CompendioTalento[]> {
  return apiRequest<CompendioTalento[]>('/compendio/talentos')
}

export function listarMagiasCompendio(filtro: { classe?: string; nivel?: number } = {}): Promise<CompendioMagia[]> {
  const params = new URLSearchParams()
  if (filtro.classe) params.set('classe', filtro.classe)
  if (filtro.nivel !== undefined) params.set('nivel', String(filtro.nivel))
  const query = params.toString()
  return apiRequest<CompendioMagia[]>(`/compendio/magias${query ? `?${query}` : ''}`)
}
