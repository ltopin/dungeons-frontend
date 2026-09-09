import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { sairDaConta } from '../auth/session'
import * as campaignsApi from '../api/campaigns'
import * as sheetsApi from '../api/sheets'
import * as compendioApi from '../api/compendio'
import * as realtimeApi from '../realtime/useCampaignEvents'
import { criarFichaFake } from '../test/fixtures'
import { autenticarComoContaFake } from '../test/session'

vi.mock('../api/accounts')
vi.mock('../api/campaigns')
vi.mock('../api/sheets')
vi.mock('../api/compendio')
vi.mock('../realtime/useCampaignEvents')

const campanhasMock = vi.mocked(campaignsApi)
const fichasMock = vi.mocked(sheetsApi)
const compendioMock = vi.mocked(compendioApi)
const realtimeMock = vi.mocked(realtimeApi)

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
  // O redirect para a trilha (ficha em branco) carrega o compêndio junto com
  // a ficha — mocks vazios bastam para os testes desta página, que não
  // exercitam o conteúdo do wizard em si (ver CharacterWizardPage.test.tsx).
  compendioMock.listarRacasCompendio.mockResolvedValue([])
  compendioMock.listarClassesCompendio.mockResolvedValue([])
  compendioMock.listarPericiasCompendio.mockResolvedValue([])
  compendioMock.listarTalentosCompendio.mockResolvedValue([])
  // Sem isso, o flush de edições pendentes ao desmontar uma aba (troca de
  // aba ou fim do teste) encadeia `.then` sobre um mock sem resolução e
  // quebra o teste — ver useSectionAutosave.ts / useListSection.ts.
  fichasMock.atualizarSecao.mockResolvedValue({} as never)
  fichasMock.atualizarLinha.mockResolvedValue({} as never)
  realtimeMock.useCampaignEvents.mockReturnValue({
    eventos: [],
    status: 'conectado',
    emitirRolagem: vi.fn().mockResolvedValue({}),
    pedirRolagem: vi.fn().mockResolvedValue({}),
    reconectar: vi.fn(),
  })
})

const ABAS = ['Geral', 'Combate', 'Talentos', 'Ataques', 'Perícias', 'Magias', 'Inventário', 'Familiar', 'Notas']

describe('link para história da campanha', () => {
  it('não aparece quando a campanha não tem mundo vinculado', async () => {
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )

    await screen.findByDisplayValue('Aria Ventoclaro')
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
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('link', { name: 'História da campanha' })).toHaveAttribute(
      'href',
      '/campanhas/camp-1/historia',
    )
  })
})

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

describe('campos derivados — Combate reage a mudanças em Geral', () => {
  it('recalcula CA e CMB imediatamente quando força/destreza mudam em Geral, antes do autosave confirmar', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByDisplayValue('Aria Ventoclaro')

    await user.click(screen.getByRole('button', { name: 'Combate' }))
    // fixture: bab 2, força 10 (mod 0), tamanho Médio (mod 0), cmbOutros 0 → CMB +2
    expect(within(screen.getByText('CMB').closest('.save-row')!).getByText('+2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Geral' }))
    const forcaInput = screen.getByLabelText(/Força/)
    await user.clear(forcaInput)
    await user.type(forcaInput, '20')

    await user.click(screen.getByRole('button', { name: 'Combate' }))
    // força 20 → mod +5 → CMB = bab 2 + 5 + tamanho 0 + outros 0 = +7, sem esperar o debounce do autosave
    expect(within(screen.getByText('CMB').closest('.save-row')!).getByText('+7')).toBeInTheDocument()
  })
})

describe('campos derivados — total de perícia', () => {
  it('envia o total calculado no payload ao editar graduações', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByDisplayValue('Aria Ventoclaro')

    await user.click(screen.getByRole('button', { name: 'Perícias' }))
    const graduacoesInput = screen.getByLabelText('Graduações')
    await user.clear(graduacoesInput)
    await user.type(graduacoesInput, '8')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    // fixture: Furtividade, DEX (mod +4), perícia de classe, graduações 8 → total 8 + 4 + 3 + 0 = 15
    expect(fichasMock.atualizarLinha).toHaveBeenCalledWith(
      'ficha-1',
      'pericias',
      'p1',
      expect.objectContaining({ graduacoes: 8, total: 15 }),
    )
    vi.useRealTimers()
  })
})

describe('campos derivados — capacidade de carga', () => {
  it('recalcula carga leve/média/pesada ao mudar a força em Geral', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByDisplayValue('Aria Ventoclaro')

    await user.click(screen.getByRole('button', { name: 'Inventário' }))
    // fixture: força 10, tamanho Médio → carga leve 33
    expect((screen.getByLabelText(/carga leve/i) as HTMLInputElement).value).toBe('33')

    await user.click(screen.getByRole('button', { name: 'Geral' }))
    const forcaInput = screen.getByLabelText(/Força/)
    await user.clear(forcaInput)
    await user.type(forcaInput, '16')

    await user.click(screen.getByRole('button', { name: 'Inventário' }))
    // força 16, tamanho Médio → carga leve 76 (tabela oficial)
    expect((screen.getByLabelText(/carga leve/i) as HTMLInputElement).value).toBe('76')
  })
})

describe('sincronização entre abas ao salvar (fix-character-sheet-tab-state-sync)', () => {
  it('preserva um campo de Geral editado e salvo ao trocar de aba e voltar, sem precisar de refresh', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup()
    const fichaFake = criarFichaFake()
    fichasMock.atualizarSecao.mockImplementation(async (_fichaId, secao, patch) =>
      secao === 'geral' ? { ...fichaFake.geral, ...(patch as object) } : ({} as never),
    )

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByDisplayValue('Aria Ventoclaro')

    const nomeInput = screen.getByLabelText('Nome do personagem')
    await user.clear(nomeInput)
    await user.type(nomeInput, 'Aria Sombraleve')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    await user.click(screen.getByRole('button', { name: 'Combate' }))
    await user.click(screen.getByRole('button', { name: 'Geral' }))

    expect(screen.getByLabelText('Nome do personagem')).toHaveValue('Aria Sombraleve')
    vi.useRealTimers()
  })

  it('preserva uma linha de Talentos editada e salva ao trocar de aba e voltar, sem precisar de refresh', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup()
    fichasMock.atualizarLinha.mockImplementation(async (_fichaId, _secao, itemId, patch) => ({
      id: itemId,
      nome: 'Ataque Furtivo',
      descricao: '+2d6 de dano',
      categoria: 'talento',
      ...(patch as object),
    }))

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByDisplayValue('Aria Ventoclaro')

    await user.click(screen.getByRole('button', { name: 'Talentos' }))
    const nomeTalento = screen.getByDisplayValue('Ataque Furtivo')
    await user.clear(nomeTalento)
    await user.type(nomeTalento, 'Ataque Furtivo Aprimorado')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    await user.click(screen.getByRole('button', { name: 'Geral' }))
    await user.click(screen.getByRole('button', { name: 'Talentos' }))

    expect(screen.getByDisplayValue('Ataque Furtivo Aprimorado')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('salva uma edição em Notas mesmo trocando de aba antes do debounce de 1s disparar', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByDisplayValue('Aria Ventoclaro')

    await user.click(screen.getByRole('button', { name: 'Notas' }))
    const notasArea = screen.getByRole('textbox', { name: 'Notas' })
    await user.type(notasArea, 'rascunho rápido')

    // Troca de aba imediatamente, sem aguardar o debounce de 1s do autosave.
    await user.click(screen.getByRole('button', { name: 'Geral' }))

    expect(fichasMock.atualizarSecao).toHaveBeenCalledWith('ficha-1', 'notas', { texto: 'rascunho rápido' })
  })
})

describe('redirecionamento para a trilha de criação', () => {
  it('leva para a trilha quando a ficha ainda está em branco (nome/classe/raça vazios)', async () => {
    fichasMock.obterFicha.mockResolvedValue(
      criarFichaFake({
        geral: {
          nomePersonagem: '',
          classe: '',
          nivel: 0,
          raca: '',
          alinhamento: '',
          divindade: '',
          tamanho: '',
          genero: '',
          idade: '',
          altura: '',
          peso: '',
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
      }),
    )

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Trilha de Criação de Personagem/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Combate' })).not.toBeInTheDocument()
  })

  it('leva para a trilha quando a API retorna null (não string vazia) nos campos de texto de uma ficha nova', async () => {
    fichasMock.obterFicha.mockResolvedValue(
      criarFichaFake({
        geral: {
          nomePersonagem: null,
          classe: null,
          nivel: 0,
          raca: null,
          alinhamento: null,
          divindade: null,
          tamanho: null,
          genero: null,
          idade: null,
          altura: null,
          peso: null,
          str: 10,
          dex: 10,
          con: 10,
          int: 10,
          wis: 10,
          cha: 10,
        } as never,
        pericias: [],
        talentos: [],
        magias: [],
        itens: [],
      }),
    )

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Trilha de Criação de Personagem/i)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('não redireciona quando a ficha já tem nome, classe e raça', async () => {
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByDisplayValue('Aria Ventoclaro')).toBeInTheDocument()
    expect(screen.queryByText(/Trilha de Criação de Personagem/i)).not.toBeInTheDocument()
  })
})

describe('aba Familiar', () => {
  it('não gera erro quando a ficha não tem familiar, e permite o primeiro e os salvamentos seguintes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByDisplayValue('Aria Ventoclaro')

    await user.click(screen.getByRole('button', { name: 'Familiar' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText(/nenhum familiar registrado ainda/i)).toBeInTheDocument()

    const nomeInput = screen.getByLabelText('Nome')
    await user.type(nomeInput, 'Pluma')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(fichasMock.atualizarSecao).toHaveBeenCalledWith(
      'ficha-1',
      'familiar',
      expect.objectContaining({ nome: 'Pluma' }),
    )

    const tipoInput = screen.getByLabelText('Tipo')
    await user.type(tipoInput, 'Corvo')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(fichasMock.atualizarSecao).toHaveBeenCalledWith(
      'ficha-1',
      'familiar',
      expect.objectContaining({ nome: 'Pluma', tipo: 'Corvo' }),
    )
    vi.useRealTimers()
  })
})

describe('eventos de mesa', () => {
  it('envia a rolagem vinculada ao item da ficha, sem calcular o resultado localmente', async () => {
    const emitirRolagem = vi.fn().mockResolvedValue({})
    realtimeMock.useCampaignEvents.mockReturnValue({
      eventos: [],
      status: 'conectado',
      emitirRolagem,
      pedirRolagem: vi.fn(),
      reconectar: vi.fn(),
    })

    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByDisplayValue('Aria Ventoclaro')

    await user.click(screen.getByRole('button', { name: 'Perícias' }))
    await user.click(screen.getByRole('button', { name: 'Rolar Furtividade' }))

    expect(emitirRolagem).toHaveBeenCalledWith({ tipoItem: 'pericia', itemId: 'p1' })
  })

  it('exibe no painel de eventos o resultado recebido do servidor, mesmo quando difere do total calculado na aba', async () => {
    realtimeMock.useCampaignEvents.mockReturnValue({
      eventos: [
        {
          id: 'ev-1',
          campanhaId: 'camp-1',
          autorContaId: 'conta-1',
          criadoEm: '2026-01-01T00:00:00.000Z',
          tipo: 'rolagem_dados',
          payload: {
            tipoItem: 'pericia',
            itemId: 'p1',
            itemNome: 'Furtividade',
            notacao: '1d20',
            dados: [17],
            bonus: 10,
            resultado: 27,
            autorNomePersonagem: null,
          },
        },
      ],
      status: 'conectado',
      emitirRolagem: vi.fn(),
      pedirRolagem: vi.fn(),
      reconectar: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByDisplayValue('Aria Ventoclaro')

    // Fixture: perícia Furtividade tem total 10 calculado localmente — o painel
    // deve mostrar o resultado que veio do servidor (27), não esse total.
    expect(screen.getByText('Resultado: 27')).toBeInTheDocument()
  })

  it('painel indica conexão indisponível sem impedir o uso do restante da ficha', async () => {
    realtimeMock.useCampaignEvents.mockReturnValue({
      eventos: [],
      status: 'indisponivel',
      emitirRolagem: vi.fn(),
      pedirRolagem: vi.fn(),
      reconectar: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByDisplayValue('Aria Ventoclaro')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Conexão em tempo real indisponível.')
  })

  it('não exibe o controle de pedir rolagem para o jogador', async () => {
    render(
      <MemoryRouter initialEntries={['/campanhas/camp-1/ficha']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByDisplayValue('Aria Ventoclaro')

    expect(screen.queryByRole('button', { name: 'Pedir rolagem' })).not.toBeInTheDocument()
  })
})
