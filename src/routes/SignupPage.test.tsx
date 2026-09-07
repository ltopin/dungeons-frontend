import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { getContaAtual, sairDaConta } from '../auth/session'
import { ApiError } from '../api/client'
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

describe('cadastro', () => {
  it('cadastra com nome, e-mail e senha e navega para /campanhas', async () => {
    const user = userEvent.setup()
    contasMock.cadastrar.mockResolvedValue({
      conta: {
        id: 'conta-nova',
        nome: 'Jogador Novo',
        email: 'novo@example.com',
        criado_em: new Date().toISOString(),
      },
      token: 'token-novo',
    })

    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Nome'), 'Jogador Novo')
    await user.type(screen.getByLabelText('E-mail'), 'novo@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-secreta')
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Suas campanhas' })).toBeInTheDocument())

    expect(contasMock.cadastrar).toHaveBeenCalledWith('Jogador Novo', 'novo@example.com', 'senha-secreta')
    expect(getContaAtual()?.id).toBe('conta-nova')
  })

  it('exibe erro de e-mail duplicado e mantém nome e e-mail digitados', async () => {
    const user = userEvent.setup()
    contasMock.cadastrar.mockRejectedValue(new ApiError(409, 'E-mail já cadastrado'))

    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Nome'), 'Jogador Novo')
    await user.type(screen.getByLabelText('E-mail'), 'repetido@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-secreta')
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Este e-mail já está cadastrado.')
    expect(getContaAtual()).toBeNull()
    expect(screen.getByLabelText('Nome')).toHaveValue('Jogador Novo')
    expect(screen.getByLabelText('E-mail')).toHaveValue('repetido@example.com')
  })
})
