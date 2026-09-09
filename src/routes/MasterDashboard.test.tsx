import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { sairDaConta } from '../auth/session'
import * as campaignsApi from '../api/campaigns'
import * as worldsApi from '../api/worlds'
import * as realtimeApi from '../realtime/useCampaignEvents'
import { autenticarComoContaFake } from '../test/session'

vi.mock('../api/accounts')
vi.mock('../api/campaigns')
vi.mock('../api/sheets')
vi.mock('../api/worlds')
vi.mock('../realtime/useCampaignEvents')

const campanhasMock = vi.mocked(campaignsApi)
const worldsMock = vi.mocked(worldsApi)
const realtimeMock = vi.mocked(realtimeApi)

beforeEach(async () => {
  sairDaConta()
  await autenticarComoContaFake()
  vi.clearAllMocks()
  worldsMock.listarMundos.mockResolvedValue([])
  realtimeMock.useCampaignEvents.mockReturnValue({
    eventos: [],
    status: 'conectado',
    emitirRolagem: vi.fn().mockResolvedValue({}),
    pedirRolagem: vi.fn().mockResolvedValue({}),
    reconectar: vi.fn(),
    rodada: null,
    enviarResumoRodada: vi.fn(),
    fecharRodada: vi.fn(),
  })
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

describe('eventos de mesa — controle de pedido de rolagem (mestre)', () => {
  it('mostra o controle de pedir rolagem, listando os jogadores da campanha', async () => {
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Campanha do Mestre', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([
      { id: 'ficha-1', contaId: 'conta-2', nomePersonagem: 'Aria', classe: 'Ladina', nivel: 3, nomeJogador: 'Fulano' },
    ])

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: 'Pedir rolagem' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Fulano' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Toda a mesa' })).toBeInTheDocument()
  })

  it('pede rolagem a um jogador específico selecionado', async () => {
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Campanha do Mestre', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([
      { id: 'ficha-1', contaId: 'conta-2', nomePersonagem: 'Aria', classe: 'Ladina', nivel: 3, nomeJogador: 'Fulano' },
    ])
    const pedirRolagem = vi.fn().mockResolvedValue({})
    realtimeMock.useCampaignEvents.mockReturnValue({
      eventos: [],
      status: 'conectado',
      emitirRolagem: vi.fn(),
      pedirRolagem,
      reconectar: vi.fn(),
      rodada: null,
      enviarResumoRodada: vi.fn(),
      fecharRodada: vi.fn(),
    })

    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByRole('button', { name: 'Pedir rolagem' })

    await user.selectOptions(screen.getByLabelText('Jogador'), 'conta-2')
    await user.type(screen.getByLabelText('Descrição'), 'Teste de Reflexos CD 15')
    await user.click(screen.getByRole('button', { name: 'Pedir rolagem' }))

    expect(pedirRolagem).toHaveBeenCalledWith({
      destinatarioContaId: 'conta-2',
      descricao: 'Teste de Reflexos CD 15',
    })
  })

  it('pede rolagem a toda a mesa quando nenhum jogador é selecionado', async () => {
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Campanha do Mestre', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([
      { id: 'ficha-1', contaId: 'conta-2', nomePersonagem: 'Aria', classe: 'Ladina', nivel: 3, nomeJogador: 'Fulano' },
    ])
    const pedirRolagem = vi.fn().mockResolvedValue({})
    realtimeMock.useCampaignEvents.mockReturnValue({
      eventos: [],
      status: 'conectado',
      emitirRolagem: vi.fn(),
      pedirRolagem,
      reconectar: vi.fn(),
      rodada: null,
      enviarResumoRodada: vi.fn(),
      fecharRodada: vi.fn(),
    })

    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByRole('button', { name: 'Pedir rolagem' })

    await user.type(screen.getByLabelText('Descrição'), 'Teste de Percepção')
    await user.click(screen.getByRole('button', { name: 'Pedir rolagem' }))

    expect(pedirRolagem).toHaveBeenCalledWith({ destinatarioContaId: undefined, descricao: 'Teste de Percepção' })
  })

  it('painel de eventos indica indisponível sem impedir o uso do dashboard', async () => {
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Campanha do Mestre', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([])
    realtimeMock.useCampaignEvents.mockReturnValue({
      eventos: [],
      status: 'indisponivel',
      emitirRolagem: vi.fn(),
      pedirRolagem: vi.fn(),
      reconectar: vi.fn(),
      rodada: null,
      enviarResumoRodada: vi.fn(),
      fecharRodada: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Campanha do Mestre')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Conexão em tempo real indisponível.')
  })
})

describe('vínculo de mundo à campanha', () => {
  it('exibe a ação de vincular mundo quando a campanha não tem nenhum, e some o link de história', async () => {
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Campanha do Mestre', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([])
    worldsMock.listarMundos.mockResolvedValue([{ id: 'mundo-1', nome: 'Forgotten Realms' }])

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Nenhum mundo vinculado a esta campanha ainda.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vincular mundo' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ver história da campanha' })).not.toBeInTheDocument()
  })

  it('vincula o mundo escolhido e passa a exibir o link de história', async () => {
    const user = userEvent.setup()
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Campanha do Mestre', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([])
    worldsMock.listarMundos.mockResolvedValue([{ id: 'mundo-1', nome: 'Forgotten Realms' }])
    campanhasMock.vincularMundoACampanha.mockResolvedValue({
      id: 'camp-1',
      nome: 'Campanha do Mestre',
      role: 'mestre',
      mundoId: 'mundo-1',
    })

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <App />
      </MemoryRouter>,
    )

    await user.selectOptions(await screen.findByLabelText('Escolher mundo'), 'mundo-1')
    await user.click(screen.getByRole('button', { name: 'Vincular mundo' }))

    expect(campanhasMock.vincularMundoACampanha).toHaveBeenCalledWith('camp-1', 'mundo-1')
    expect(await screen.findByRole('link', { name: 'Forgotten Realms' })).toHaveAttribute('href', '/mundos/mundo-1')
    expect(screen.getByRole('link', { name: 'Ver história da campanha' })).toHaveAttribute(
      'href',
      '/campanhas/camp-1/historia',
    )
  })

  it('permite trocar o mundo já vinculado por outro', async () => {
    const user = userEvent.setup()
    campanhasMock.obterCampanha.mockResolvedValue({
      id: 'camp-1',
      nome: 'Campanha do Mestre',
      role: 'mestre',
      mundoId: 'mundo-1',
    })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([])
    worldsMock.listarMundos.mockResolvedValue([
      { id: 'mundo-1', nome: 'Forgotten Realms' },
      { id: 'mundo-2', nome: 'Eberron' },
    ])
    campanhasMock.vincularMundoACampanha.mockResolvedValue({
      id: 'camp-1',
      nome: 'Campanha do Mestre',
      role: 'mestre',
      mundoId: 'mundo-2',
    })

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: 'Trocar mundo' })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Escolher mundo'), 'mundo-2')
    await user.click(screen.getByRole('button', { name: 'Trocar mundo' }))

    expect(campanhasMock.vincularMundoACampanha).toHaveBeenCalledWith('camp-1', 'mundo-2')
    expect(await screen.findByRole('link', { name: 'Eberron' })).toBeInTheDocument()
  })
})
