import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { sairDaConta } from '../auth/session'
import * as campaignsApi from '../api/campaigns'
import { autenticarComoContaFake } from '../test/session'

vi.mock('../api/accounts')
vi.mock('../api/campaigns')
vi.mock('../api/sheets')

const campanhasMock = vi.mocked(campaignsApi)

beforeEach(async () => {
  sairDaConta()
  await autenticarComoContaFake()
  vi.clearAllMocks()
})

describe('dashboard do mestre — abas de fichas', () => {
  it('mostra uma aba por ficha, rotulada com personagem e jogador', async () => {
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Campanha do Mestre', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([
      { id: 'ficha-1', contaId: 'conta-2', nomePersonagem: 'Aria', classe: 'Ladina', nivel: 3, nomeJogador: 'Fulano' },
      { id: 'ficha-2', contaId: 'conta-3', nomePersonagem: 'Thoromir', classe: 'Guerreiro', nivel: 5 },
    ])

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('link', { name: /Aria — Fulano/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Thoromir/ })).toBeInTheDocument()
  })

  it('campanha sem fichas mostra o estado vazio, sem abas', async () => {
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Campanha do Mestre', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Nenhum jogador entrou nesta campanha ainda.', { exact: false })).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
