import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { getContaAtual, sairDaConta } from '../auth/session'
import * as accountsApi from '../api/accounts'
import * as campaignsApi from '../api/campaigns'

vi.mock('../api/accounts')
vi.mock('../api/campaigns')

const contasMock = vi.mocked(accountsApi)
const campanhasMock = vi.mocked(campaignsApi)

beforeEach(() => {
  sairDaConta()
  vi.clearAllMocks()
  campanhasMock.listarCampanhas.mockResolvedValue([])
  campanhasMock.listarCampanhasAbertas.mockResolvedValue([])
})

describe('login', () => {
  it('entra com e-mail e senha e navega para /campanhas', async () => {
    const user = userEvent.setup()
    contasMock.login.mockResolvedValue({
      conta: {
        id: '507f1f77bcf86cd799439011',
        nome: 'Mestre Teste',
        email: 'mestre@example.com',
        criado_em: new Date().toISOString(),
      },
      token: 'token-123',
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('E-mail'), 'mestre@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-secreta')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Suas campanhas' })).toBeInTheDocument())

    expect(contasMock.login).toHaveBeenCalledWith('mestre@example.com', 'senha-secreta')
    expect(getContaAtual()?.id).toBe('507f1f77bcf86cd799439011')
  })

  it('exibe um erro genérico e não navega quando as credenciais são rejeitadas', async () => {
    const user = userEvent.setup()
    contasMock.login.mockRejectedValue(new Error('credenciais inválidas'))

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('E-mail'), 'mestre@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
    expect(getContaAtual()).toBeNull()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })
})
