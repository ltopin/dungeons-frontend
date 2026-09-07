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
  campanhasMock.obterCampanha.mockResolvedValue({
    id: 'camp-1',
    nome: 'Campanha',
    role: 'jogador',
    fichaId: 'ficha-1',
  })
  fichasMock.obterFicha.mockResolvedValue(criarFichaFake())
})

const ABAS = ['Geral', 'Combate', 'Talentos', 'Ataques', 'Perícias', 'Magias', 'Inventário', 'Notas']

describe('editor de ficha', () => {
  it('carrega os dados da API antes de exibir os campos', async () => {
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText('Carregando ficha…')).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Aria Ventoclaro')).toBeInTheDocument()
  })

  it('exibe erro quando o carregamento falha, sem cair para um formulário vazio', async () => {
    fichasMock.obterFicha.mockRejectedValue(new Error('falhou'))

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar sua ficha.')
    expect(screen.queryByLabelText('Nome do personagem')).not.toBeInTheDocument()
  })

  it('não oferece nenhum controle de exportar/importar arquivo em nenhuma aba', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByDisplayValue('Aria Ventoclaro')

    for (const aba of ABAS) {
      await user.click(screen.getByRole('button', { name: aba }))
      expect(screen.queryByText(/exportar/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/importar/i)).not.toBeInTheDocument()
      expect(document.querySelector('input[type="file"]')).not.toBeInTheDocument()
    }
  })
})
