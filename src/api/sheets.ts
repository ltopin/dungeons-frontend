import { apiRequest } from './client'
import type { Ficha, FichaMagiaNivel, FichaNotas, SecaoLista, SecaoUmParaUm } from './types'
import { mapListToFrontend, mapObjectToFrontend, mapPatchToBackend, type Json } from './wireFormat'

// Nomes de rota da API que não seguem o mesmo nome usado no frontend.
const SECTION_ROUTE: Record<SecaoUmParaUm, string> = {
  geral: 'geral',
  combate: 'combate',
  'magias-config': 'magias-config',
  moedas: 'inventario-moedas',
  notas: 'notas',
  familiar: 'familiar',
}

export async function obterFicha(fichaId: string): Promise<Ficha> {
  const raw = await apiRequest<Json>(`/fichas/${fichaId}`)
  return {
    id: raw.id as string,
    geral: mapObjectToFrontend(raw.geral as Json),
    combate: mapObjectToFrontend(raw.combate as Json),
    magiasConfig: mapObjectToFrontend(raw.magias_config as Json),
    moedas: mapObjectToFrontend(raw.inventario_moedas as Json),
    notas: { texto: (raw.notas as string | null) ?? '' },
    talentos: mapListToFrontend(raw.talentos),
    ataques: mapListToFrontend(raw.ataques),
    pericias: mapListToFrontend(raw.pericias),
    magiaNiveis: mapListToFrontend(raw.magia_niveis),
    magias: mapListToFrontend(raw.magias),
    itens: mapListToFrontend(raw.itens),
    familiar: raw.familiar ? mapObjectToFrontend(raw.familiar as Json) : undefined,
  }
}

export async function atualizarSecao<T extends object>(
  fichaId: string,
  secao: SecaoUmParaUm,
  patch: Partial<T>,
): Promise<T> {
  if (secao === 'notas') {
    const { texto } = patch as Partial<FichaNotas>
    const result = await apiRequest<{ notas: string | null }>(`/fichas/${fichaId}/notas`, {
      method: 'PATCH',
      body: { notas: texto },
    })
    return { texto: result.notas ?? '' } as unknown as T
  }

  const result = await apiRequest<Json>(`/fichas/${fichaId}/${SECTION_ROUTE[secao]}`, {
    method: 'PATCH',
    body: mapPatchToBackend(patch as Json),
  })
  return mapObjectToFrontend<T>(result)
}

export async function criarLinha<T>(fichaId: string, secao: SecaoLista, dados: Partial<T>): Promise<T> {
  const result = await apiRequest<Json>(`/fichas/${fichaId}/${secao}`, {
    method: 'POST',
    body: mapPatchToBackend(dados as Json),
  })
  return mapObjectToFrontend<T>(result)
}

export async function atualizarLinha<T>(
  fichaId: string,
  secao: SecaoLista,
  itemId: string,
  patch: Partial<T>,
): Promise<T> {
  const result = await apiRequest<Json>(`/fichas/${fichaId}/${secao}/${itemId}`, {
    method: 'PATCH',
    body: mapPatchToBackend(patch as Json),
  })
  return mapObjectToFrontend<T>(result)
}

export function removerLinha(fichaId: string, secao: SecaoLista, itemId: string): Promise<void> {
  return apiRequest<void>(`/fichas/${fichaId}/${secao}/${itemId}`, { method: 'DELETE' })
}

export async function atualizarMagiaNiveis(
  fichaId: string,
  niveis: FichaMagiaNivel[],
): Promise<FichaMagiaNivel[]> {
  const body = { niveis: niveis.map((n) => ({ nivel: n.nivel, espacos_por_dia: n.espacosPorDia })) }
  const result = await apiRequest<Json[]>(`/fichas/${fichaId}/magia-niveis`, { method: 'PATCH', body })
  return mapListToFrontend(result)
}
