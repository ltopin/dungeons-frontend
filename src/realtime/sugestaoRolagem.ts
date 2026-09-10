/**
 * Casa o texto livre de um `pedido_rolagem` contra o catálogo de rolagem do
 * jogador — ver `pedido-rolagem-sugere-pericia`/design.md, decisão "Dois
 * modos de casamento texto → catálogo". Perícia/ataque/talento usam
 * substring direta (nomes distintivos, baixo risco de falso positivo);
 * resistência/iniciativa/atributo exigem um padrão ancorado, porque seus
 * nomes são palavras comuns do português.
 */
import type { CatalogoRolagemEntry } from './catalogoRolagem'

const DIACRITICS_PATTERN = /[̀-ͯ]/g

function normalize(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(DIACRITICS_PATTERN, '')
    .toLowerCase()
    .trim()
}

function escapeRegExp(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const ANCORAS_DERIVADAS = ['teste de', 'resistencia de', 'salvamento de']

function correspondeEntradaDerivada(descricaoNormalizada: string, rotuloNormalizado: string): boolean {
  if (rotuloNormalizado === 'iniciativa') {
    return /\biniciativa\b/.test(descricaoNormalizada)
  }
  return ANCORAS_DERIVADAS.some((ancora) =>
    new RegExp(`\\b${ancora}\\s+${escapeRegExp(rotuloNormalizado)}\\b`).test(descricaoNormalizada),
  )
}

export function sugerirEntradaDoPedido(
  descricao: string,
  catalogo: CatalogoRolagemEntry[],
): CatalogoRolagemEntry | null {
  const descricaoNormalizada = normalize(descricao)

  for (const entrada of catalogo) {
    if (entrada.tipo === 'item' && descricaoNormalizada.includes(normalize(entrada.rotulo))) {
      return entrada
    }
  }

  for (const entrada of catalogo) {
    if (entrada.tipo === 'livre' && correspondeEntradaDerivada(descricaoNormalizada, normalize(entrada.rotulo))) {
      return entrada
    }
  }

  return null
}
