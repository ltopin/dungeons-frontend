import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as sheetsApi from '../../api/sheets'
import { EquipamentoStep } from './EquipamentoStep'
import { criarFichaFake } from '../../test/fixtures'
import type { CompendioClasse } from '../../api/compendioTypes'

vi.mock('../../api/sheets')

const fichasMock = vi.mocked(sheetsApi)

const GUERREIRO_FAKE: CompendioClasse = {
  id: 'classe-guerreiro',
  nome: 'Guerreiro',
  dado_vida: 'd10',
  bab_progressao: 'boa',
  salvaguardas_progressao: { fortitude: 'boa', reflexos: 'ruim', vontade: 'ruim' },
  pericias_de_classe: [],
  pontos_pericia_por_nivel: 2,
  conjurador: false,
  atributo_conjuracao: null,
  magias_por_dia: [],
  caracteristicas: [],
}

let proximoId = 1

beforeEach(() => {
  vi.clearAllMocks()
  proximoId = 1
  fichasMock.criarLinha.mockImplementation(
    async (_fichaId, _secao, dados) => ({ id: `gerado-${proximoId++}`, ...(dados as object) }) as never,
  )
  fichasMock.removerLinha.mockResolvedValue(undefined)
  fichasMock.atualizarSecao.mockImplementation(async (_fichaId, _secao, patch) => patch as never)
})

function renderStep() {
  const moedas = { ...criarFichaFake().moedas, gp: 50 }
  render(
    <EquipamentoStep
      fichaId="ficha-1"
      moedas={moedas}
      itens={[]}
      ataques={[]}
      classe={GUERREIRO_FAKE}
      onConcluir={vi.fn()}
    />,
  )
}

describe('EquipamentoStep — compra de arma cria o Ataque correspondente', () => {
  it('comprar individualmente uma arma com dados de combate cria a linha de Ataque, além do item de inventário', async () => {
    const user = userEvent.setup()
    renderStep()

    const linhaMachado = screen.getByText(/Machado de guerra/).closest('li')!
    await user.click(within(linhaMachado).getByRole('button', { name: 'Comprar' }))

    expect(fichasMock.criarLinha).toHaveBeenCalledWith(
      'ficha-1',
      'itens',
      expect.objectContaining({ nome: 'Machado de guerra' }),
    )
    expect(fichasMock.criarLinha).toHaveBeenCalledWith(
      'ficha-1',
      'ataques',
      expect.objectContaining({ arma: 'Machado de guerra', dano: '1d8', critico: 'x3', tipo: 'Corte', bonus: '' }),
    )
  })

  it('aplicar o pacote inicial da classe cria os Ataques correspondentes às armas do pacote', async () => {
    const user = userEvent.setup()
    renderStep()

    await user.click(screen.getByRole('button', { name: 'Usar pacote inicial de Guerreiro' }))

    expect(fichasMock.criarLinha).toHaveBeenCalledWith(
      'ficha-1',
      'ataques',
      expect.objectContaining({ arma: 'Espada longa' }),
    )
  })

  it('comprar um item sem dados de combate não cria nenhuma linha de Ataque', async () => {
    const user = userEvent.setup()
    renderStep()

    const linhaMochila = screen.getByText('Mochila').closest('li')!
    await user.click(within(linhaMochila).getByRole('button', { name: 'Comprar' }))

    expect(fichasMock.criarLinha).toHaveBeenCalledWith(
      'ficha-1',
      'itens',
      expect.objectContaining({ nome: 'Mochila' }),
    )
    expect(fichasMock.criarLinha).not.toHaveBeenCalledWith('ficha-1', 'ataques', expect.anything())
  })

  it('remover uma arma comprada remove também o Ataque correspondente e devolve o ouro', async () => {
    const user = userEvent.setup()
    renderStep()

    const linhaMachado = screen.getByText(/Machado de guerra/).closest('li')!
    await user.click(within(linhaMachado).getByRole('button', { name: 'Comprar' }))

    const itemComprado = screen.getByText(/Machado de guerra — 10 po/).closest('li')!
    await user.click(within(itemComprado).getByRole('button'))

    expect(fichasMock.removerLinha).toHaveBeenCalledWith('ficha-1', 'itens', expect.any(String))
    expect(fichasMock.removerLinha).toHaveBeenCalledWith('ficha-1', 'ataques', expect.any(String))
  })
})
