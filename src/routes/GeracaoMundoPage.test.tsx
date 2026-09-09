import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { sairDaConta } from '../auth/session'
import * as aiMasterApi from '../api/aiMaster'
import * as campaignsApi from '../api/campaigns'
import * as sheetsApi from '../api/sheets'
import { criarFichaFake } from '../test/fixtures'
import { autenticarComoContaFake } from '../test/session'

vi.mock('../api/accounts')
vi.mock('../api/aiMaster')
vi.mock('../api/campaigns')
vi.mock('../api/sheets')

const aiMasterMock = vi.mocked(aiMasterApi)
const campanhasMock = vi.mocked(campaignsApi)
const fichasMock = vi.mocked(sheetsApi)

beforeEach(async () => {
  sairDaConta()
  await autenticarComoContaFake()
  vi.clearAllMocks()
})

describe('acompanhamento da geração de mundo por IA', () => {
  it('exibe o estado de carregamento enquanto a geração está pendente/em andamento', async () => {
    aiMasterMock.consultarStatusGeracaoMundo.mockResolvedValue({ id: 'geracao-1', status: 'em_andamento' })

    render(
      <MemoryRouter initialEntries={['/campanhas/nova-ia/geracao-1']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Gerando seu mundo…')).toBeInTheDocument()
  })

  it('exibe uma mensagem de erro sem navegar quando a geração falha', async () => {
    aiMasterMock.consultarStatusGeracaoMundo.mockResolvedValue({
      id: 'geracao-1',
      status: 'erro',
      erro: 'A IA não conseguiu gerar o mundo.',
    })

    render(
      <MemoryRouter initialEntries={['/campanhas/nova-ia/geracao-1']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('A IA não conseguiu gerar o mundo.')
  })

  it('ao concluir, mostra a escolha de papel e entra como jogador chamando a geração concluída', async () => {
    aiMasterMock.consultarStatusGeracaoMundo.mockResolvedValue({
      id: 'geracao-1',
      status: 'concluida',
      campanhaId: 'camp-ia-1',
    })
    aiMasterMock.entrarComoJogadorAposGeracao.mockResolvedValue({ campanhaId: 'camp-ia-1', fichaId: 'ficha-1' })
    campanhasMock.obterCampanha.mockResolvedValue({
      id: 'camp-ia-1',
      nome: 'Mundo Novo',
      role: 'jogador',
      fichaId: 'ficha-1',
    })
    fichasMock.obterFicha.mockResolvedValue(criarFichaFake({ id: 'ficha-1' }))

    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/nova-ia/geracao-1']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Entrar como jogador' }))

    expect(aiMasterMock.entrarComoJogadorAposGeracao).toHaveBeenCalledWith('geracao-1')
    expect(await screen.findByRole('heading', { name: 'Geral' })).toBeInTheDocument()
  })
})
