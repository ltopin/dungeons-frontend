/**
 * Formato de fio do compêndio D&D 3.5/Pathfinder 1e servido pelo `dungeons-api`
 * (`GET /compendio/*`). A API não usa a mesma convenção de nomes do resto do
 * frontend — os campos ficam em snake_case como vêm do backend, sem passar
 * pelo mapeador de `wireFormat.ts` (que só remapeia o nível raiz da ficha).
 */

export interface CompendioRacaTraco {
  nome: string
  descricao: string
}

export interface CompendioRaca {
  id: string
  nome: string
  /** Ajuste de atributo fixo da raça (ex: `{ con: 2, cha: -2 }`). Vazio para raças com bônus "à escolha" (Humano, Meio-Elfo, Meio-Orc). */
  ajustes_atributo: Record<string, number>
  tamanho: string
  deslocamento: number
  tipo: string
  tracos: CompendioRacaTraco[]
  idiomas: string[]
}

export interface CompendioClasseMagiasPorDia {
  nivel_personagem: number
  espacos: number[]
}

export interface CompendioClasseCaracteristica {
  nivel: number
  nome: string
  descricao: string
}

export interface CompendioClasse {
  id: string
  nome: string
  dado_vida: string
  bab_progressao: 'boa' | 'media' | 'ruim'
  salvaguardas_progressao: {
    fortitude: 'boa' | 'ruim'
    reflexos: 'boa' | 'ruim'
    vontade: 'boa' | 'ruim'
  }
  pericias_de_classe: string[]
  pontos_pericia_por_nivel: number
  conjurador: boolean
  atributo_conjuracao: string | null
  magias_por_dia: CompendioClasseMagiasPorDia[]
  caracteristicas: CompendioClasseCaracteristica[]
}

export interface CompendioPericia {
  id: string
  nome: string
  atributo: string | null
}

export interface CompendioTalento {
  id: string
  nome: string
  tipo: string
  pre_requisitos: string | null
  beneficio: string
}

export interface CompendioMagiaNivelPorClasse {
  classe: string
  nivel: number
}

export interface CompendioMagia {
  id: string
  nome: string
  escola: string
  subescola: string | null
  nivel_por_classe: CompendioMagiaNivelPorClasse[]
  tempo_conjuracao: string
  componentes: string
  alcance: string
  alvo_efeito: string
  duracao: string
  resistencia_magia: string | null
  teste_resistencia: string | null
  descricao: string
}
