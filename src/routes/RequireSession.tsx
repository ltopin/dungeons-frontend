import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useContaAtual, useSessaoCarregando } from '../auth/SessionContext'

export function RequireSession({ children }: { children: ReactNode }) {
  const conta = useContaAtual()
  const carregando = useSessaoCarregando()
  if (carregando) return <p>Carregando sessão…</p>
  if (!conta) return <Navigate to="/login" replace />
  return <>{children}</>
}
