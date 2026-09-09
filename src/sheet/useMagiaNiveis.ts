import { useCallback, useEffect, useRef, useState } from 'react'
import { atualizarMagiaNiveis } from '../api/sheets'
import type { FichaMagiaNivel } from '../api/types'
import type { SaveStatus } from './useSectionAutosave'
import { clearSaveFailure, reportSaveFailure } from './saveAlerts'

const SAVE_ALERT_KEY = 'magia-niveis'

const DEBOUNCE_MS = 1000

/**
 * A API trata os níveis de magia como um bloco só (PATCH de todo o array),
 * não como linhas independentes — por isso um hook próprio em vez de
 * useListSection.
 */
export function useMagiaNiveis(
  fichaId: string,
  initial: FichaMagiaNivel[],
  /**
   * Chamado com a lista confirmada pela API após um save bem-sucedido, para
   * que o chamador (a página da ficha) possa manter sua própria cópia
   * sincronizada e sobreviver à desmontagem/remontagem da aba — ver
   * fix-character-sheet-tab-state-sync/design.md, decisão 1.
   */
  onSaved?: (items: FichaMagiaNivel[]) => void,
) {
  const [items, setItems] = useState<FichaMagiaNivel[]>(initial)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef<FichaMagiaNivel[] | null>(null)
  const onSavedRef = useRef(onSaved)
  onSavedRef.current = onSaved

  const save = useCallback(
    (niveis: FichaMagiaNivel[]) => {
      setStatus('salvando')
      atualizarMagiaNiveis(fichaId, niveis)
        .then((atualizados) => {
          setItems(atualizados)
          setStatus('salvo')
          clearSaveFailure(SAVE_ALERT_KEY)
          onSavedRef.current?.(atualizados)
        })
        .catch(() => {
          setStatus('erro')
          reportSaveFailure(SAVE_ALERT_KEY)
        })
    },
    [fichaId],
  )

  const scheduleSave = useCallback(
    (niveis: FichaMagiaNivel[]) => {
      pendingRef.current = niveis
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const toSave = pendingRef.current
        pendingRef.current = null
        if (toSave) save(toSave)
      }, DEBOUNCE_MS)
    },
    [save],
  )

  const updateEspacosPorDia = useCallback(
    (nivel: number, espacosPorDia: number | null) => {
      setItems((prev) => {
        const next = prev.map((n) => (n.nivel === nivel ? { ...n, espacosPorDia } : n))
        scheduleSave(next)
        return next
      })
    },
    [scheduleSave],
  )

  const retry = useCallback(() => {
    save(pendingRef.current ?? items)
    pendingRef.current = null
  }, [save, items])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (pendingRef.current) {
        save(pendingRef.current)
        pendingRef.current = null
      }
    },
    [save],
  )

  return { items, updateEspacosPorDia, status, retry }
}
