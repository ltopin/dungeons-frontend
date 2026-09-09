import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { sairDaConta } from '../auth/session'
import * as campaignsApi from '../api/campaigns'
import * as sheetsApi from '../api/sheets'
import * as worldsApi from '../api/worlds'
import { criarFichaFake } from '../test/fixtures'
import { autenticarComoContaFake } from '../test/session'

vi.mock('../api/accounts')
vi.mock('../api/campaigns')
vi.mock('../api/sheets')
vi.mock('../api/worlds')

const campanhasMock = vi.mocked(campaignsApi)
const fichasMock = vi.mocked(sheetsApi)
const worldsMock = vi.mocked(worldsApi)

beforeEach(async () => {
  sairDaConta()
  await autenticarComoContaFake({ nome: 'Mestre Teste' })
  vi.clearAllMocks()
  worldsMock.listarMundos.mockResolvedValue([])
})

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  )
}

describe('criar campanha', () => {
  it('navega para a campanha criada ao informar um nome válido', async () => {
    const user = userEvent.setup()
    campanhasMock.criarCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Minas de Phandelver', role: 'mestre' })
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Minas de Phandelver', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([])

    renderApp('/campanhas/nova')

    await user.type(screen.getByLabelText('Nome da campanha'), 'Minas de Phandelver')
    await user.click(screen.getByRole('button', { name: 'Criar campanha' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Minas de Phandelver' })).toBeInTheDocument())
  })

  it('impede o envio quando o nome está vazio', async () => {
    const user = userEvent.setup()
    renderApp('/campanhas/nova')

    await user.click(screen.getByRole('button', { name: 'Criar campanha' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('obrigatório')
    expect(campanhasMock.criarCampanha).not.toHaveBeenCalled()
  })
})

describe('seletor de mundo ao criar campanha', () => {
  it('omite o seletor quando o usuário não tem nenhum mundo', async () => {
    worldsMock.listarMundos.mockResolvedValue([])
    renderApp('/campanhas/nova')

    await screen.findByLabelText('Nome da campanha')
    expect(screen.queryByLabelText('Mundo desta campanha')).not.toBeInTheDocument()
  })

  it('envia o mundoId escolhido ao criar a campanha', async () => {
    const user = userEvent.setup()
    worldsMock.listarMundos.mockResolvedValue([{ id: 'mundo-1', nome: 'Forgotten Realms' }])
    campanhasMock.criarCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Minas de Phandelver', role: 'mestre' })
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Minas de Phandelver', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([])

    renderApp('/campanhas/nova')

    await user.type(screen.getByLabelText('Nome da campanha'), 'Minas de Phandelver')
    await user.selectOptions(await screen.findByLabelText('Mundo desta campanha'), 'mundo-1')
    await user.click(screen.getByRole('button', { name: 'Criar campanha' }))

    await waitFor(() =>
      expect(campanhasMock.criarCampanha).toHaveBeenCalledWith('Minas de Phandelver', undefined, 'mundo-1'),
    )
  })

  it('cria normalmente sem selecionar nenhum mundo', async () => {
    const user = userEvent.setup()
    worldsMock.listarMundos.mockResolvedValue([{ id: 'mundo-1', nome: 'Forgotten Realms' }])
    campanhasMock.criarCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Minas de Phandelver', role: 'mestre' })
    campanhasMock.obterCampanha.mockResolvedValue({ id: 'camp-1', nome: 'Minas de Phandelver', role: 'mestre' })
    campanhasMock.listarFichasDaCampanha.mockResolvedValue([])

    renderApp('/campanhas/nova')

    await user.type(screen.getByLabelText('Nome da campanha'), 'Minas de Phandelver')
    await screen.findByLabelText('Mundo desta campanha')
    await user.click(screen.getByRole('button', { name: 'Criar campanha' }))

    await waitFor(() =>
      expect(campanhasMock.criarCampanha).toHaveBeenCalledWith('Minas de Phandelver', undefined, undefined),
    )
  })
})

describe('campanhas abertas', () => {
  it('lista as campanhas abertas com mestre e descrição, e navega até a ficha ao entrar', async () => {
    const user = userEvent.setup()
    campanhasMock.listarCampanhas.mockResolvedValue([])
    campanhasMock.listarCampanhasAbertas.mockResolvedValue([
      {
        id: 'camp-2',
        nome: 'Campanha do jogador',
        mestre_nome: 'Mestre Teste',
        descricao: 'Uma jornada épica pelas terras esquecidas',
      },
    ])
    campanhasMock.entrarNaCampanha.mockResolvedValue({ campanhaId: 'camp-2', fichaId: 'ficha-2' })
    campanhasMock.obterCampanha.mockResolvedValue({
      id: 'camp-2',
      nome: 'Campanha do jogador',
      role: 'jogador',
      fichaId: 'ficha-2',
    })
    fichasMock.obterFicha.mockResolvedValue(criarFichaFake({ id: 'ficha-2' }))

    renderApp('/campanhas')

    expect(await screen.findByText('Mestre: Mestre Teste', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Uma jornada épica pelas terras esquecidas')).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Entrar em Campanha do jogador' }))

    expect(await screen.findByRole('heading', { name: 'Geral' })).toBeInTheDocument()
  })

  it('exibe erro e permanece na lista quando entrar falha', async () => {
    const user = userEvent.setup()
    campanhasMock.listarCampanhas.mockResolvedValue([])
    campanhasMock.listarCampanhasAbertas.mockResolvedValue([{ id: 'camp-2', nome: 'Campanha do jogador' }])
    campanhasMock.entrarNaCampanha.mockRejectedValue(new Error('falha ao entrar'))

    renderApp('/campanhas')

    await user.click(await screen.findByRole('button', { name: 'Entrar em Campanha do jogador' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível entrar')
    expect(screen.getByText('Campanha do jogador')).toBeInTheDocument()
  })

  it('não mostra placeholder de "sem descrição" quando a campanha aberta não tem descrição', async () => {
    campanhasMock.listarCampanhas.mockResolvedValue([])
    campanhasMock.listarCampanhasAbertas.mockResolvedValue([
      { id: 'camp-3', nome: 'Ecos do Vale', mestre_nome: 'Mestre Teste' },
    ])

    renderApp('/campanhas')

    await screen.findByText('Ecos do Vale')

    expect(screen.queryByText(/sem descri/i)).not.toBeInTheDocument()
  })
})
