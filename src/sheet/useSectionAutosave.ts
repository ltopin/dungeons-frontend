import { useCallback, useEffect, useRef, useState } from 'react'
import { atualizarSecao } from '../api/sheets'
import type { SecaoUmParaUm } from '../api/types'

export type SaveStatus = 'idle' | 'salvando' | 'salvo' | 'erro'

const DEBOUNCE_MS = 1000

/**
 * Autosave debounced para uma seção 1:1 da ficha (Geral, Combate,
 * Magias-config, Moedas, Notas). Mantém o estado local como fonte de verdade
 * para digitação imediata; o debounce só controla quando o PATCH acontece.
 */
export function useSectionAutosave<T extends object>(
  fichaId: string,
  secao: SecaoUmParaUm,
  initial: T,
) {
  const [value, setValue] = useState<T>(initial)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef<Partial<T> | null>(null)

  const save = useCallback(
    (patch: Partial<T>) => {
      setStatus('salvando')
      atualizarSecao<T>(fichaId, secao, patch)
        .then(() => setStatus('salvo'))
        .catch(() => setStatus('erro'))
    },
    [fichaId, secao],
  )

  const scheduleSave = useCallback(
    (patch: Partial<T>) => {
      pendingRef.current = patch
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const toSave = pendingRef.current
        pendingRef.current = null
        if (toSave) save(toSave)
      }, DEBOUNCE_MS)
    },
    [save],
  )

  const updateField = useCallback(
    <K extends keyof T>(field: K, fieldValue: T[K]) => {
      setValue((prev) => {
        const next = { ...prev, [field]: fieldValue }
        scheduleSave(next)
        return next
      })
    },
    [scheduleSave],
  )

  const retry = useCallback(() => {
    save(pendingRef.current ?? value)
    pendingRef.current = null
  }, [save, value])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  return { value, updateField, status, retry }
}
