/**
 * Sessão baseada em token JWT (ver openspec/changes/user-authentication).
 * O token é persistido em localStorage (não sessionStorage: a expiração de
 * 60 dias combinada com a API pressupõe permanecer logado entre sessões do
 * navegador). Ao carregar o módulo, se existe um token salvo, ele é
 * revalidado contra GET /contas/me antes de a sessão ser considerada pronta.
 */

import { cadastrar as apiCadastrar, login as apiLogin, obterContaAtual } from '../api/accounts'
import type { Conta } from '../api/types'

const STORAGE_KEY = 'dnd.session'

interface SessaoConta {
  token: string
  conta: Conta
}

function readStorage(): SessaoConta | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SessaoConta) : null
  } catch {
    return null
  }
}

function writeStorage(sessao: SessaoConta | null): void {
  if (sessao) localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao))
  else localStorage.removeItem(STORAGE_KEY)
}

let current: SessaoConta | null = readStorage()
let carregando = current !== null
const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((l) => l())
}

export function getContaAtual(): Conta | null {
  return current?.conta ?? null
}

export function getToken(): string | null {
  return current?.token ?? null
}

export function sessaoCarregando(): boolean {
  return carregando
}

export async function cadastrar(nome: string, email: string, senha: string): Promise<Conta> {
  const resposta = await apiCadastrar(nome, email, senha)
  current = { token: resposta.token, conta: resposta.conta }
  writeStorage(current)
  notify()
  return resposta.conta
}

export async function entrar(email: string, senha: string): Promise<Conta> {
  const resposta = await apiLogin(email, senha)
  current = { token: resposta.token, conta: resposta.conta }
  writeStorage(current)
  notify()
  return resposta.conta
}

export function sairDaConta(): void {
  current = null
  writeStorage(null)
  notify()
}

export function subscribeSessao(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

async function rehydrate(): Promise<void> {
  if (!current) {
    carregando = false
    return
  }
  try {
    const conta = await obterContaAtual()
    current = { token: current.token, conta }
    writeStorage(current)
  } catch {
    current = null
    writeStorage(null)
  } finally {
    carregando = false
    notify()
  }
}

/** Exportado só para os testes aguardarem a reidratação terminar. */
export const sessaoPronta: Promise<void> = rehydrate()
