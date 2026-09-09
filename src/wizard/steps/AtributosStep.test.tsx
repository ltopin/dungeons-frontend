import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as sheetsApi from '../../api/sheets'
import { AtributosStep } from './AtributosStep'
import { criarFichaFake } from '../../test/fixtures'

vi.mock('../../api/sheets')

const fichasMock = vi.mocked(sheetsApi)

function geralBase() {
  return {
    ...criarFichaFake().geral,
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  fichasMock.atualizarSecao.mockImplementation(async (_fichaId, _secao, patch) => patch as never)
})

function renderStep(onConcluir = vi.fn()) {
  render(
    <AtributosStep fichaId="ficha-1" geral={geralBase()} raca={undefined} onConcluir={onConcluir} />,
  )
  return onConcluir
}

async function selecionarModo(user: ReturnType<typeof userEvent.setup>, nome: string) {
  await user.click(screen.getByRole('button', { name: nome }))
}

describe('AtributosStep — modo Compra de pontos (regressão)', () => {
  it('aumenta um atributo com os botões +/- e atualiza o saldo restante', async () => {
    const user = userEvent.setup()
    renderStep()

    expect(screen.getByText(/pontos restantes/)).toHaveTextContent('15 de 15 pontos restantes')

    await user.click(screen.getByRole('button', { name: 'Aumentar Força' }))

    expect(screen.getByText(/pontos restantes/)).toHaveTextContent('14 de 15 pontos restantes')
    expect(screen.getByRole('button', { name: 'Confirmar atributos' })).toBeEnabled()
  })

  it('bloqueia um aumento que excederia o pool escolhido', async () => {
    const user = userEvent.setup()
    renderStep()

    // Pool "baixa fantasia" (10 pontos): custo acumulado de 10 até 16 é exatamente 10.
    await user.click(screen.getByRole('button', { name: 'Baixa fantasia (10 pontos)' }))
    const aumentar = screen.getByRole('button', { name: 'Aumentar Força' })
    for (let i = 0; i < 6; i++) {
      await user.click(aumentar)
    }
    expect(screen.getByText(/pontos restantes/)).toHaveTextContent('0 de 10 pontos restantes')

    // Próximo aumento (para 17, custo adicional 3) excederia o restante — não é aplicado.
    await user.click(aumentar)

    expect(screen.getByText(/pontos restantes/)).toHaveTextContent('0 de 10 pontos restantes')
    expect(screen.getByRole('button', { name: 'Confirmar atributos' })).toBeEnabled()
  })
})

describe('AtributosStep — modo Sortear', () => {
  it('apresenta seis valores sem nenhum distribuído e bloqueia a conclusão', async () => {
    const user = userEvent.setup()
    renderStep()
    await selecionarModo(user, 'Sortear')

    expect(screen.getByRole('button', { name: 'Confirmar atributos' })).toBeDisabled()
    expect(screen.getByLabelText('Valor sorteado para Força')).toHaveValue('')
  })

  it('distribuir os seis valores libera a conclusão da etapa', async () => {
    const user = userEvent.setup()
    renderStep()
    await selecionarModo(user, 'Sortear')

    const rotulos = ['Força', 'Destreza', 'Constituição', 'Inteligência', 'Sabedoria', 'Carisma']
    for (const rotulo of rotulos) {
      const select = screen.getByLabelText(`Valor sorteado para ${rotulo}`)
      const primeiraOpcao = within(select).getAllByRole('option')[1]
      await user.selectOptions(select, primeiraOpcao)
    }

    expect(screen.getByRole('button', { name: 'Confirmar atributos' })).toBeEnabled()
  })

  it('"Rolar novamente" descarta a distribuição atual', async () => {
    const user = userEvent.setup()
    renderStep()
    await selecionarModo(user, 'Sortear')

    const selectForca = screen.getByLabelText('Valor sorteado para Força')
    const primeiraOpcao = within(selectForca).getAllByRole('option')[1]
    await user.selectOptions(selectForca, primeiraOpcao)
    expect(selectForca).not.toHaveValue('')

    await user.click(screen.getByRole('button', { name: 'Rolar novamente' }))

    expect(screen.getByLabelText('Valor sorteado para Força')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Confirmar atributos' })).toBeDisabled()
  })
})

describe('AtributosStep — modo Manual', () => {
  it('aceita um valor dentro da faixa 3–18', async () => {
    const user = userEvent.setup()
    renderStep()
    await selecionarModo(user, 'Manual')

    const campoForca = screen.getByLabelText('Pontuação de Força')
    await user.clear(campoForca)
    await user.type(campoForca, '16')

    expect(campoForca).toHaveValue(16)
  })

  it('rejeita um valor fora da faixa 3–18, sem aplicá-lo ao atributo', async () => {
    const user = userEvent.setup()
    renderStep()
    await selecionarModo(user, 'Manual')

    const campoForca = screen.getByLabelText('Pontuação de Força')
    await user.clear(campoForca)
    await user.type(campoForca, '19')

    const containerForca = screen.getByText('Força').closest('.wizard-seal-com-controles') as HTMLElement
    expect(within(containerForca).getByText('10')).toBeInTheDocument()
  })

  it('permite concluir quando todos os campos estão dentro da faixa', async () => {
    const user = userEvent.setup()
    renderStep()
    await selecionarModo(user, 'Manual')

    expect(screen.getByRole('button', { name: 'Confirmar atributos' })).toBeEnabled()
  })
})
