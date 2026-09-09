import type { AbilidadeKey } from '../sheet/abilityMod'
import type { CompendioClasse, CompendioRaca, CompendioTalento } from '../api/compendioTypes'
import { babNoNivel1 } from '../rules/classProgression'
import { avaliarPreRequisitos, type ContextoCompendio, type ResultadoPreRequisito } from '../rules/compendioPrereq'

/**
 * O compêndio não expõe um número pronto de "talentos disponíveis no 1º
 * nível" — só descreve em texto livre (`caracteristicas`/`tracos`) quando
 * uma classe ou raça concede um talento extra (ex: "Talento de Combate
 * Bônus" do Guerreiro, "Talentoso" do Humano). Heurística tolerante: todo
 * personagem começa com 1 talento; soma mais 1 para cada característica de
 * classe no 1º nível ou traço racial cujo texto mencione um talento
 * adicional/bônus.
 */
export function talentosDisponiveisNivel1(classe: CompendioClasse | undefined, raca: CompendioRaca | undefined): number {
  const mencionaTalentoExtra = (texto: string) => /talento/i.test(texto) && /(b[ôo]nus|adicional)/i.test(texto)
  const daClasse = (classe?.caracteristicas ?? []).filter(
    (c) => c.nivel === 1 && mencionaTalentoExtra(`${c.nome} ${c.descricao}`),
  ).length
  const daRaca = (raca?.tracos ?? []).filter((t) => mencionaTalentoExtra(`${t.nome} ${t.descricao}`)).length
  return 1 + daClasse + daRaca
}

/**
 * Mesma limitação: o compêndio descreve o traço racial de perícia extra em
 * texto livre ("Recebe pontos de perícia adicionais a cada nível"), sem
 * expor o número. A regra real do Pathfinder 1e para esse traço (Humano) é
 * +1 ponto de perícia por nível, incluindo o 1º — valor fixo aplicado
 * quando o traço é detectado, não inventado a partir do texto.
 */
export function bonusPericiaNivel1(raca: CompendioRaca | undefined): number {
  const mencionaPericiaExtra = (texto: string) =>
    /per[íi]cia/i.test(texto) && /(adicion|extra)/i.test(texto) && /cada n[íi]vel/i.test(texto)
  return (raca?.tracos ?? []).some((t) => mencionaPericiaExtra(`${t.nome} ${t.descricao}`)) ? 1 : 0
}

export function contextoDoCompendio(input: {
  atributos: Record<AbilidadeKey, number>
  classe: CompendioClasse | undefined
  nivelPersonagem: number
  nomesTalentosEscolhidos: Set<string>
}): ContextoCompendio {
  return {
    atributos: input.atributos,
    bab: input.classe ? babNoNivel1(input.classe.bab_progressao) : 0,
    nivelSeConjurador: input.classe?.conjurador ? input.nivelPersonagem : 0,
    nomesTalentosEscolhidos: input.nomesTalentosEscolhidos,
  }
}

export function avaliarTalento(
  talento: CompendioTalento,
  ctx: ContextoCompendio,
  nomesTalentosCatalogo: Set<string>,
): { resultado: ResultadoPreRequisito; motivo?: string } {
  return avaliarPreRequisitos(talento.pre_requisitos, ctx, nomesTalentosCatalogo)
}
