export interface ItemEquipamentoSrd {
  id: string
  nome: string
  categoria: 'arma' | 'armadura' | 'escudo' | 'geral'
  custoGp: number
  pesoKg: number
}

/**
 * Catálogo curado de equipamento inicial para a etapa de Equipamento da
 * Trilha de Criação de Personagem — não é a lista completa de itens do SRD,
 * só o suficiente para montar um personagem de 1º nível.
 */
export const CATALOGO_EQUIPAMENTO: ItemEquipamentoSrd[] = [
  { id: 'adaga', nome: 'Adaga', categoria: 'arma', custoGp: 2, pesoKg: 0.5 },
  { id: 'espada_longa', nome: 'Espada longa', categoria: 'arma', custoGp: 15, pesoKg: 2 },
  { id: 'machado_grande', nome: 'Machado grande', categoria: 'arma', custoGp: 20, pesoKg: 6 },
  { id: 'arco_curto', nome: 'Arco curto', categoria: 'arma', custoGp: 30, pesoKg: 1 },
  { id: 'cajado', nome: 'Cajado', categoria: 'arma', custoGp: 0, pesoKg: 2 },
  { id: 'armadura_couro', nome: 'Armadura de couro', categoria: 'armadura', custoGp: 10, pesoKg: 7.5 },
  { id: 'cota_de_malha', nome: 'Cota de malha', categoria: 'armadura', custoGp: 150, pesoKg: 20 },
  { id: 'escudo_pequeno_madeira', nome: 'Escudo pequeno de madeira', categoria: 'escudo', custoGp: 3, pesoKg: 2.5 },
  { id: 'mochila', nome: 'Mochila', categoria: 'geral', custoGp: 2, pesoKg: 1 },
  { id: 'corda_seda_15m', nome: 'Corda de seda (15m)', categoria: 'geral', custoGp: 10, pesoKg: 2.5 },
  { id: 'tocha', nome: 'Tocha', categoria: 'geral', custoGp: 0.01, pesoKg: 0.5 },
  { id: 'racoes_1dia', nome: 'Ração de viagem (1 dia)', categoria: 'geral', custoGp: 0.5, pesoKg: 0.5 },
  { id: 'kit_ladrao', nome: 'Kit de ladrão', categoria: 'geral', custoGp: 30, pesoKg: 1 },
  { id: 'simbolo_sagrado', nome: 'Símbolo sagrado de madeira', categoria: 'geral', custoGp: 1, pesoKg: 0.1 },
  { id: 'foco_arcano', nome: 'Componente de foco arcano (bolsa)', categoria: 'geral', custoGp: 5, pesoKg: 0.5 },
  { id: 'instrumento_musical', nome: 'Instrumento musical simples', categoria: 'geral', custoGp: 5, pesoKg: 1.5 },
  { id: 'lanterna_capuz', nome: 'Lanterna de capuz', categoria: 'geral', custoGp: 7, pesoKg: 1 },
]

/**
 * O compêndio do `dungeons-api` não cobre equipamento (armas/armaduras) nem
 * ouro inicial por classe — decisão confirmada com o usuário de manter essas
 * duas coisas como dado estático do frontend. Chaves pelo nome da classe tal
 * como vem do compêndio (`CompendioClasse.nome`), para não depender de um id
 * próprio que o catálogo de equipamento não tem como conhecer.
 */
export const OURO_INICIAL_POR_CLASSE: Record<string, number> = {
  Bárbaro: 105,
  Bardo: 100,
  Clérigo: 100,
  Druida: 70,
  Feiticeiro: 50,
  Guerreiro: 175,
  Ladino: 100,
  Mago: 70,
  Monge: 70,
  Paladino: 175,
  Patrulheiro: 175,
}

/** Pacote inicial sugerido por classe, para preenchimento rápido dentro do ouro médio da classe. */
export const PACOTES_INICIAIS: Record<string, string[]> = {
  Guerreiro: ['espada_longa', 'armadura_couro', 'escudo_pequeno_madeira', 'mochila', 'racoes_1dia'],
  Bárbaro: ['machado_grande', 'mochila', 'racoes_1dia', 'corda_seda_15m'],
  Ladino: ['adaga', 'kit_ladrao', 'mochila', 'corda_seda_15m', 'lanterna_capuz'],
  Bardo: ['espada_longa', 'instrumento_musical', 'mochila', 'racoes_1dia'],
  Clérigo: ['cajado', 'armadura_couro', 'simbolo_sagrado', 'mochila', 'racoes_1dia'],
  Mago: ['cajado', 'foco_arcano', 'mochila', 'racoes_1dia', 'tocha'],
  Druida: ['cajado', 'mochila', 'racoes_1dia', 'corda_seda_15m'],
  Feiticeiro: ['adaga', 'foco_arcano', 'mochila', 'racoes_1dia'],
  Monge: ['adaga', 'mochila', 'racoes_1dia', 'corda_seda_15m'],
  Paladino: ['espada_longa', 'armadura_couro', 'escudo_pequeno_madeira', 'simbolo_sagrado', 'mochila', 'racoes_1dia'],
  Patrulheiro: ['arco_curto', 'adaga', 'mochila', 'racoes_1dia', 'corda_seda_15m'],
}

export function itemEquipamentoPorId(id: string): ItemEquipamentoSrd | undefined {
  return CATALOGO_EQUIPAMENTO.find((i) => i.id === id)
}
