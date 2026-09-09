/**
 * Valida a notação de dados no cliente antes do envio (ex.: `2d6+3`),
 * espelhando o parser de `dungeons-api` (src/services/eventosMesa.ts,
 * `parseDadoNotacao`) para bloquear notações inválidas sem contatar o servidor.
 */
export function isNotacaoDadosValida(notacao: string): boolean {
  const match = /^(\d*)d(\d+)([+-]\d+)?$/i.exec(notacao.trim())
  if (!match) return false
  const quantidade = match[1] ? Number(match[1]) : 1
  const lados = Number(match[2])
  return quantidade > 0 && lados > 0
}
