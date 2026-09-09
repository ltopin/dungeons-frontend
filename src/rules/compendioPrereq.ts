import type { AbilidadeKey } from '../sheet/abilityMod'

/**
 * Parser tolerante do texto livre `pre_requisitos` do compêndio (ex: "Força
 * 13", "Base de Ataque Base +1", "Destreza 13, Esquiva"). Cobre os padrões
 * mais comuns dos 176 talentos do compêndio; qualquer cláusula que não
 * reconheça marca o pré-requisito inteiro como "não verificável" — decisão
 * do usuário: nesse caso o wizard não bloqueia a escolha, só avisa que não
 * conseguiu confirmar automaticamente (ver design.md da Trilha de Criação de
 * Personagem).
 */
export type ResultadoPreRequisito = 'atende' | 'nao_atende' | 'nao_verificavel'

export interface ContextoCompendio {
  atributos: Record<AbilidadeKey, number>
  bab: number
  /** Nível do personagem, apenas se a classe escolhida for conjuradora; 0 caso contrário. */
  nivelSeConjurador: number
  /** Nomes (como aparecem no compêndio) dos talentos já escolhidos nesta criação. */
  nomesTalentosEscolhidos: Set<string>
}

const ATRIBUTO_POR_NOME: Record<string, AbilidadeKey> = {
  força: 'str',
  forca: 'str',
  destreza: 'dex',
  constituição: 'con',
  constituicao: 'con',
  inteligência: 'int',
  inteligencia: 'int',
  sabedoria: 'wis',
  carisma: 'cha',
}

type ClausulaResultado = ResultadoPreRequisito | 'nao_reconhecida'

function avaliarClausula(
  clausulaOriginal: string,
  ctx: ContextoCompendio,
  nomesTalentosCatalogo: Set<string>,
): ClausulaResultado {
  const clausula = clausulaOriginal.trim()

  const matchAtributo = clausula.match(
    /^(For[çc]a|Destreza|Constitui[çc][ãa]o|Intelig[êe]ncia|Sabedoria|Carisma)\s+(\d+)$/i,
  )
  if (matchAtributo) {
    const chave = ATRIBUTO_POR_NOME[matchAtributo[1].toLowerCase()]
    const minimo = Number(matchAtributo[2])
    return ctx.atributos[chave] >= minimo ? 'atende' : 'nao_atende'
  }

  const matchBab = clausula.match(/^Base de Ataque(?: Base)?\s*\+?\s*(\d+)$/i)
  if (matchBab) {
    return ctx.bab >= Number(matchBab[1]) ? 'atende' : 'nao_atende'
  }

  const matchConjurador = clausula.match(/^Conjurador de n[íi]vel\s+(\d+)$/i)
  if (matchConjurador) {
    return ctx.nivelSeConjurador >= Number(matchConjurador[1]) ? 'atende' : 'nao_atende'
  }

  if (nomesTalentosCatalogo.has(clausula.toLowerCase())) {
    return ctx.nomesTalentosEscolhidos.has(clausula.toLowerCase()) ? 'atende' : 'nao_atende'
  }

  return 'nao_reconhecida'
}

export function avaliarPreRequisitos(
  preRequisitos: string | null | undefined,
  ctx: ContextoCompendio,
  nomesTalentosCatalogo: Set<string>,
): { resultado: ResultadoPreRequisito; motivo?: string } {
  const texto = (preRequisitos ?? '').trim()
  if (!texto) return { resultado: 'atende' }

  const clausulas = texto
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
  const avaliacoes = clausulas.map((c) => avaliarClausula(c, ctx, nomesTalentosCatalogo))

  if (avaliacoes.includes('nao_reconhecida')) {
    return { resultado: 'nao_verificavel', motivo: texto }
  }

  const naoAtendidas = clausulas.filter((_, i) => avaliacoes[i] === 'nao_atende')
  if (naoAtendidas.length > 0) {
    return { resultado: 'nao_atende', motivo: naoAtendidas.join(', ') }
  }

  return { resultado: 'atende' }
}
