import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { getContaAtual, sessaoCarregando, subscribeSessao } from './session'
import type { Conta } from '../api/types'

interface SessaoContextValue {
  conta: Conta | null
  carregando: boolean
}

const SessionContext = createContext<SessaoContextValue>({ conta: null, carregando: false })

export function SessionProvider({ children }: { children: ReactNode }) {
  const conta = useSyncExternalStore(subscribeSessao, getContaAtual, getContaAtual)
  const carregando = useSyncExternalStore(subscribeSessao, sessaoCarregando, sessaoCarregando)
  return <SessionContext.Provider value={{ conta, carregando }}>{children}</SessionContext.Provider>
}

export function useContaAtual(): Conta | null {
  return useContext(SessionContext).conta
}

export function useSessaoCarregando(): boolean {
  return useContext(SessionContext).carregando
}
