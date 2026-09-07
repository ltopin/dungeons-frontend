/**
 * Tradução entre o formato "de fio" da API (snake_case, nomes de seção e de
 * algumas siglas diferentes) e o formato usado no frontend (camelCase).
 * A API do dungeons-api não segue a mesma convenção de nomes do frontend;
 * esta é a única camada que conhece essa diferença.
 */
export type Json = Record<string, unknown>

// Pares onde a conversão mecânica snake_case -> camelCase não bate com o
// nome usado no frontend (abreviações diferentes, não só maiúsculas/minúsculas).
const ALIAS_TO_FRONTEND: Record<string, string> = {
  pv_maximo: 'pvMax',
  pv_temporario: 'pvTemp',
  fortitude_base: 'fortBase',
  fortitude_magico: 'fortMagico',
  fortitude_outros: 'fortOutros',
}

const ALIAS_TO_BACKEND: Record<string, string> = Object.fromEntries(
  Object.entries(ALIAS_TO_FRONTEND).map(([backend, frontend]) => [frontend, backend]),
)

const IGNORED_KEYS = new Set(['ficha_id', 'campanha_id', 'jogador_conta_id', 'created_at', 'updated_at'])

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}

export function mapObjectToFrontend<T>(raw: Json | null | undefined): T {
  const result: Json = {}
  if (raw) {
    for (const [key, value] of Object.entries(raw)) {
      if (IGNORED_KEYS.has(key)) continue
      result[ALIAS_TO_FRONTEND[key] ?? snakeToCamel(key)] = value
    }
  }
  return result as T
}

export function mapListToFrontend<T>(raw: unknown): T[] {
  return Array.isArray(raw) ? raw.map((item) => mapObjectToFrontend<T>(item as Json)) : []
}

export function mapPatchToBackend(patch: Json): Json {
  const result: Json = {}
  for (const [key, value] of Object.entries(patch)) {
    result[ALIAS_TO_BACKEND[key] ?? camelToSnake(key)] = value
  }
  return result
}
