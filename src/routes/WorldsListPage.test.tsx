import { render, screen } from '@testing-library/react'
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

describe('WorldsListPage', () => {
  it('lista os mundos existentes com link para a gestão de cada um', async () => {
    worldsMock.listarMundos.mockResolvedValue([
      { id: 'mundo-1', nome: 'Forgotten Realms' },
      { id: 'mundo-2', nome: 'Eberron' },
    ])

    render(
      <MemoryRouter initialEntries={['/mundos']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('link', { name: 'Forgotten Realms' })).toHaveAttribute('href', '/mundos/mundo-1')
    expect(screen.getByRole('link', { name: 'Eberron' })).toHaveAttribute('href', '/mundos/mundo-2')
  })

  it('exibe o estado vazio quando o usuário não tem nenhum mundo', async () => {
    worldsMock.listarMundos.mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={['/mundos']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Você ainda não criou nenhum mundo.', { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Criar mundo' })).toBeInTheDocument()
  })
})
