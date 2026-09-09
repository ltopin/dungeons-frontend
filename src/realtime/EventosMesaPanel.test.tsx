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
  },
}

const pedidoDoMestre: EventoMesa = {
  id: 'ev-2',
  campanhaId: 'camp-1',
  autorContaId: 'mestre-1',
  criadoEm: '2026-01-01T00:01:00.000Z',
  tipo: 'pedido_rolagem',
  payload: { destinatarioContaId: 'conta-2', descricao: 'Teste de Reflexos CD 15' },
}

describe('EventosMesaPanel', () => {
  it('mostra o histórico em ordem, exibindo sempre o resultado vindo do evento (nunca um valor recalculado)', () => {
    render(<EventosMesaPanel eventos={[rolagemDeOutroJogador, pedidoDoMestre]} status="conectado" />)

    expect(screen.getByText(/rolou Furtividade/)).toBeInTheDocument()
    expect(screen.getByText('Resultado: 27')).toBeInTheDocument()
    expect(screen.getByText(/pediu uma rolagem para um jogador/)).toBeInTheDocument()
    expect(screen.getByText('Teste de Reflexos CD 15')).toBeInTheDocument()
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
})
