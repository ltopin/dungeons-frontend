/**
 * Catálogo de rolagem de um jogador: toda entrada da própria ficha que pode
 * ser sugerida a partir de um `pedido_rolagem` — ver
 * `pedido-rolagem-sugere-pericia`/design.md, decisão "Catálogo de rolagem
 * unificado". Função pura, construída a partir da `Ficha` já carregada.
 */
import type { Ficha } from '../api/types'
import { ABILIDADES, atributoScore } from '../sheet/abilityMod'
import { attributeModifier } from '../rules/attributeMods'
import { initiative, savingThrow } from '../rules/combat'
import { skillTotal } from '../rules/skills'
import type { TipoItemFicha } from './types'

export type CatalogoRolagemEntry =
  | { rotulo: string; tipo: 'item'; tipoItem: TipoItemFicha; itemId: string; valor: string | null }
  | { rotulo: string; tipo: 'livre'; notacao: string }

/**
 * `1d20+N`, seguindo o formato validado por `isNotacaoDadosValida` — sem
 * sinal de "+" antes de um bônus negativo (ex.: `1d20-1`, não `1d20+-1`).
 */
function notacaoD20(bonus: number): string {
  return bonus >= 0 ? `1d20+${bonus}` : `1d20${bonus}`
}

/**
 * `1d20` + o bônus de ataque já salvo na ficha (texto livre, ex.: `+8/+3`
 * para ataques iterativos) — mantém o valor exatamente como o jogador o
 * digitou na aba Ataques, só prefixando o dado.
 */
function notacaoComBonusTexto(bonusTexto: string): string | null {
  const texto = bonusTexto.trim()
  if (!texto) return null
  return /^[+-]/.test(texto) ? `1d20${texto}` : `1d20+${texto}`
}

export function montarCatalogoRolagem(ficha: Ficha): CatalogoRolagemEntry[] {
  const entradas: CatalogoRolagemEntry[] = []

  for (const pericia of ficha.pericias) {
    // Recalculado a partir dos campos da própria perícia (como `PericiasTab`
    // já faz), em vez de confiar no `total` persistido — que pode chegar
    // `null` da API para fichas antigas/ainda não salvas.
    const total = skillTotal({
      graduacoes: Number(pericia.graduacoes || 0),
      atributoMod: attributeModifier(atributoScore(ficha.geral, pericia.atributo)),
      periciaDeClasse: pericia.periciaDeClasse,
      outros: Number(pericia.outros || 0),
    })
    entradas.push({
      rotulo: pericia.nome,
      tipo: 'item',
      tipoItem: 'pericia',
      itemId: pericia.id,
      valor: notacaoD20(total),
    })
  }
  for (const ataque of ficha.ataques) {
    entradas.push({
      rotulo: ataque.arma,
      tipo: 'item',
      tipoItem: 'ataque',
      itemId: ataque.id,
      valor: notacaoComBonusTexto(ataque.bonus),
    })
  }
  for (const talento of ficha.talentos) {
    entradas.push({ rotulo: talento.nome, tipo: 'item', tipoItem: 'talento', itemId: talento.id, valor: null })
  }

  const { geral, combate } = ficha
  const fortitude = savingThrow({
    base: combate.fortBase,
    atributoMod: attributeModifier(geral.con),
    magico: combate.fortMagico,
    outros: combate.fortOutros,
  })
  const reflexos = savingThrow({
    base: combate.reflexosBase,
    atributoMod: attributeModifier(geral.dex),
    magico: combate.reflexosMagico,
    outros: combate.reflexosOutros,
  })
  const vontade = savingThrow({
    base: combate.vontadeBase,
    atributoMod: attributeModifier(geral.wis),
    magico: combate.vontadeMagico,
    outros: combate.vontadeOutros,
  })
  const iniciativaTotal = initiative({ destrezaMod: attributeModifier(geral.dex), outros: combate.iniciativaOutros })

  entradas.push({ rotulo: 'Fortitude', tipo: 'livre', notacao: notacaoD20(fortitude) })
  entradas.push({ rotulo: 'Reflexos', tipo: 'livre', notacao: notacaoD20(reflexos) })
  entradas.push({ rotulo: 'Vontade', tipo: 'livre', notacao: notacaoD20(vontade) })
  entradas.push({ rotulo: 'Iniciativa', tipo: 'livre', notacao: notacaoD20(iniciativaTotal) })

  for (const abilidade of ABILIDADES) {
    entradas.push({
      rotulo: abilidade.label,
      tipo: 'livre',
      notacao: notacaoD20(attributeModifier(geral[abilidade.key])),
    })
  }

  return entradas
}
