import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RodadaPanel } from './RodadaPanel'
import type { EstadoRodada } from './rodada'

vi.mock('../auth/session', () => ({ getContaAtual: () => ({ id: 'conta-1' }) }))

const RODADA_EXPLORACAO: EstadoRodada = {
  modo: 'exploracao',
  rodada: 3,
  participantes: [
    { contaId: 'conta-1', nome: 'Você', resumoEnviado: true },
    { contaId: 'conta-2', nome: 'Thorin', resumoEnviado: false },
  ],
  ordemIniciativa: null,
  turnoAtualContaId: null,
}

describe('RodadaPanel — modo exploração', () => {
  it('indica quais jogadores ainda não escreveram o resumo da rodada', () => {
    render(<RodadaPanel rodada={RODADA_EXPLORACAO} onEnviarResumo={vi.fn()} onFecharRodada={vi.fn()} />)

    expect(screen.getByText(/Thorin — aguardando/)).toBeInTheDocument()
    expect(screen.getByText(/Você ✓/)).toBeInTheDocument()
  })

  it('permite fechar a rodada mesmo com jogadores presentes sem resumo enviado', async () => {
    const onFecharRodada = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<RodadaPanel rodada={RODADA_EXPLORACAO} onEnviarResumo={vi.fn()} onFecharRodada={onFecharRodada} />)

    expect(screen.getByText(/Ainda faltam responder: Thorin/)).toBeInTheDocument()
    const botaoFechar = screen.getByRole('button', { name: 'Fechar rodada' })
    expect(botaoFechar).toBeEnabled()

    await user.click(botaoFechar)
    expect(onFecharRodada).toHaveBeenCalledTimes(1)
  })

  it('envia o resumo digitado pelo jogador', async () => {
    const onEnviarResumo = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<RodadaPanel rodada={RODADA_EXPLORACAO} onEnviarResumo={onEnviarResumo} onFecharRodada={vi.fn()} />)

    await user.type(screen.getByLabelText('Seu resumo (já enviado)'), 'Investigo o corredor à esquerda.')
    await user.click(screen.getByRole('button', { name: 'Atualizar resumo' }))

    expect(onEnviarResumo).toHaveBeenCalledWith('Investigo o corredor à esquerda.')
  })
})

describe('RodadaPanel — modo combate', () => {
  const RODADA_COMBATE: EstadoRodada = {
    modo: 'combate',
    rodada: 5,
    participantes: [],
    ordemIniciativa: [
      { contaId: 'conta-2', nome: 'Thorin', iniciativa: 18 },
      { contaId: 'conta-1', nome: 'Você', iniciativa: 12 },
    ],
    turnoAtualContaId: 'conta-2',
  }

  it('exibe a ordem de iniciativa e destaca o turno corrente', () => {
    render(<RodadaPanel rodada={RODADA_COMBATE} onEnviarResumo={vi.fn()} onFecharRodada={vi.fn()} />)

    expect(screen.getByText('Thorin')).toBeInTheDocument()
    expect(screen.getByText('Você')).toBeInTheDocument()
    expect(screen.getByText('Aguardando a vez de Thorin.')).toBeInTheDocument()
  })

  it('avisa quando é a vez do jogador atual', () => {
    render(
      <RodadaPanel
        rodada={{ ...RODADA_COMBATE, turnoAtualContaId: 'conta-1' }}
        onEnviarResumo={vi.fn()}
        onFecharRodada={vi.fn()}
      />,
    )
    expect(screen.getByText('É a sua vez de agir.')).toBeInTheDocument()
  })
})
