import { useCallback, useEffect, useRef, useState } from 'react'
import { atualizarSecao } from '../api/sheets'
import type { SecaoUmParaUm } from '../api/types'
import { clearSaveFailure, reportSaveFailure } from './saveAlerts'

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
  /**
   * Campos calculados a partir de outras seções (ex: CMB/CMD dependem de
   * atributos da seção Geral). Recomputado a cada envio a partir do valor
   * mais recente, sem precisar de um estado "calculado pendente" separado
   * — ver design.md, decisão 2.
   */
  computeDerived?: (value: T) => Partial<T>,
  /**
   * Chamado com o valor confirmado pela API após um save bem-sucedido, para
   * que o chamador (a página da ficha) possa manter sua própria cópia
   * sincronizada e sobreviver à desmontagem/remontagem da aba — ver
   * fix-character-sheet-tab-state-sync/design.md, decisão 1 e 3.
   */
  onSaved?: (value: T) => void,
) {
  const [value, setValue] = useState<T>(initial)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef<Partial<T> | null>(null)
  const computeDerivedRef = useRef(computeDerived)
  computeDerivedRef.current = computeDerived
  const onSavedRef = useRef(onSaved)
  onSavedRef.current = onSaved

  const save = useCallback(
    (patch: Partial<T>): Promise<T> => {
      setStatus('salvando')
      const derived = computeDerivedRef.current ? computeDerivedRef.current(patch as T) : undefined
      return atualizarSecao<T>(fichaId, secao, derived ? { ...patch, ...derived } : patch)
        .then((saved) => {
          setStatus('salvo')
          clearSaveFailure(secao)
          onSavedRef.current?.(saved)
          return saved
        })
        .catch((err) => {
          setStatus('erro')
          reportSaveFailure(secao)
          throw err
        })
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
        if (toSave) save(toSave).catch(() => {})
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
    save(pendingRef.current ?? value).catch(() => {})
    pendingRef.current = null
  }, [save, value])

  const flush = useCallback((): Promise<T> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const pending = pendingRef.current
    pendingRef.current = null
    if (!pending) return Promise.resolve(value)
    return save(pending)
  }, [save, value])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (pendingRef.current) {
        save(pendingRef.current).catch(() => {})
        pendingRef.current = null
      }
    },
    [save],
  )

  return { value, updateField, status, retry, flush }
}
