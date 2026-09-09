import { useCallback, useEffect, useRef, useState } from 'react'
import { atualizarLinha, criarLinha, removerLinha } from '../api/sheets'
import type { SecaoLista } from '../api/types'
import type { SaveStatus } from './useSectionAutosave'
import { clearSaveFailure, reportSaveFailure } from './saveAlerts'

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
  /**
   * Campos calculados a partir do restante do item (ex: total de perícia).
   * Recomputado a partir do estado mais recente da linha a cada criação ou
   * envio de edição — ver design.md, decisão 2.
   */
  computeDerived?: (item: Item) => Partial<Item>,
  /**
   * Chamado com a lista atualizada após criar, remover ou salvar a edição de
   * uma linha, para que o chamador (a página da ficha) possa manter sua
   * própria cópia sincronizada e sobreviver à desmontagem/remontagem da aba
   * — ver fix-character-sheet-tab-state-sync/design.md, decisão 1.
   */
  onItemsChange?: (items: Item[]) => void,
) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [statusById, setStatusById] = useState<Record<string, SaveStatus>>({})
  const [createError, setCreateError] = useState<string | null>(null)
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pending = useRef<Record<string, Partial<Item>>>({})
  const computeDerivedRef = useRef(computeDerived)
  computeDerivedRef.current = computeDerived
  const itemsRef = useRef(items)
  itemsRef.current = items
  const onItemsChangeRef = useRef(onItemsChange)
  onItemsChangeRef.current = onItemsChange

  const setStatus = useCallback((id: string, status: SaveStatus) => {
    setStatusById((prev) => ({ ...prev, [id]: status }))
  }, [])

  const addItem = useCallback(
    async (defaults: Partial<Item>) => {
      setCreateError(null)
      try {
        const derived = computeDerivedRef.current ? computeDerivedRef.current(defaults as Item) : undefined
        const created = await criarLinha<Item>(fichaId, secao, derived ? { ...defaults, ...derived } : defaults)
        setItems((prev) => {
          const next = [...prev, created]
          onItemsChangeRef.current?.(next)
          return next
        })
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
      setItems((current) => {
        const next = current.filter((i) => i.id !== id)
        onItemsChangeRef.current?.(next)
        return next
      })
      clearSaveFailure(`${secao}:${id}`)
      await removerLinha(fichaId, secao, id)
    },
    [fichaId, secao],
  )

  const persistField = useCallback(
    (id: string, patch: Partial<Item>): Promise<void> => {
      setStatus(id, 'salvando')
      const current = itemsRef.current.find((i) => i.id === id)
      const merged = current ? { ...current, ...patch } : (patch as Item)
      const derived = computeDerivedRef.current ? computeDerivedRef.current(merged) : undefined
      const toSend = derived ? { ...patch, ...derived } : patch
      return atualizarLinha<Item>(fichaId, secao, id, toSend)
        .then(() => {
          setStatus(id, 'salvo')
          clearSaveFailure(`${secao}:${id}`)
          onItemsChangeRef.current?.(itemsRef.current)
        })
        .catch((err) => {
          setStatus(id, 'erro')
          reportSaveFailure(`${secao}:${id}`)
          throw err
        })
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
        if (patch) persistField(id, patch).catch(() => {})
      }, DEBOUNCE_MS)
    },
    [persistField],
  )

  const retryItem = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id)
      if (item) persistField(id, item).catch(() => {})
    },
    [items, persistField],
  )

  const flushAll = useCallback((): Promise<Item[]> => {
    const ids = Object.keys(timers.current)
    if (ids.length === 0) return Promise.resolve(itemsRef.current)
    const envios = ids.map((id) => {
      clearTimeout(timers.current[id])
      delete timers.current[id]
      const patch = pending.current[id]
      delete pending.current[id]
      return patch ? persistField(id, patch) : Promise.resolve()
    })
    return Promise.all(envios).then(() => itemsRef.current)
  }, [persistField])

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((t) => clearTimeout(t))
      Object.entries(pending.current).forEach(([id, patch]) => persistField(id, patch).catch(() => {}))
      pending.current = {}
    }
  }, [persistField])

  return { items, addItem, removeItem, updateItemField, statusById, retryItem, createError, flushAll }
}
