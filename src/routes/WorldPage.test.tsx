import { render, screen, within } from '@testing-library/react'
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
  worldsMock.listarMundos.mockResolvedValue([{ id: 'mundo-1', nome: 'Forgotten Realms' }])
})

describe('WorldPage', () => {
  it('cria um elemento em rascunho com categoria de texto livre', async () => {
    const user = userEvent.setup()
    worldsMock.listarElementosDoMundo.mockResolvedValue([])
    worldsMock.criarElemento.mockResolvedValue({
      id: 'elem-1',
      mundoId: 'mundo-1',
      titulo: 'Bane',
      categoria: 'Divindade da Tirania',
      conteudo: 'O deus da tirania e do medo.',
      status: 'rascunho',
    })

    render(
      <MemoryRouter initialEntries={['/mundos/mundo-1']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Forgotten Realms' })

    await user.type(screen.getByLabelText('Título'), 'Bane')
    await user.type(screen.getByLabelText('Categoria'), 'Divindade da Tirania')
    await user.type(screen.getByLabelText('Conteúdo'), 'O deus da tirania e do medo.')
    await user.click(screen.getByRole('button', { name: 'Criar elemento' }))

    expect(worldsMock.criarElemento).toHaveBeenCalledWith('mundo-1', {
      titulo: 'Bane',
      categoria: 'Divindade da Tirania',
      conteudo: 'O deus da tirania e do medo.',
    })
    expect(await screen.findByText('Bane')).toBeInTheDocument()
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('edita um elemento existente preservando o status publicado', async () => {
    const user = userEvent.setup()
    worldsMock.listarElementosDoMundo.mockResolvedValue([
      {
        id: 'elem-1',
        mundoId: 'mundo-1',
        titulo: 'Bane',
        categoria: 'Divindade',
        conteudo: 'Texto original.',
        status: 'publicado',
      },
    ])
    worldsMock.editarElemento.mockResolvedValue({
      id: 'elem-1',
      mundoId: 'mundo-1',
      titulo: 'Bane',
      categoria: 'Divindade',
      conteudo: 'Texto atualizado.',
      status: 'publicado',
    })

    render(
      <MemoryRouter initialEntries={['/mundos/mundo-1']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    const conteudoInput = screen.getByLabelText('Conteúdo')
    await user.clear(conteudoInput)
    await user.type(conteudoInput, 'Texto atualizado.')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(worldsMock.editarElemento).toHaveBeenCalledWith('elem-1', {
      titulo: 'Bane',
      categoria: 'Divindade',
      conteudo: 'Texto atualizado.',
    })
    expect(await screen.findByText('Publicado')).toBeInTheDocument()
  })

  it('publica um rascunho e reflete o novo status sem recarregar a página', async () => {
    const user = userEvent.setup()
    worldsMock.listarElementosDoMundo.mockResolvedValue([
      {
        id: 'elem-1',
        mundoId: 'mundo-1',
        titulo: 'Bane',
        categoria: 'Divindade',
        conteudo: 'Texto.',
        status: 'rascunho',
      },
    ])
    worldsMock.publicarElemento.mockResolvedValue({
      id: 'elem-1',
      mundoId: 'mundo-1',
      titulo: 'Bane',
      categoria: 'Divindade',
      conteudo: 'Texto.',
      status: 'publicado',
    })

    render(
      <MemoryRouter initialEntries={['/mundos/mundo-1']}>
        <App />
      </MemoryRouter>,
    )

    const item = (await screen.findByText('Bane')).closest('li')!
    await user.click(within(item).getByRole('button', { name: 'Publicar' }))

    expect(worldsMock.publicarElemento).toHaveBeenCalledWith('elem-1')
    expect(await within(item).findByText('Publicado')).toBeInTheDocument()
    expect(within(item).queryByRole('button', { name: 'Publicar' })).not.toBeInTheDocument()
  })
})
