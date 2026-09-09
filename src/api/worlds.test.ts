import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  criarElemento,
  criarMundo,
  editarElemento,
  listarElementosDoMundo,
  listarElementosPublicadosDaCampanha,
  listarMundos,
  publicarElemento,
} from './worlds'

function mockFetchJson(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('criarMundo', () => {
  it('envia o nome no corpo e faz POST em /mundos', async () => {
    const fetchMock = mockFetchJson({ id: 'mundo-1', nome: 'Forgotten Realms' }, 201)
    vi.stubGlobal('fetch', fetchMock)

    const resultado = await criarMundo('Forgotten Realms')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/mundos')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ nome: 'Forgotten Realms' })
    expect(resultado).toEqual({ id: 'mundo-1', nome: 'Forgotten Realms' })
  })
})

describe('listarMundos', () => {
  it('retorna a lista de mundos do usuário', async () => {
    vi.stubGlobal('fetch', mockFetchJson([{ id: 'mundo-1', nome: 'Forgotten Realms' }]))

    const resultado = await listarMundos()

    expect(resultado).toEqual([{ id: 'mundo-1', nome: 'Forgotten Realms' }])
  })
})

describe('criarElemento', () => {
  it('envia título, categoria e conteúdo e faz POST em /mundos/:mundoId/elementos', async () => {
    const fetchMock = mockFetchJson(
      { id: 'elem-1', mundoId: 'mundo-1', titulo: 'Bane', categoria: 'Divindade', conteudo: 'O deus da tirania.', status: 'rascunho' },
      201,
    )
    vi.stubGlobal('fetch', fetchMock)

    const resultado = await criarElemento('mundo-1', {
      titulo: 'Bane',
      categoria: 'Divindade',
      conteudo: 'O deus da tirania.',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/mundos/mundo-1/elementos')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ titulo: 'Bane', categoria: 'Divindade', conteudo: 'O deus da tirania.' })
    expect(resultado.status).toBe('rascunho')
  })
})

describe('editarElemento', () => {
  it('faz PATCH em /mundos/:mundoId/elementos/:elementoId com os campos editados', async () => {
    const fetchMock = mockFetchJson(
      { id: 'elem-1', mundoId: 'mundo-1', titulo: 'Bane', categoria: 'Divindade', conteudo: 'Texto atualizado.', status: 'publicado' },
    )
    vi.stubGlobal('fetch', fetchMock)

    await editarElemento('mundo-1', 'elem-1', { titulo: 'Bane', categoria: 'Divindade', conteudo: 'Texto atualizado.' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/mundos/mundo-1/elementos/elem-1')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body)).toEqual({ titulo: 'Bane', categoria: 'Divindade', conteudo: 'Texto atualizado.' })
  })
})

describe('publicarElemento', () => {
  it('faz POST em /mundos/:mundoId/elementos/:elementoId/publicar', async () => {
    const fetchMock = mockFetchJson({
      id: 'elem-1',
      mundoId: 'mundo-1',
      titulo: 'Bane',
      categoria: 'Divindade',
      conteudo: 'Texto.',
      status: 'publicado',
    })
    vi.stubGlobal('fetch', fetchMock)

    const resultado = await publicarElemento('mundo-1', 'elem-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/mundos/mundo-1/elementos/elem-1/publicar')
    expect(init.method).toBe('POST')
    expect(resultado.status).toBe('publicado')
  })
})

describe('listarElementosDoMundo', () => {
  it('retorna os elementos (rascunho e publicados) de /mundos/:mundoId/elementos', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchJson([
        { id: 'elem-1', mundoId: 'mundo-1', titulo: 'Bane', categoria: 'Divindade', conteudo: 'Texto.', status: 'rascunho' },
      ]),
    )

    const resultado = await listarElementosDoMundo('mundo-1')

    expect(resultado).toHaveLength(1)
    expect(resultado[0].status).toBe('rascunho')
  })
})

describe('listarElementosPublicadosDaCampanha', () => {
  it('busca em /campanhas/:campanhaId/mundo/elementos', async () => {
    const fetchMock = mockFetchJson([
      { id: 'elem-1', mundoId: 'mundo-1', titulo: 'Bane', categoria: 'Divindade', conteudo: 'Texto.', status: 'publicado' },
    ])
    vi.stubGlobal('fetch', fetchMock)

    const resultado = await listarElementosPublicadosDaCampanha('camp-1')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain('/campanhas/camp-1/mundo/elementos')
    expect(resultado).toEqual([
      { id: 'elem-1', mundoId: 'mundo-1', titulo: 'Bane', categoria: 'Divindade', conteudo: 'Texto.', status: 'publicado' },
    ])
  })
})
