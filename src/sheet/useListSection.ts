import { useCallback, useEffect, useRef, useState } from 'react'
import { atualizarLinha, criarLinha, removerLinha } from '../api/sheets'
import type { SecaoLista } from '../api/types'
import type { SaveStatus } from './useSectionAutosave'

const DEBOUNCE_MS = 1000

/**
 * CRUD imediato de linha (criar/remover) + autosave debounced por linha para
 * edição de campo, para as seções de lista (Talentos, Ataques, Perícias,
 * Magias, Itens).
 */
export function useListSection<Item extends { id: string }>(
  fichaId: string,
  secao: SecaoLista,
  initialItems: Item[],
) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [statusById, setStatusById] = useState<Record<string, SaveStatus>>({})
  const [createError, setCreateError] = useState<string | null>(null)
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pending = useRef<Record<string, Partial<Item>>>({})

  const setStatus = useCallback((id: string, status: SaveStatus) => {
    setStatusById((prev) => ({ ...prev, [id]: status }))
  }, [])

  const addItem = useCallback(
    async (defaults: Partial<Item>) => {
      setCreateError(null)
      try {
        const created = await criarLinha<Item>(fichaId, secao, defaults)
        setItems((prev) => [...prev, created])
        return created
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : 'Não foi possível adicionar o item.')
        return undefined
      }
    },
    [fichaId, secao],
  )

  const removeItem = useCallback(
    async (id: string) => {
      setItems((current) => current.filter((i) => i.id !== id))
      await removerLinha(fichaId, secao, id)
    },
    [fichaId, secao],
  )

  const persistField = useCallback(
    (id: string, patch: Partial<Item>) => {
      setStatus(id, 'salvando')
      atualizarLinha<Item>(fichaId, secao, id, patch)
        .then(() => setStatus(id, 'salvo'))
        .catch(() => setStatus(id, 'erro'))
    },
    [fichaId, secao, setStatus],
  )

  const updateItemField = useCallback(
    <K extends keyof Item>(id: string, field: K, fieldValue: Item[K]) => {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: fieldValue } : item)))
      pending.current[id] = { ...pending.current[id], [field]: fieldValue }
      if (timers.current[id]) clearTimeout(timers.current[id])
      timers.current[id] = setTimeout(() => {
        const patch = pending.current[id]
        delete pending.current[id]
        if (patch) persistField(id, patch)
      }, DEBOUNCE_MS)
    },
    [persistField],
  )

  const retryItem = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id)
      if (item) persistField(id, item)
    },
    [items, persistField],
  )

  useEffect(() => {
    const timersMap = timers.current
    return () => {
      Object.values(timersMap).forEach((t) => clearTimeout(t))
    }
  }, [])

  return { items, addItem, removeItem, updateItemField, statusById, retryItem, createError }
}
