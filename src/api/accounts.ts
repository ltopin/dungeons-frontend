import { apiRequest } from './client'
import type { Conta } from './types'

export interface SessaoResposta {
  conta: Conta
  token: string
}

export function cadastrar(nome: string, email: string, senha: string): Promise<SessaoResposta> {
  return apiRequest<SessaoResposta>('/auth/cadastro', { method: 'POST', body: { nome, email, senha } })
}

export function login(email: string, senha: string): Promise<SessaoResposta> {
  return apiRequest<SessaoResposta>('/auth/login', { method: 'POST', body: { email, senha } })
}

export function obterContaAtual(): Promise<Conta> {
  return apiRequest<Conta>('/contas/me')
}
