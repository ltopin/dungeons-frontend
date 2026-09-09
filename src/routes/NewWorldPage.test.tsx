import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { sairDaConta } from '../auth/session'
import * as worldsApi from '../api/worlds'
import { autenticarComoContaFake } from '../test/session'

vi.mock('../api/accounts')
vi.mock('../api/worlds')

const worldsMock = vi.mocked(worldsApi)

beforeEach(async () => {
  sairDaConta()
  await autenticarComoContaFake()
  vi.clearAllMocks()
})

describe('NewWorldPage', () => {
  it('cria o mundo com um nome válido e navega para a gestão do mundo criado', async () => {
    const user = userEvent.setup()
    worldsMock.criarMundo.mockResolvedValue({ id: 'mundo-1', nome: 'Forgotten Realms' })
    worldsMock.listarElementosDoMundo.mockResolvedValue([])
    worldsMock.listarMundos.mockResolvedValue([{ id: 'mundo-1', nome: 'Forgotten Realms' }])

    render(
      <MemoryRouter initialEntries={['/mundos/novo']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Nome do mundo'), 'Forgotten Realms')
    await user.click(screen.getByRole('button', { name: 'Criar mundo' }))

    expect(worldsMock.criarMundo).toHaveBeenCalledWith('Forgotten Realms')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Forgotten Realms' })).toBeInTheDocument())
  })

  it('bloqueia o envio quando o nome está vazio', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/mundos/novo']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Criar mundo' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('obrigatório')
    expect(worldsMock.criarMundo).not.toHaveBeenCalled()
  })
})
