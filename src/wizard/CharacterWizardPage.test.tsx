import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { sairDaConta } from '../auth/session'
import * as campaignsApi from '../api/campaigns'
import * as sheetsApi from '../api/sheets'
import * as compendioApi from '../api/compendio'
import type { Ficha, FichaGeral } from '../api/types'
import type { CompendioClasse, CompendioRaca, CompendioTalento } from '../api/compendioTypes'
import { criarFichaFake } from '../test/fixtures'
import { autenticarComoContaFake } from '../test/session'

vi.mock('../api/accounts')
vi.mock('../api/campaigns')
vi.mock('../api/sheets')
vi.mock('../api/compendio')

const campanhasMock = vi.mocked(campaignsApi)
const fichasMock = vi.mocked(sheetsApi)
const compendioMock = vi.mocked(compendioApi)

function fichaEmBranco(): Ficha {
  const base = criarFichaFake()
  return {
    ...base,
    geral: {
      ...base.geral,
      nomePersonagem: '',
      classe: '',
      raca: '',
      nivel: 0,
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
    },
    pericias: [],
    talentos: [],
    magias: [],
    itens: [],
  }
}

const RACAS_FAKE: CompendioRaca[] = [
  {
    id: 'raca-humano',
    nome: 'Humano',
    ajustes_atributo: {},
    tamanho: 'Médio',
    deslocamento: 30,
    tipo: 'humanoide (humano)',
    tracos: [
      { nome: 'Bônus de Atributo', descricao: '+2 em um atributo à escolha do jogador na criação do personagem.' },
      { nome: 'Talentoso', descricao: 'Recebe um talento adicional no 1º nível.' },
    ],
    idiomas: ['Comum'],
  },
]

const CLASSES_FAKE: CompendioClasse[] = [
  {
    id: 'classe-guerreiro',
    nome: 'Guerreiro',
    dado_vida: 'd10',
    bab_progressao: 'boa',
    salvaguardas_progressao: { fortitude: 'boa', reflexos: 'ruim', vontade: 'ruim' },
    pericias_de_classe: ['Escalada', 'Intimidação'],
    pontos_pericia_por_nivel: 2,
    conjurador: false,
    atributo_conjuracao: null,
    magias_por_dia: [],
    caracteristicas: [
      { nivel: 1, nome: 'Talento de Combate Bônus', descricao: 'Recebe um talento de combate adicional no 1º nível.' },
    ],
  },
]

const RACAS_EXTRA_FAKE: CompendioRaca[] = [
  ...RACAS_FAKE,
  {
    id: 'raca-anao',
    nome: 'Anão',
    ajustes_atributo: { con: 2, cha: -2 },
    tamanho: 'Médio',
    deslocamento: 20,
    tipo: 'humanoide (anão)',
    tracos: [{ nome: 'Visão no Escuro', descricao: 'Enxerga no escuro até 18 metros.' }],
    idiomas: ['Comum', 'Anão'],
  },
]

const CLASSES_EXTRA_FAKE: CompendioClasse[] = [
  ...CLASSES_FAKE,
  {
    id: 'classe-ladino',
    nome: 'Ladino',
    dado_vida: 'd8',
    bab_progressao: 'media',
    salvaguardas_progressao: { fortitude: 'ruim', reflexos: 'boa', vontade: 'ruim' },
    pericias_de_classe: ['Furtividade'],
    pontos_pericia_por_nivel: 8,
    conjurador: false,
    atributo_conjuracao: null,
    magias_por_dia: [],
    caracteristicas: [{ nivel: 1, nome: 'Ataque Furtivo', descricao: '+1d6 de dano quando desprevenido.' }],
  },
]

const TALENTOS_FAKE: CompendioTalento[] = [
  {
    id: 'talento-investida-poderosa',
    nome: 'Investida Poderosa',
    tipo: 'combate',
    pre_requisitos: 'Força 13',
    beneficio: 'Troca bônus de ataque corpo a corpo por bônus de dano.',
  },
]

let geralAtual: FichaGeral
let proximoId = 1

beforeEach(async () => {
  sairDaConta()
  await autenticarComoContaFake()
  vi.clearAllMocks()
  proximoId = 1
  geralAtual = fichaEmBranco().geral

  campanhasMock.obterCampanha.mockResolvedValue({
    id: 'camp-1',
    nome: 'Campanha',
    role: 'jogador',
    fichaId: 'ficha-1',
  })
  fichasMock.obterFicha.mockResolvedValue(fichaEmBranco())
  compendioMock.listarRacasCompendio.mockResolvedValue(RACAS_FAKE)
  compendioMock.listarClassesCompendio.mockResolvedValue(CLASSES_FAKE)
  compendioMock.listarPericiasCompendio.mockResolvedValue([])
  compendioMock.listarTalentosCompendio.mockResolvedValue(TALENTOS_FAKE)
  compendioMock.listarMagiasCompendio.mockResolvedValue([])
  fichasMock.atualizarSecao.mockImplementation(async (_fichaId, secao, patch) => {
    if (secao === 'geral') {
      geralAtual = { ...geralAtual, ...(patch as object) }
      return geralAtual as never
    }
    return { ...(patch as object) } as never
  })
  fichasMock.criarLinha.mockImplementation(
    async (_fichaId, _secao, dados) => ({ id: `gerado-${proximoId++}`, ...(dados as object) }) as never,
  )
  fichasMock.atualizarLinha.mockImplementation(
    async (_fichaId, _secao, itemId, patch) => ({ id: itemId, ...(patch as object) }) as never,
  )
  fichasMock.removerLinha.mockResolvedValue(undefined)
  fichasMock.atualizarMagiaNiveis.mockImplementation(async (_fichaId, niveis) => niveis as never)
})

describe('link para história da campanha', () => {
  it('não aparece quando a campanha não tem mundo vinculado', async () => {
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha/criar']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Raça e Classe' })
    expect(screen.queryByRole('link', { name: 'História da campanha' })).not.toBeInTheDocument()
  })

  it('aparece e aponta para /campanhas/:id/historia quando a campanha tem mundo vinculado', async () => {
    campanhasMock.obterCampanha.mockResolvedValue({
      id: 'camp-1',
      nome: 'Campanha',
      role: 'jogador',
      fichaId: 'ficha-1',
      mundoId: 'mundo-1',
    })

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha/criar']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('link', { name: 'História da campanha' })).toHaveAttribute(
      'href',
      '/campanhas/camp-1/historia',
    )
  })
})

describe('trilha de criação de personagem', () => {
  it('escolhe raça e classe e avança para a etapa de Atributos', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha/criar']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Raça e Classe' })

    await user.type(screen.getByLabelText('Nome do personagem'), 'Thorin')
    await user.click(screen.getByRole('button', { name: /Humano/ }))
    await user.click(screen.getByRole('button', { name: /Guerreiro/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar raça e classe' }))

    expect(await screen.findByRole('heading', { name: 'Atributos' })).toBeInTheDocument()
  })

  it('envia o patch pendente imediatamente ao confirmar, antes do debounce de 1s disparar sozinho', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha/criar']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Raça e Classe' })

    await user.type(screen.getByLabelText('Nome do personagem'), 'Thorin')
    await user.click(screen.getByRole('button', { name: /Humano/ }))
    await user.click(screen.getByRole('button', { name: /Guerreiro/ }))

    // Clica em confirmar imediatamente, bem antes do debounce de 1s do autosave disparar sozinho.
    await user.click(screen.getByRole('button', { name: 'Confirmar raça e classe' }))

    expect(await screen.findByRole('heading', { name: 'Atributos' })).toBeInTheDocument()
    expect(fichasMock.atualizarSecao).toHaveBeenCalledWith(
      'ficha-1',
      'geral',
      expect.objectContaining({ nomePersonagem: 'Thorin', raca: 'Humano', classe: 'Guerreiro' }),
    )
  })

  it('mantém a etapa atual e não avança quando o envio forçado pela confirmação falha', async () => {
    fichasMock.atualizarSecao.mockImplementation(async (_fichaId, secao) => {
      if (secao === 'geral') throw new Error('falha de rede')
      return {} as never
    })
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha/criar']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Raça e Classe' })

    await user.type(screen.getByLabelText('Nome do personagem'), 'Thorin')
    await user.click(screen.getByRole('button', { name: /Humano/ }))
    await user.click(screen.getByRole('button', { name: /Guerreiro/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar raça e classe' }))

    expect(await screen.findByText(/Erro ao salvar/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Raça e Classe' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Atributos' })).not.toBeInTheDocument()
  })

  it('desabilita o botão de confirmação enquanto a etapa não pode ser concluída', async () => {
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha/criar']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Raça e Classe' })

    expect(screen.getByRole('button', { name: 'Confirmar raça e classe' })).toBeDisabled()
  })

  it('bloqueia Investida Poderosa até Força chegar a 13, e libera depois', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha/criar']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Raça e Classe' })
    await user.type(screen.getByLabelText('Nome do personagem'), 'Thorin')
    await user.click(screen.getByRole('button', { name: /Humano/ }))
    await user.click(screen.getByRole('button', { name: /Guerreiro/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar raça e classe' }))
    await screen.findByRole('heading', { name: 'Atributos' })

    // Navegação livre pelo sumário: pula direto para Talentos com Força ainda em 10.
    await user.click(screen.getByRole('button', { name: /Talentos/ }))
    const linhaBloqueada = (await screen.findByText('Investida Poderosa')).closest('li')!
    expect(within(linhaBloqueada).getByText(/Pré-requisito: Força 13/)).toBeInTheDocument()
    expect(within(linhaBloqueada).getByRole('button', { name: 'Escolher' })).toBeDisabled()

    // Volta para Atributos e aumenta Força até 13 (Humano não tem ajuste fixo, então base = final).
    await user.click(screen.getByRole('button', { name: /Atributos/ }))
    await screen.findByRole('heading', { name: 'Atributos' })
    const aumentarForca = screen.getByRole('button', { name: 'Aumentar Força' })
    await user.click(aumentarForca)
    await user.click(aumentarForca)
    await user.click(aumentarForca)

    await user.click(screen.getByRole('button', { name: /Talentos/ }))
    const linhaLiberada = (await screen.findByText('Investida Poderosa')).closest('li')!
    const escolherBtn = within(linhaLiberada).getByRole('button', { name: 'Escolher' })
    expect(escolherBtn).toBeEnabled()

    await user.click(escolherBtn)
    expect(await within(linhaLiberada).findByRole('button', { name: 'Remover' })).toBeInTheDocument()
  })
})

describe('gravação automática de qualidades especiais de raça e classe', () => {
  it('grava os traços da raça e as características de classe de nível 1 ao confirmar', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha/criar']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Raça e Classe' })
    await user.type(screen.getByLabelText('Nome do personagem'), 'Thorin')
    await user.click(screen.getByRole('button', { name: /Humano/ }))
    await user.click(screen.getByRole('button', { name: /Guerreiro/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar raça e classe' }))

    await screen.findByRole('heading', { name: 'Atributos' })

    const chamadasTalentos = fichasMock.criarLinha.mock.calls.filter(([, secao]) => secao === 'talentos')
    const nomesGravados = chamadasTalentos.map(([, , dados]) => (dados as { nome: string }).nome).sort()
    expect(nomesGravados).toEqual(['Bônus de Atributo', 'Talento de Combate Bônus', 'Talentoso'].sort())
    expect(
      chamadasTalentos.every(([, , dados]) => (dados as { categoria: string }).categoria === 'qualidade_especial'),
    ).toBe(true)
  })

  it('confirmar novamente sem trocar raça/classe não duplica as qualidades já gravadas', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha/criar']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Raça e Classe' })
    await user.type(screen.getByLabelText('Nome do personagem'), 'Thorin')
    await user.click(screen.getByRole('button', { name: /Humano/ }))
    await user.click(screen.getByRole('button', { name: /Guerreiro/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar raça e classe' }))
    await screen.findByRole('heading', { name: 'Atributos' })

    await user.click(screen.getByRole('button', { name: /Raça e Classe/ }))
    await screen.findByRole('heading', { name: 'Raça e Classe' })
    await user.click(screen.getByRole('button', { name: 'Confirmar raça e classe' }))
    await screen.findByRole('heading', { name: 'Atributos' })

    const chamadasTalentos = fichasMock.criarLinha.mock.calls.filter(([, secao]) => secao === 'talentos')
    expect(chamadasTalentos).toHaveLength(3)
  })

  it('trocar de raça/classe e confirmar novamente soma as novas qualidades sem remover as antigas', async () => {
    compendioMock.listarRacasCompendio.mockResolvedValue(RACAS_EXTRA_FAKE)
    compendioMock.listarClassesCompendio.mockResolvedValue(CLASSES_EXTRA_FAKE)

    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha/criar']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Raça e Classe' })
    await user.type(screen.getByLabelText('Nome do personagem'), 'Thorin')
    await user.click(screen.getByRole('button', { name: /Humano/ }))
    await user.click(screen.getByRole('button', { name: /Guerreiro/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar raça e classe' }))
    await screen.findByRole('heading', { name: 'Atributos' })

    await user.click(screen.getByRole('button', { name: /Raça e Classe/ }))
    await screen.findByRole('heading', { name: 'Raça e Classe' })
    await user.click(screen.getByRole('button', { name: /Anão/ }))
    await user.click(screen.getByRole('button', { name: /Ladino/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar raça e classe' }))
    await screen.findByRole('heading', { name: 'Atributos' })

    const chamadasTalentos = fichasMock.criarLinha.mock.calls.filter(([, secao]) => secao === 'talentos')
    const nomesGravados = chamadasTalentos.map(([, , dados]) => (dados as { nome: string }).nome).sort()
    expect(nomesGravados).toEqual(
      ['Bônus de Atributo', 'Talentoso', 'Talento de Combate Bônus', 'Visão no Escuro', 'Ataque Furtivo'].sort(),
    )
    expect(fichasMock.removerLinha).not.toHaveBeenCalled()
  })
})
