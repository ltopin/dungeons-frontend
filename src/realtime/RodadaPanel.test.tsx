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
    { contaId: 'conta-1', nome: 'Você', resumoEnviado: true, resumoTexto: null },
    { contaId: 'conta-2', nome: 'Thorin', resumoEnviado: false, resumoTexto: null },
  ],
  ordemIniciativa: null,
  turnoAtualContaId: null,
}

describe('RodadaPanel — modo exploração', () => {
  it('indica quais jogadores ainda não escreveram o resumo da rodada', () => {
    render(<RodadaPanel rodada={RODADA_EXPLORACAO} onEnviarResumo={vi.fn()} onFecharRodada={vi.fn()} />)

    expect(screen.getByText(/Thorin: — aguardando/)).toBeInTheDocument()
    expect(screen.getByText(/Você: ✓/)).toBeInTheDocument()
  })

  it('exibe o texto do resumo de outro jogador em tempo real quando ele envia', () => {
    const rodada: EstadoRodada = {
      ...RODADA_EXPLORACAO,
      participantes: [
        { contaId: 'conta-1', nome: 'Você', resumoEnviado: true, resumoTexto: null },
        {
          contaId: 'conta-2',
          nome: 'Thorin',
          resumoEnviado: true,
          resumoTexto: 'Investigo o corredor à esquerda.',
        },
      ],
    }
    render(<RodadaPanel rodada={rodada} onEnviarResumo={vi.fn()} onFecharRodada={vi.fn()} />)

    expect(screen.getByText(/Thorin: Investigo o corredor à esquerda\./)).toBeInTheDocument()
  })

  it('reenvio do resumo substitui o texto exibido sem marca de "editado"', () => {
    const rodadaAntes: EstadoRodada = {
      ...RODADA_EXPLORACAO,
      participantes: [
        { contaId: 'conta-1', nome: 'Você', resumoEnviado: true, resumoTexto: null },
        { contaId: 'conta-2', nome: 'Thorin', resumoEnviado: true, resumoTexto: 'Abro a porta.' },
      ],
    }
    const { rerender } = render(
      <RodadaPanel rodada={rodadaAntes} onEnviarResumo={vi.fn()} onFecharRodada={vi.fn()} />,
    )
    expect(screen.getByText(/Thorin: Abro a porta\./)).toBeInTheDocument()

    const rodadaDepois: EstadoRodada = {
      ...rodadaAntes,
      participantes: [
        rodadaAntes.participantes[0],
        { contaId: 'conta-2', nome: 'Thorin', resumoEnviado: true, resumoTexto: 'Na verdade, investigo a porta.' },
      ],
    }
    rerender(<RodadaPanel rodada={rodadaDepois} onEnviarResumo={vi.fn()} onFecharRodada={vi.fn()} />)

    expect(screen.queryByText(/Abro a porta\./)).not.toBeInTheDocument()
    expect(screen.getByText(/Thorin: Na verdade, investigo a porta\./)).toBeInTheDocument()
    expect(screen.queryByText(/editad/i)).not.toBeInTheDocument()
  })

  it('pede confirmação antes de fechar a rodada com jogadores pendentes, sem fechar de imediato', async () => {
    const onFecharRodada = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<RodadaPanel rodada={RODADA_EXPLORACAO} onEnviarResumo={vi.fn()} onFecharRodada={onFecharRodada} />)

    await user.click(screen.getByRole('button', { name: 'Fechar rodada' }))

    expect(onFecharRodada).not.toHaveBeenCalled()
    const confirmacao = screen.getByRole('alertdialog', { name: 'Confirmar fechamento da rodada' })
    expect(confirmacao).toHaveTextContent('1 jogador ainda não respondeu: Thorin.')
  })

  it('fecha a rodada ao confirmar mesmo com jogadores pendentes', async () => {
    const onFecharRodada = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<RodadaPanel rodada={RODADA_EXPLORACAO} onEnviarResumo={vi.fn()} onFecharRodada={onFecharRodada} />)

    await user.click(screen.getByRole('button', { name: 'Fechar rodada' }))
    await user.click(screen.getByRole('button', { name: 'Fechar mesmo assim' }))

    expect(onFecharRodada).toHaveBeenCalledTimes(1)
  })

  it('cancelar a confirmação volta ao botão simples sem fechar a rodada', async () => {
    const onFecharRodada = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<RodadaPanel rodada={RODADA_EXPLORACAO} onEnviarResumo={vi.fn()} onFecharRodada={onFecharRodada} />)

    await user.click(screen.getByRole('button', { name: 'Fechar rodada' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onFecharRodada).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fechar rodada' })).toBeInTheDocument()
  })

  it('fecha a rodada direto, sem pedir confirmação, quando ninguém está pendente', async () => {
    const onFecharRodada = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    const rodadaCompleta: EstadoRodada = {
      ...RODADA_EXPLORACAO,
      participantes: RODADA_EXPLORACAO.participantes.map((p) => ({ ...p, resumoEnviado: true })),
    }
    render(<RodadaPanel rodada={rodadaCompleta} onEnviarResumo={vi.fn()} onFecharRodada={onFecharRodada} />)

    await user.click(screen.getByRole('button', { name: 'Fechar rodada' }))

    expect(onFecharRodada).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('envia o resumo digitado pelo jogador', async () => {
    const onEnviarResumo = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<RodadaPanel rodada={RODADA_EXPLORACAO} onEnviarResumo={onEnviarResumo} onFecharRodada={vi.fn()} />)

    await user.type(screen.getByLabelText('Seu resumo (já enviado)'), 'Investigo o corredor à esquerda.')
    await user.click(screen.getByRole('button', { name: 'Atualizar resumo' }))

    expect(onEnviarResumo).toHaveBeenCalledWith('Investigo o corredor à esquerda.')
  })

  it('preenche o campo com o próprio resumo já salvo, em vez de deixá-lo em branco', () => {
    const rodada: EstadoRodada = {
      ...RODADA_EXPLORACAO,
      participantes: [
        { contaId: 'conta-1', nome: 'Você', resumoEnviado: true, resumoTexto: 'Abro a porta com cuidado.' },
        RODADA_EXPLORACAO.participantes[1],
      ],
    }
    render(<RodadaPanel rodada={rodada} onEnviarResumo={vi.fn()} onFecharRodada={vi.fn()} />)

    expect(screen.getByLabelText('Seu resumo (já enviado)')).toHaveValue('Abro a porta com cuidado.')
  })

  it('mantém o texto no campo depois de reenviar, em vez de limpá-lo', async () => {
    const onEnviarResumo = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<RodadaPanel rodada={RODADA_EXPLORACAO} onEnviarResumo={onEnviarResumo} onFecharRodada={vi.fn()} />)

    const campo = screen.getByLabelText('Seu resumo (já enviado)')
    await user.type(campo, 'Investigo o corredor à esquerda.')
    await user.click(screen.getByRole('button', { name: 'Atualizar resumo' }))

    expect(campo).toHaveValue('Investigo o corredor à esquerda.')
  })

  it('limpa o campo ao virar uma nova rodada', () => {
    const rodada: EstadoRodada = {
      ...RODADA_EXPLORACAO,
      participantes: [
        { contaId: 'conta-1', nome: 'Você', resumoEnviado: true, resumoTexto: 'Abro a porta com cuidado.' },
        RODADA_EXPLORACAO.participantes[1],
      ],
    }
    const { rerender } = render(<RodadaPanel rodada={rodada} onEnviarResumo={vi.fn()} onFecharRodada={vi.fn()} />)
    expect(screen.getByLabelText('Seu resumo (já enviado)')).toHaveValue('Abro a porta com cuidado.')

    const proximaRodada: EstadoRodada = {
      ...rodada,
      rodada: rodada.rodada + 1,
      participantes: rodada.participantes.map((p) => ({ ...p, resumoEnviado: false, resumoTexto: null })),
    }
    rerender(<RodadaPanel rodada={proximaRodada} onEnviarResumo={vi.fn()} onFecharRodada={vi.fn()} />)

    expect(screen.getByLabelText('Seu resumo da rodada')).toHaveValue('')
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

  it('não exibe campo de ação fora do próprio turno', () => {
    render(<RodadaPanel rodada={RODADA_COMBATE} onEnviarResumo={vi.fn()} onFecharRodada={vi.fn()} />)
    expect(screen.queryByLabelText('Ação do turno')).not.toBeInTheDocument()
  })

  it('envia a ação digitada no próprio turno', async () => {
    const onEnviarResumo = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(
      <RodadaPanel
        rodada={{ ...RODADA_COMBATE, turnoAtualContaId: 'conta-1' }}
        onEnviarResumo={onEnviarResumo}
        onFecharRodada={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('O que seu personagem faz neste turno?'), 'Ataco o goblin com a espada.')
    await user.click(screen.getByRole('button', { name: 'Agir' }))

    expect(onEnviarResumo).toHaveBeenCalledWith('Ataco o goblin com a espada.')
  })

  it('mostra erro quando o envio da ação falha', async () => {
    const onEnviarResumo = vi.fn().mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    render(
      <RodadaPanel
        rodada={{ ...RODADA_COMBATE, turnoAtualContaId: 'conta-1' }}
        onEnviarResumo={onEnviarResumo}
        onFecharRodada={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('O que seu personagem faz neste turno?'), 'Ataco o goblin.')
    await user.click(screen.getByRole('button', { name: 'Agir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível enviar sua ação agora.')
  })
})
