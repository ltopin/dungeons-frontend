import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as sheetsApi from '../../api/sheets'
import { PericiasStep } from './PericiasStep'
import { criarFichaFake } from '../../test/fixtures'
import type { CompendioClasse, CompendioPericia } from '../../api/compendioTypes'

vi.mock('../../api/sheets')

const fichasMock = vi.mocked(sheetsApi)

const CLASSE_FAKE: CompendioClasse = {
  id: 'classe-guerreiro',
  nome: 'Guerreiro',
  dado_vida: 'd10',
  bab_progressao: 'boa',
  salvaguardas_progressao: { fortitude: 'boa', reflexos: 'ruim', vontade: 'ruim' },
  pericias_de_classe: ['Escalada'],
  pontos_pericia_por_nivel: 2,
  conjurador: false,
  atributo_conjuracao: null,
  magias_por_dia: [],
  caracteristicas: [],
}

const CATALOGO_FAKE: CompendioPericia[] = [
  { id: 'sk-escalada', nome: 'Escalada', atributo: 'str' },
  { id: 'sk-diplomacia', nome: 'Diplomacia', atributo: 'cha' },
]

let proximoId = 1

beforeEach(() => {
  vi.clearAllMocks()
  proximoId = 1
  fichasMock.criarLinha.mockImplementation(
    async (_fichaId, _secao, dados) => ({ id: `gerado-${proximoId++}`, ...(dados as object) }) as never,
  )
  fichasMock.atualizarLinha.mockImplementation(
    async (_fichaId, _secao, itemId, patch) => ({ id: itemId, ...(patch as object) }) as never,
  )
})

function renderStep() {
  const geral = { ...criarFichaFake().geral, str: 10, int: 10 }
  render(
    <PericiasStep
      fichaId="ficha-1"
      pericias={[]}
      geral={geral}
      raca={undefined}
      classe={CLASSE_FAKE}
      catalogo={CATALOGO_FAKE}
      onConcluir={vi.fn()}
    />,
  )
}

describe('PericiasStep — teto uniforme de graduações', () => {
  it('mostra máx 4 tanto para perícia de classe quanto fora de classe', async () => {
    renderStep()

    const linhaEscalada = screen.getByText('Escalada').closest('li')!
    const linhaDiplomacia = screen.getByText('Diplomacia').closest('li')!

    expect(linhaEscalada).toHaveTextContent('máx 4')
    expect(linhaDiplomacia).toHaveTextContent('máx 4')
  })

  it('impede alocar a 5ª graduação em perícia de classe', async () => {
    const user = userEvent.setup()
    renderStep()

    const linhaEscalada = screen.getByText('Escalada').closest('li')!
    const aumentar = within(linhaEscalada).getByRole('button', { name: '+' })

    // Guerreiro tem pool suficiente ((2 + mod. Int 0) * 4 = 8 pontos), custo 1/graduação de classe — o teto de 4 bloqueia antes do pool.
    await user.click(aumentar)
    await user.click(aumentar)
    await user.click(aumentar)
    await user.click(aumentar)

    expect(within(linhaEscalada).getByText('4')).toBeInTheDocument()
    expect(aumentar).toBeDisabled()
  })
})

describe('PericiasStep — campo Outros', () => {
  it('edita o campo "Outros" de uma perícia e reflete no total exibido', async () => {
    const user = userEvent.setup()
    renderStep()

    const campoOutros = screen.getByLabelText('Outros em Escalada')
    await user.clear(campoOutros)
    await user.type(campoOutros, '3')

    const linhaEscalada = screen.getByText('Escalada').closest('li')!
    expect(linhaEscalada).toHaveTextContent('Total +3')
  })

  it('não consome o pool de pontos de perícia', async () => {
    const user = userEvent.setup()
    renderStep()

    const restanteAntes = screen.getByText(/pontos de perícia restantes/).textContent

    const campoOutros = screen.getByLabelText('Outros em Escalada')
    await user.clear(campoOutros)
    await user.type(campoOutros, '5')

    const restanteDepois = screen.getByText(/pontos de perícia restantes/).textContent
    expect(restanteDepois).toBe(restanteAntes)
  })
})
