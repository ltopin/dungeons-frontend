/**
 * Registro global de falhas de autosave, independente de qual aba está
 * montada no momento. Um `useSectionAutosave`/`useListSection` guarda seu
 * status de erro em estado local, que se perde ao trocar de aba (o
 * componente desmonta antes do save pendente terminar) — por isso essa
 * falha some sem nenhum indício visível. Este módulo dá à página um lugar
 * estável para acumular "o que falhou", sobrevivendo à troca de abas.
 */

export type SaveAlertListener = (failedKeys: string[]) => void

const failedKeys = new Set<string>()
const listeners = new Set<SaveAlertListener>()

function notify() {
  const snapshot = Array.from(failedKeys)
  listeners.forEach((listener) => listener(snapshot))
}

export function reportSaveFailure(key: string) {
  if (!failedKeys.has(key)) {
    failedKeys.add(key)
    notify()
  }
}

export function clearSaveFailure(key: string) {
  if (failedKeys.delete(key)) {
    notify()
  }
}

export function subscribeSaveAlerts(listener: SaveAlertListener): () => void {
  listeners.add(listener)
  listener(Array.from(failedKeys))
  return () => listeners.delete(listener)
}
