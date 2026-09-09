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

describe('CampaignLorePage', () => {
  it('lista os elementos publicados agrupados por categoria, sem rascunhos', async () => {
    worldsMock.listarElementosPublicadosDaCampanha.mockResolvedValue([
      { id: 'elem-1', mundoId: 'mundo-1', titulo: 'Bane', categoria: 'Divindade', conteudo: 'O deus da tirania.', status: 'publicado' },
      { id: 'elem-2', mundoId: 'mundo-1', titulo: 'Waterdeep', categoria: 'Local', conteudo: 'A cidade das máscaras.', status: 'publicado' },
    ])

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/historia']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Divindade')).toBeInTheDocument()
    expect(screen.getByText('Bane')).toBeInTheDocument()
    expect(screen.getByText('Local')).toBeInTheDocument()
    expect(screen.getByText('Waterdeep')).toBeInTheDocument()
    expect(screen.queryByText('Rascunho')).not.toBeInTheDocument()
  })

  it('exibe estado vazio quando a campanha não tem mundo vinculado ou o mundo não tem elementos publicados', async () => {
    worldsMock.listarElementosPublicadosDaCampanha.mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/historia']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('Esta campanha ainda não tem nenhuma história publicada para consultar.'),
    ).toBeInTheDocument()
  })
})
