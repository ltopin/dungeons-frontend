import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { sairDaConta } from '../auth/session'
import * as campaignsApi from '../api/campaigns'
import * as sheetsApi from '../api/sheets'
import { criarFichaFake } from '../test/fixtures'
import { autenticarComoContaFake } from '../test/session'

vi.mock('../api/accounts')
vi.mock('../api/campaigns')
vi.mock('../api/sheets')

const campanhasMock = vi.mocked(campaignsApi)
const fichasMock = vi.mocked(sheetsApi)

beforeEach(async () => {
  sairDaConta()
  await autenticarComoContaFake()
  vi.clearAllMocks()
})

describe('roteamento condicional por papel', () => {
  it('mestre acessando /campanhas/:id vê o dashboard', async () => {
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Campanha do Mestre', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Campanha do Mestre' })).toBeInTheDocument()
    expect(screen.getByText('Fichas')).toBeInTheDocument()
  })

  it('jogador acessando /campanhas/:id é redirecionado para sua ficha', async () => {
    campanhasMock.obterCampanha.mockResolvedValue({
      id: 'camp-2',
      nome: 'Campanha do Jogador',
      role: 'jogador',
      fichaId: 'ficha-2',
    })
    fichasMock.obterFicha.mockResolvedValue(criarFichaFake({ id: 'ficha-2' }))

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-2']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Geral' })).toBeInTheDocument()
    expect(screen.queryByText('Fichas')).not.toBeInTheDocument()
  })

  it('mestre abre a ficha de um jogador em modo somente leitura, sem nenhum input editável', async () => {
    const user = userEvent.setup()
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Campanha do Mestre', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([
      { id: 'ficha-1', contaId: 'conta-2', nomePersonagem: 'Aria', classe: 'Ladina', nivel: 3, nomeJogador: 'Fulano' },
    ])
    fichasMock.obterFicha.mockResolvedValue(criarFichaFake({ id: 'ficha-1' }))

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('link', { name: /Aria — Fulano/ }))

    expect(await screen.findByRole('heading', { name: 'Geral' })).toBeInTheDocument()
    expect(screen.getByText('Aria Ventoclaro')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Talentos' }))
    expect(screen.getByText('Ataque Furtivo')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Adicionar/ })).not.toBeInTheDocument()
  })
})
