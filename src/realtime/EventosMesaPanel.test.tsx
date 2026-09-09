import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EventosMesaPanel } from './EventosMesaPanel'
import type { EventoMesa } from './types'

vi.mock('../auth/session', () => ({ getContaAtual: () => ({ id: 'conta-1' }) }))

const rolagemDeOutroJogador: EventoMesa = {
  id: 'ev-1',
  campanhaId: 'camp-1',
  autorContaId: 'conta-2',
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
    autorNomePersonagem: 'Thorin',
  },
}

const rolagemDeOutroJogadorSemNome: EventoMesa = {
  ...rolagemDeOutroJogador,
  id: 'ev-1b',
  payload: { ...rolagemDeOutroJogador.payload, autorNomePersonagem: null },
}

const rolagemDoProprioUsuario: EventoMesa = {
  ...rolagemDeOutroJogador,
  id: 'ev-1c',
  autorContaId: 'conta-1',
  payload: { ...rolagemDeOutroJogador.payload, autorNomePersonagem: 'Thorin' },
}

const pedidoDoMestre: EventoMesa = {
  id: 'ev-2',
  campanhaId: 'camp-1',
  autorContaId: 'mestre-1',
  criadoEm: '2026-01-01T00:01:00.000Z',
  tipo: 'pedido_rolagem',
  payload: {
    destinatarioContaId: 'conta-2',
    destinatarioNomePersonagem: 'Thorin',
    descricao: 'Teste de Reflexos CD 15',
  },
}

const pedidoDoMestreSemNome: EventoMesa = {
  ...pedidoDoMestre,
  id: 'ev-2b',
  payload: { ...pedidoDoMestre.payload, destinatarioNomePersonagem: null },
}

const pedidoDoMestreParaTodos: EventoMesa = {
  ...pedidoDoMestre,
  id: 'ev-2c',
  payload: { destinatarioContaId: null, destinatarioNomePersonagem: null, descricao: 'Teste de Percepção' },
}

describe('EventosMesaPanel', () => {
  it('mostra o histórico em ordem, exibindo sempre o resultado vindo do evento (nunca um valor recalculado)', () => {
    render(<EventosMesaPanel eventos={[rolagemDeOutroJogador, pedidoDoMestre]} status="conectado" />)

    expect(screen.getByText(/Thorin rolou Furtividade/)).toBeInTheDocument()
    expect(screen.getByText('Resultado: 27')).toBeInTheDocument()
    expect(screen.getByText(/pediu uma rolagem para Thorin/)).toBeInTheDocument()
    expect(screen.getByText('Teste de Reflexos CD 15')).toBeInTheDocument()
  })

  it('identifica o autor da rolagem de outro jogador pelo nome do personagem', () => {
    render(<EventosMesaPanel eventos={[rolagemDeOutroJogador]} status="conectado" />)
    expect(screen.getByText(/^Thorin rolou Furtividade/)).toBeInTheDocument()
  })

  it('usa o rótulo genérico "Um jogador" quando a rolagem de outro jogador não traz o nome do personagem', () => {
    render(<EventosMesaPanel eventos={[rolagemDeOutroJogadorSemNome]} status="conectado" />)
    expect(screen.getByText(/^Um jogador rolou Furtividade/)).toBeInTheDocument()
  })

  it('mostra "Você" para a própria rolagem mesmo quando o nome do personagem está presente', () => {
    render(<EventosMesaPanel eventos={[rolagemDoProprioUsuario]} status="conectado" />)
    expect(screen.getByText(/^Você rolou Furtividade/)).toBeInTheDocument()
    expect(screen.queryByText(/^Thorin rolou Furtividade/)).not.toBeInTheDocument()
  })

  it('identifica o destinatário de um pedido de rolagem pelo nome do personagem', () => {
    render(<EventosMesaPanel eventos={[pedidoDoMestre]} status="conectado" />)
    expect(screen.getByText(/pediu uma rolagem para Thorin/)).toBeInTheDocument()
  })

  it('usa o rótulo genérico "um jogador" quando o pedido de rolagem a um destinatário específico não traz o nome do personagem', () => {
    render(<EventosMesaPanel eventos={[pedidoDoMestreSemNome]} status="conectado" />)
    expect(screen.getByText(/pediu uma rolagem para um jogador/)).toBeInTheDocument()
  })

  it('mantém "toda a mesa" para pedidos sem destinatário específico', () => {
    render(<EventosMesaPanel eventos={[pedidoDoMestreParaTodos]} status="conectado" />)
    expect(screen.getByText(/pediu uma rolagem para toda a mesa/)).toBeInTheDocument()
  })

  it('mostra o estado vazio quando conectado e sem eventos ainda', () => {
    render(<EventosMesaPanel eventos={[]} status="conectado" />)
    expect(screen.getByText('Nenhum evento nesta mesa ainda.')).toBeInTheDocument()
  })

  it('indica conexão indisponível sem quebrar o painel', () => {
    render(<EventosMesaPanel eventos={[]} status="indisponivel" />)
    expect(screen.getByRole('status')).toHaveTextContent('Conexão em tempo real indisponível.')
    expect(screen.getByText('Sem eventos disponíveis no momento.')).toBeInTheDocument()
  })

  it('indica reconectando sem descartar eventos já recebidos', () => {
    render(<EventosMesaPanel eventos={[rolagemDeOutroJogador]} status="reconectando" />)
    expect(screen.getByRole('status')).toHaveTextContent('Conexão perdida — tentando reconectar…')
    expect(screen.getByText(/rolou Furtividade/)).toBeInTheDocument()
  })

  it('oferece reconexão manual quando indisponível e onReconectar é passado', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const onReconectar = vi.fn()
    render(<EventosMesaPanel eventos={[]} status="indisponivel" onReconectar={onReconectar} />)

    await user.click(screen.getByRole('button', { name: 'Tentar reconectar' }))
    expect(onReconectar).toHaveBeenCalledTimes(1)
  })

  it('não mostra botão de reconexão quando conectando ou reconectando', () => {
    render(<EventosMesaPanel eventos={[]} status="conectando" onReconectar={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Tentar reconectar' })).not.toBeInTheDocument()
  })
})
