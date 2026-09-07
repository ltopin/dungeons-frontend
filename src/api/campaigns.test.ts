import { afterEach, describe, expect, it, vi } from 'vitest'
import { criarCampanha, entrarNaCampanha, listarCampanhasAbertas, listarFichasDaCampanha } from './campaigns'

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

describe('criarCampanha', () => {
  it('envia a descrição no corpo quando informada', async () => {
    const fetchMock = mockFetchJson({ id: 'camp-1', nome: 'Minas de Phandelver', role: 'mestre' }, 201)
    vi.stubGlobal('fetch', fetchMock)

    await criarCampanha('Minas de Phandelver', 'Uma aventura na fronteira')

    const [, init] = fetchMock.mock.calls[0]
    expect(JSON.parse(init.body)).toEqual({ nome: 'Minas de Phandelver', descricao: 'Uma aventura na fronteira' })
  })

  it('envia descricao undefined quando não informada', async () => {
    const fetchMock = mockFetchJson({ id: 'camp-1', nome: 'Minas de Phandelver', role: 'mestre' }, 201)
    vi.stubGlobal('fetch', fetchMock)

    await criarCampanha('Minas de Phandelver')

    const [, init] = fetchMock.mock.calls[0]
    expect(JSON.parse(init.body)).toEqual({ nome: 'Minas de Phandelver' })
  })
})

describe('entrarNaCampanha', () => {
  it('mapeia a resposta { membership, ficha } da API para { campanhaId, fichaId }', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchJson({
        membership: { id: 'membership-1', conta_id: 'conta-1', campanha_id: 'camp-9', role: 'jogador' },
        ficha: { id: 'ficha-9', campanha_id: 'camp-9' },
      }, 201),
    )

    const resultado = await entrarNaCampanha('camp-9')

    expect(resultado).toEqual({ campanhaId: 'camp-9', fichaId: 'ficha-9' })
  })
})

describe('listarFichasDaCampanha', () => {
  it('mapeia nome_jogador (snake_case da API) para nomeJogador', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchJson([
        { id: 'ficha-1', contaId: 'conta-1', nomePersonagem: 'Aria', classe: 'Ladina', nivel: 3, nome_jogador: 'Fulano' },
      ]),
    )

    const resultado = await listarFichasDaCampanha('camp-1')

    expect(resultado).toEqual([
      { id: 'ficha-1', contaId: 'conta-1', nomePersonagem: 'Aria', classe: 'Ladina', nivel: 3, nomeJogador: 'Fulano' },
    ])
  })

  it('mantém nomeJogador undefined quando a API ainda não expõe nome_jogador', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchJson([{ id: 'ficha-1', contaId: 'conta-1', nomePersonagem: 'Aria', classe: 'Ladina', nivel: 3 }]),
    )

    const resultado = await listarFichasDaCampanha('camp-1')

    expect(resultado[0].nomeJogador).toBeUndefined()
  })
})

describe('listarCampanhasAbertas', () => {
  it('retorna a lista de campanhas abertas da API', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchJson([
        { id: 'camp-1', nome: 'Minas de Phandelver' },
        { id: 'camp-2', nome: 'Curse of Strahd' },
      ]),
    )

    const resultado = await listarCampanhasAbertas()

    expect(resultado).toEqual([
      { id: 'camp-1', nome: 'Minas de Phandelver' },
      { id: 'camp-2', nome: 'Curse of Strahd' },
    ])
  })
})
