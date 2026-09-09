import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { sairDaConta } from '../auth/session'
import * as aiMasterApi from '../api/aiMaster'
import * as campaignsApi from '../api/campaigns'
import { autenticarComoContaFake } from '../test/session'

vi.mock('../api/accounts')
vi.mock('../api/aiMaster')
vi.mock('../api/campaigns')

const aiMasterMock = vi.mocked(aiMasterApi)
const campanhasMock = vi.mocked(campaignsApi)

beforeEach(async () => {
  sairDaConta()
  await autenticarComoContaFake()
  vi.clearAllMocks()
})

describe('wizard de criação de mundo por IA', () => {
  it('bloqueia avanço com campo obrigatório vazio e libera ao preencher', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/nova-ia']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: 'Confirmar gênero e tom' })).toBeDisabled()
    await user.type(screen.getByLabelText('Gênero e tom'), 'Fantasia sombria')
    expect(screen.getByRole('button', { name: 'Confirmar gênero e tom' })).toBeEnabled()
  })

  it('navega livremente entre etapas pela barra lateral, preservando o que já foi preenchido', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/nova-ia']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(await screen.findByLabelText('Gênero e tom'), 'Fantasia sombria')
    await user.click(screen.getByRole('button', { name: /Tamanho do Grupo/ }))
    await user.type(screen.getByLabelText('Número de jogadores'), '4')

    await user.click(screen.getByRole('button', { name: /Gênero e Tom/ }))
    expect(screen.getByLabelText('Gênero e tom')).toHaveValue('Fantasia sombria')

    await user.click(screen.getByRole('button', { name: /Tamanho do Grupo/ }))
    expect(screen.getByLabelText('Número de jogadores')).toHaveValue(4)
  })

  it('percorre o wizard completo, dispara a geração ao concluir e mostra o acompanhamento', async () => {
    aiMasterMock.iniciarGeracaoMundo.mockResolvedValue({ campanhaId: 'camp-ia-1' })
    campanhasMock.obterCampanha.mockResolvedValue({
      id: 'camp-ia-1',
      nome: 'Mundo Novo',
      role: 'aguardando-papel',
      mestre: 'ia',
      statusGeracaoMundo: 'gerando',
    })

    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/nova-ia']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(await screen.findByLabelText('Gênero e tom'), 'Fantasia sombria e tom sério')
    await user.click(screen.getByRole('button', { name: 'Confirmar gênero e tom' }))

    await user.click(await screen.findByRole('button', { name: /Padrão/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar nível de poder' }))

    await user.click(await screen.findByLabelText('Sem restrições especiais'))
    await user.click(screen.getByRole('button', { name: 'Confirmar restrições' }))

    await user.type(await screen.findByLabelText('Número de jogadores'), '4')
    await user.click(screen.getByRole('button', { name: 'Confirmar tamanho do grupo' }))

    await user.click(await screen.findByRole('button', { name: 'Confirmar e gerar mundo' }))

    expect(aiMasterMock.iniciarGeracaoMundo).toHaveBeenCalledWith({
      generoTom: 'Fantasia sombria e tom sério',
      nivelPoder: 'padrao',
      restricoesConteudo: 'Nenhuma restrição informada.',
      tamanhoGrupo: 4,
      inspiracoes: undefined,
      idioma: undefined,
      nomeMundo: undefined,
    })

    expect(await screen.findByText('Gerando seu mundo…')).toBeInTheDocument()
  })
})
