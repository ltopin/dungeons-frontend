/** Pontos de perícia no 1º nível: (base da classe + mod. Inteligência) × 4, mínimo 1 × 4, mais bônus racial fixo. */
export function pontosDePericiaNivel1(baseClasse: number, modInteligencia: number, bonusRacial: number): number {
  const porNivel = Math.max(1, baseClasse + modInteligencia)
  return porNivel * 4 + bonusRacial
}

/** Custo em pontos por graduação: 1 para perícia de classe, 2 para perícia fora de classe. */
export function custoDaGraduacao(deClasse: boolean): number {
  return deClasse ? 1 : 2
}
