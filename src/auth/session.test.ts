import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as accountsApi from '../api/accounts'
import type { Conta } from '../api/types'

vi.mock('../api/accounts')
const contasMock = vi.mocked(accountsApi)

const STORAGE_KEY = 'dnd.session'

function salvarSessao(token: string) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token,
      conta: { id: 'conta-1', nome: 'Conta Teste', email: 'teste@example.com', criado_em: new Date().toISOString() },
    }),
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.resetModules()
})

describe('reidratação de sessão', () => {
  it('mantém a sessão quando o token salvo ainda é válido', async () => {
    salvarSessao('token-valido')
    contasMock.obterContaAtual.mockResolvedValue({
      id: 'conta-1',
      nome: 'Conta Teste',
      email: 'teste@example.com',
      criado_em: new Date().toISOString(),
    })

    const session = await import('./session')
    await session.sessaoPronta

    expect(session.sessaoCarregando()).toBe(false)
    expect(session.getContaAtual()?.id).toBe('conta-1')
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('limpa a sessão e exige novo login quando o token salvo é inválido', async () => {
    salvarSessao('token-invalido')
    contasMock.obterContaAtual.mockRejectedValue(new Error('401'))

    const session = await import('./session')
    await session.sessaoPronta

    expect(session.sessaoCarregando()).toBe(false)
    expect(session.getContaAtual()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('expõe carregando=true enquanto a reidratação está pendente', async () => {
    salvarSessao('token-valido')
    let resolver: (conta: Conta) => void = () => {}
    contasMock.obterContaAtual.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolver = resolve
        }),
    )

    const session = await import('./session')
    expect(session.sessaoCarregando()).toBe(true)

    resolver({ id: 'conta-1', nome: 'Conta Teste', email: 'teste@example.com', criado_em: new Date().toISOString() })
    await session.sessaoPronta

    expect(session.sessaoCarregando()).toBe(false)
  })

  it('não chama a API quando não há token salvo', async () => {
    const session = await import('./session')
    expect(session.sessaoCarregando()).toBe(false)
    await session.sessaoPronta

    expect(contasMock.obterContaAtual).not.toHaveBeenCalled()
    expect(session.getContaAtual()).toBeNull()
  })
})
