export type Role = 'mestre' | 'jogador'

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
  agarraoOutros: number
  corpoACorpoOutros: number
  distanciaOutros: number
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
}

export interface FichaNotas {
  texto: string
}

export interface FichaTalento {
  id: string
  nome: string
  descricao: string
}

export interface FichaAtaque {
  id: string
  arma: string
  bonus: string
  dano: string
  critico: string
  tipo: string
  alcance: string
}

export interface FichaPericia {
  id: string
  nome: string
  atributo: string
  periciaDeClasse: boolean
  graduacoes: number
  outros: number
}

export interface FichaMagiaNivel {
  id: string
  nivel: number
  espacosPorDia: number | null
}

export interface FichaMagia {
  id: string
  nivel: number
  nome: string
  preparada: boolean
  notas: string
}

export interface FichaItem {
  id: string
  nome: string
  quantidade: number
  peso: number
  notas: string
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
}

export type SecaoUmParaUm = 'geral' | 'combate' | 'magias-config' | 'moedas' | 'notas'
export type SecaoLista = 'talentos' | 'ataques' | 'pericias' | 'magias' | 'itens'
