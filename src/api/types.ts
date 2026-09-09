export type Role = 'mestre' | 'jogador'

/** Quem conduz a campanha hoje. Ausente/`'humano'` para campanhas fora do fluxo de IA. */
export type OrigemMestre = 'humano' | 'ia'

export type ModoCampanha = 'exploracao' | 'combate'

export interface Conta {
  id: string
  nome: string
  email: string
  criado_em: string
}

export interface Campanha {
  id: string
  nome: string
  role: Role
  /** Presente quando role === 'jogador': id da ficha do usuário atual nesta campanha. */
  fichaId?: string
  /** Presente quando a campanha tem um mundo vinculado. */
  mundoId?: string
  /** Ausente equivale a `'humano'` — mantém campanhas existentes sem mudança de comportamento. */
  mestre?: OrigemMestre
  /** true quando a conta atual foi quem criou esta campanha (relevante para `ai-master-handoff`). */
  souCriador?: boolean
  /** Presente quando `mestre === 'ia'` e o mundo já está pronto. */
  modo?: ModoCampanha
  /** true quando esta campanha já passou por um handoff IA → humano e tem resumo para reabrir. */
  handoffDisponivel?: boolean
}

/** Contexto coletado pelo wizard de criação de mundo (`ai-world-generation`). */
export interface ContextoMundoIA {
  generoTom: string
  nivelPoder: string
  restricoesConteudo: string
  tamanhoGrupo: number
  inspiracoes?: string
  idioma?: string
  nomeMundo?: string
}

export type StatusGeracaoMundoIA = 'pendente' | 'em_andamento' | 'concluida' | 'erro'

/**
 * Geração assíncrona de mundo (`ai-world-generation`, backend `dungeons-api`).
 * A campanha só passa a existir quando `status === 'concluida'` — até lá só
 * este registro existe, por isso o acompanhamento é feito por `id` (geracaoId),
 * não por campanhaId.
 */
export interface GeracaoMundoIA {
  id: string
  status: StatusGeracaoMundoIA
  /** Presente apenas quando `status === 'concluida'`. */
  campanhaId?: string
  /** Presente apenas quando `status === 'erro'`. */
  erro?: string
}

export interface Mundo {
  id: string
  nome: string
}

export type StatusElementoHistoria = 'rascunho' | 'publicado'

export interface ElementoHistoria {
  id: string
  mundoId: string
  titulo: string
  categoria: string
  conteudo: string
  status: StatusElementoHistoria
}

export interface CampanhaDisponivel {
  id: string
  nome: string
  criado_em?: string
  descricao?: string
  mestre_nome?: string
}

export interface FichaResumo {
  id: string
  contaId: string
  nomePersonagem: string
  classe: string
  nivel: number
  /** Nome do jogador dono da ficha. Ausente até a API expor `nome_jogador`. */
  nomeJogador?: string
}

export interface FichaGeral {
  nomePersonagem: string
  classe: string
  nivel: number
  raca: string
  alinhamento: string
  divindade: string
  tamanho: string
  genero: string
  idade: string
  altura: string
  peso: string
  idiomas: string
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export interface FichaCombate {
  pvMax: number
  pvAtual: number
  pvTemp: number
  dadosDeVida: string
  caTotal: number
  caToque: number
  caSurpreendido: number
  caArmadura: number
  caEscudo: number
  caDestreza: number
  caTamanho: number
  caNatural: number
  caDesvio: number
  caOutros: number
  fortBase: number
  fortMagico: number
  fortOutros: number
  reflexosBase: number
  reflexosMagico: number
  reflexosOutros: number
  vontadeBase: number
  vontadeMagico: number
  vontadeOutros: number
  bab: number
  deslocamento: number
  iniciativaOutros: number
  iniciativaTotal: number
  agarraoOutros: number
  corpoACorpoOutros: number
  distanciaOutros: number
  cmbTotal: number
  cmbOutros: number
  cmdTotal: number
  cmdOutros: number
}

export interface FichaMagiasConfig {
  atributoConjuracao: string
  nivelConjurador: number
  cdOutros: number
}

export interface FichaMoedas {
  pp: number
  gp: number
  sp: number
  cp: number
  cargaLeve: number
  cargaMedia: number
  cargaPesada: number
  pesoTotalCarregado: number
}

export interface FichaNotas {
  texto: string
}

export type FichaTalentoCategoria = 'talento' | 'qualidade_especial'

export interface FichaTalento {
  id: string
  nome: string
  descricao: string
  categoria: FichaTalentoCategoria
}

export interface FichaAtaque {
  id: string
  arma: string
  bonus: string
  dano: string
  critico: string
  tipo: string
  alcance: string
  peso: number
  tamanho: string
  propriedadesEspeciais: string
}

export interface FichaPericia {
  id: string
  nome: string
  atributo: string
  periciaDeClasse: boolean
  graduacoes: number
  outros: number
  total: number
}

export interface FichaMagiaNivel {
  id: string
  nivel: number
  espacosPorDia: number | null
  magiasAdicionais: number | null
  magiasConhecidas: number | null
}

export interface FichaMagia {
  id: string
  nivel: number
  nome: string
  preparada: boolean
  notas: string
  escola: string
  tempoFormulacao: string
  componentes: string
  alcance: string
  alvoEfeito: string
  duracao: string
  testeResistencia: string
  resistenciaMagia: string
  descricao: string
}

export interface FichaItem {
  id: string
  nome: string
  quantidade: number
  peso: number
  notas: string
}

/**
 * Familiar/companheiro animal — seção 1:1 opcional (ausente até o jogador
 * preencher o primeiro campo). Ver `character-sheets`, requisito "Edição da
 * seção de familiar/companheiro animal".
 */
export interface FichaFamiliar {
  nome: string
  tipo: string
  dv: string
  iniciativa: number
  deslocamento: number
  ca: number
  ataques: string
  ae: string
  qe: string
  tendencia: string
  fortitude: number
  reflexos: number
  vontade: number
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
  cmb: number
  cmd: number
  face: string
}

export interface Ficha {
  id: string
  geral: FichaGeral
  combate: FichaCombate
  magiasConfig: FichaMagiasConfig
  moedas: FichaMoedas
  notas: FichaNotas
  talentos: FichaTalento[]
  ataques: FichaAtaque[]
  pericias: FichaPericia[]
  magiaNiveis: FichaMagiaNivel[]
  magias: FichaMagia[]
  itens: FichaItem[]
  familiar?: FichaFamiliar
}

export type SecaoUmParaUm = 'geral' | 'combate' | 'magias-config' | 'moedas' | 'notas' | 'familiar'
export type SecaoLista = 'talentos' | 'ataques' | 'pericias' | 'magias' | 'itens'
