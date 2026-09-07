import { vi } from 'vitest'
import * as accountsApi from '../api/accounts'
import { entrar } from '../auth/session'
import type { Conta } from '../api/types'

/**
 * Autentica uma sessão fake nos testes: mocka `login` e chama `entrar`,
 * assumindo que o arquivo de teste já chamou `vi.mock('../api/accounts')`.
 */
export async function autenticarComoContaFake(overrides: Partial<Conta> = {}): Promise<Conta> {
  const conta: Conta = {
    id: 'conta-1',
    nome: 'Conta Teste',
    email: 'conta-teste@example.com',
    criado_em: new Date().toISOString(),
    ...overrides,
  }
  vi.mocked(accountsApi).login.mockResolvedValue({ conta, token: 'token-fake' })
  await entrar(conta.email, 'senha-fake')
  return conta
}
