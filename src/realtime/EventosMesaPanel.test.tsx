import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CatalogoRolagemEntry } from './catalogoRolagem'
import { EventosMesaPanel } from './EventosMesaPanel'
import type { EventoMesa } from './types'

vi.mock('../auth/session', () => ({ getContaAtual: () => ({ id: 'conta-1' }) }))

const rolagemDeOutroJogador: EventoMesa = {
  id: 'ev-1',
  campanhaId: 'camp-1',
  autorContaId: 'conta-2',
  origem: 'jogador',
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
    pedidoEventoId: null,
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
  origem: 'jogador',
  criadoEm: '2026-01-01T00:01:00.000Z',
  tipo: 'pedido_rolagem',
  payload: {
    destinatarioContaId: 'conta-2',
    destinatarioNomePersonagem: 'Thorin',
    descricao: 'Teste de Reflexos CD 15',
    npcNome: null,
    notacao: null,
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
  payload: {
    destinatarioContaId: null,
    destinatarioNomePersonagem: null,
    descricao: 'Teste de Percepção',
    npcNome: null,
    notacao: null,
  },
}

const pedidoPeloNpc: EventoMesa = {
  id: 'ev-npc-1',
  campanhaId: 'camp-1',
  autorContaId: null,
  origem: 'ia',
  criadoEm: '2026-01-01T00:10:00.000Z',
  tipo: 'pedido_rolagem',
  payload: {
    destinatarioContaId: null,
    destinatarioNomePersonagem: null,
    descricao: 'O goblin ataca com a adaga',
    npcNome: 'Goblin',
    notacao: '1d20+4',
  },
}

const rolagemQueRespondePedidoNpc: EventoMesa = {
  id: 'ev-npc-2',
  campanhaId: 'camp-1',
  autorContaId: 'conta-2',
  origem: 'jogador',
  criadoEm: '2026-01-01T00:10:30.000Z',
  tipo: 'rolagem_dados',
  payload: {
    tipoItem: null,
    itemId: null,
    itemNome: null,
    notacao: '1d20+4',
    dados: [12],
    bonus: 4,
    resultado: 16,
    autorNomePersonagem: 'Thorin',
    pedidoEventoId: 'ev-npc-1',
  },
}

const narracaoDaIA: EventoMesa = {
  id: 'ev-3',
  campanhaId: 'camp-1',
  autorContaId: null,
  origem: 'ia',
  criadoEm: '2026-01-01T00:02:00.000Z',
  tipo: 'narracao_ia',
  payload: {
    texto: 'A porta range e uma fumaça verde escapa pela fresta.',
    rodada: 4,
    pedidoEventoId: null,
    respondenteContaId: null,
    respondenteNomePersonagem: null,
  },
}

const pedidoRespondido: EventoMesa = {
  id: 'ev-11',
  campanhaId: 'camp-1',
  autorContaId: 'mestre-1',
  origem: 'ia',
  criadoEm: '2026-01-01T00:09:00.000Z',
  tipo: 'pedido_rolagem',
  payload: {
    destinatarioContaId: null,
    destinatarioNomePersonagem: null,
    descricao: 'Teste de Reflexos CD 15',
    npcNome: null,
    notacao: null,
  },
}

const rolagemQueResponde: EventoMesa = {
  id: 'ev-12',
  campanhaId: 'camp-1',
  autorContaId: 'conta-2',
  origem: 'jogador',
  criadoEm: '2026-01-01T00:09:30.000Z',
  tipo: 'rolagem_dados',
  payload: {
    tipoItem: 'pericia',
    itemId: 'p1',
    itemNome: 'Reflexos',
    notacao: '1d20',
    dados: [14],
    bonus: 2,
    resultado: 16,
    autorNomePersonagem: 'Thorin',
    pedidoEventoId: 'ev-11',
  },
}

const reacaoAoPedido: EventoMesa = {
  id: 'ev-13',
  campanhaId: 'camp-1',
  autorContaId: null,
  origem: 'ia',
  criadoEm: '2026-01-01T00:09:40.000Z',
  tipo: 'narracao_ia',
  payload: {
    texto: 'Thorin desvia por pouco da lâmina giratória.',
    rodada: 4,
    pedidoEventoId: 'ev-11',
    respondenteContaId: 'conta-2',
    respondenteNomePersonagem: 'Thorin',
  },
}

const reacaoSemPedidoCarregado: EventoMesa = {
  ...reacaoAoPedido,
  id: 'ev-14',
  payload: { ...reacaoAoPedido.payload, pedidoEventoId: 'ev-nao-carregado' },
}

const resumoDeOutroJogador: EventoMesa = {
  id: 'ev-5',
  campanhaId: 'camp-1',
  autorContaId: 'conta-2',
  origem: 'jogador',
  criadoEm: '2026-01-01T00:04:00.000Z',
  tipo: 'resumo_rodada',
  payload: { texto: 'Investigo o corredor à esquerda.', rodada: 4, autorNomePersonagem: 'Thorin' },
}

const acaoDeTurnoDeOutroJogador: EventoMesa = {
  id: 'ev-6',
  campanhaId: 'camp-1',
  autorContaId: 'conta-2',
  origem: 'jogador',
  criadoEm: '2026-01-01T00:05:00.000Z',
  tipo: 'acao_turno',
  payload: { texto: 'Ataco o goblin com a espada.', rodada: 5, autorNomePersonagem: 'Thorin' },
}

const narracaoDaRodadaSeguinte: EventoMesa = {
  ...narracaoDaIA,
  id: 'ev-3b',
  criadoEm: '2026-01-01T00:06:00.000Z',
  payload: {
    texto: 'Os goblins avançam pelo corredor.',
    rodada: 5,
    pedidoEventoId: null,
    respondenteContaId: null,
    respondenteNomePersonagem: null,
  },
}

const chegadaDeThorin: EventoMesa = {
  id: 'ev-7',
  campanhaId: 'camp-1',
  autorContaId: null,
  origem: 'ia',
  criadoEm: '2026-01-01T00:07:00.000Z',
  tipo: 'narracao_chegada',
  payload: {
    texto: 'Thorin desperta em uma taverna enfumaçada, sem lembrar como chegou ali.',
    personagemId: 'ficha-2',
    personagemNome: 'Thorin',
  },
}

const mudancaParaCombate: EventoMesa = {
  id: 'ev-4',
  campanhaId: 'camp-1',
  autorContaId: null,
  origem: 'ia',
  criadoEm: '2026-01-01T00:03:00.000Z',
  tipo: 'mudanca_modo',
  payload: {
    modoAnterior: 'exploracao',
    modoNovo: 'combate',
    ordemIniciativa: [{ contaId: 'conta-2', nome: 'Thorin', iniciativa: 18 }],
  },
}

const pedidoParaContaAtual: EventoMesa = {
  id: 'ev-8',
  campanhaId: 'camp-1',
  autorContaId: 'mestre-1',
  origem: 'jogador',
  criadoEm: '2026-01-01T00:08:00.000Z',
  tipo: 'pedido_rolagem',
  payload: {
    destinatarioContaId: 'conta-1',
    destinatarioNomePersonagem: 'Você',
    descricao: 'Teste de Percepção...',
    npcNome: null,
    notacao: null,
  },
}

const pedidoDeResistenciaParaContaAtual: EventoMesa = {
  ...pedidoParaContaAtual,
  id: 'ev-9',
  payload: { ...pedidoParaContaAtual.payload, descricao: 'Teste de Resistência de Vontade CD 15' },
}

const pedidoSemCorrespondenciaParaContaAtual: EventoMesa = {
  ...pedidoParaContaAtual,
  id: 'ev-10',
  payload: { ...pedidoParaContaAtual.payload, descricao: 'Descreva o que você vê na sala' },
}

const percepcao: CatalogoRolagemEntry = {
  rotulo: 'Percepção',
  tipo: 'item',
  tipoItem: 'pericia',
  itemId: 'p1',
  valor: '1d20+7',
}
const vontade: CatalogoRolagemEntry = { rotulo: 'Vontade', tipo: 'livre', notacao: '1d20+3' }
const catalogoRolagem: CatalogoRolagemEntry[] = [percepcao, vontade]

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

  it('exibe a narração da IA com o texto da rodada', () => {
    render(<EventosMesaPanel eventos={[narracaoDaIA]} status="conectado" />)
    expect(screen.getByText('Narração da rodada 4')).toBeInTheDocument()
    expect(screen.getByText('A porta range e uma fumaça verde escapa pela fresta.')).toBeInTheDocument()
  })

  it('exibe a mudança de modo para combate gerada pela IA', () => {
    render(<EventosMesaPanel eventos={[mudancaParaCombate]} status="conectado" />)
    expect(screen.getByText('A IA iniciou o combate')).toBeInTheDocument()
  })

  it('marca visualmente eventos de origem IA, distinguindo de eventos humanos', () => {
    render(<EventosMesaPanel eventos={[rolagemDeOutroJogador, narracaoDaIA]} status="conectado" />)
    const marcadoresIA = screen.getAllByLabelText('Evento gerado pela IA')
    expect(marcadoresIA).toHaveLength(1)
  })

  it('exibe o resumo de rodada de outro jogador com texto e autor', () => {
    render(<EventosMesaPanel eventos={[resumoDeOutroJogador]} status="conectado" />)
    expect(screen.getByText('Resumo de Thorin')).toBeInTheDocument()
    expect(screen.getByText('Investigo o corredor à esquerda.')).toBeInTheDocument()
  })

  it('exibe a ação de turno de outro jogador com texto e autor', () => {
    render(<EventosMesaPanel eventos={[acaoDeTurnoDeOutroJogador]} status="conectado" />)
    expect(screen.getByText('Ação de Thorin')).toBeInTheDocument()
    expect(screen.getByText('Ataco o goblin com a espada.')).toBeInTheDocument()
  })

  it('insere um divisor de rodada na transição entre rodadas', () => {
    render(<EventosMesaPanel eventos={[narracaoDaIA, resumoDeOutroJogador, narracaoDaRodadaSeguinte]} status="conectado" />)

    expect(screen.getByText('Rodada 4')).toBeInTheDocument()
    expect(screen.getByText('Rodada 5')).toBeInTheDocument()
    expect(screen.getAllByRole('separator')).toHaveLength(2)
  })

  it('não insere um novo divisor para eventos sem número de rodada no payload', () => {
    render(
      <EventosMesaPanel
        eventos={[narracaoDaIA, rolagemDeOutroJogador, pedidoDoMestre]}
        status="conectado"
      />,
    )

    expect(screen.getAllByRole('separator')).toHaveLength(1)
    expect(screen.getByText('Rodada 4')).toBeInTheDocument()
  })

  it('exibe a narração de chegada com o texto e o nome do personagem', () => {
    render(<EventosMesaPanel eventos={[chegadaDeThorin]} status="conectado" />)
    expect(screen.getByText('Chegada de Thorin')).toBeInTheDocument()
    expect(
      screen.getByText('Thorin desperta em uma taverna enfumaçada, sem lembrar como chegou ali.'),
    ).toBeInTheDocument()
  })

  it('marca a narração de chegada com um selo distinto do selo de narração de rodada da IA', () => {
    render(<EventosMesaPanel eventos={[narracaoDaIA, chegadaDeThorin]} status="conectado" />)
    expect(screen.getByLabelText('Narração de chegada')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Evento gerado pela IA')).toHaveLength(1)
  })

  it('não insere divisor de rodada para a narração de chegada, mesmo entre eventos de rodadas diferentes', () => {
    render(
      <EventosMesaPanel eventos={[narracaoDaIA, chegadaDeThorin, narracaoDaRodadaSeguinte]} status="conectado" />,
    )

    expect(screen.getAllByRole('separator')).toHaveLength(2)
    expect(screen.getByText('Rodada 4')).toBeInTheDocument()
    expect(screen.getByText('Rodada 5')).toBeInTheDocument()
  })

  it('exibe a sugestão de uma perícia (rótulo e total) com botão de rolar quando o pedido corresponde a um item do catálogo', () => {
    render(
      <EventosMesaPanel
        eventos={[pedidoParaContaAtual]}
        status="conectado"
        catalogoRolagem={catalogoRolagem}
        onRolar={vi.fn()}
      />,
    )

    expect(screen.getByText('Percepção: 1d20+7')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rolar' })).toBeInTheDocument()
  })

  it('exibe a sugestão de um teste derivado (rótulo e notação) com botão de rolar quando o pedido corresponde a uma entrada derivada', () => {
    render(
      <EventosMesaPanel
        eventos={[pedidoDeResistenciaParaContaAtual]}
        status="conectado"
        catalogoRolagem={catalogoRolagem}
        onRolar={vi.fn()}
      />,
    )

    expect(screen.getByText('Vontade: 1d20+3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rolar' })).toBeInTheDocument()
  })

  it('chama onRolar com a entrada do catálogo certa ao clicar no botão da sugestão', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const onRolar = vi.fn()
    render(
      <EventosMesaPanel
        eventos={[pedidoParaContaAtual]}
        status="conectado"
        catalogoRolagem={catalogoRolagem}
        onRolar={onRolar}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Rolar' }))
    expect(onRolar).toHaveBeenCalledWith(percepcao, 'ev-8')
  })

  it('desabilita o botão da sugestão depois de clicar, para não rolar de novo pelo mesmo pedido', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    render(
      <EventosMesaPanel
        eventos={[pedidoParaContaAtual]}
        status="conectado"
        catalogoRolagem={catalogoRolagem}
        onRolar={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Rolar' }))

    const botao = screen.getByRole('button', { name: 'Rolado' })
    expect(botao).toBeDisabled()
  })

  it('não exibe botão de sugestão quando a descrição do pedido não corresponde a nenhuma entrada do catálogo', () => {
    render(
      <EventosMesaPanel
        eventos={[pedidoSemCorrespondenciaParaContaAtual]}
        status="conectado"
        catalogoRolagem={catalogoRolagem}
        onRolar={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Rolar' })).not.toBeInTheDocument()
  })

  it('não exibe sugestão para um pedido direcionado a outro jogador, mesmo que o texto corresponda a uma entrada do catálogo', () => {
    render(
      <EventosMesaPanel
        eventos={[pedidoDoMestre]}
        status="conectado"
        catalogoRolagem={[{ rotulo: 'Reflexos', tipo: 'livre', notacao: '1d20+2' }]}
        onRolar={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Rolar' })).not.toBeInTheDocument()
  })

  it('continua funcionando sem sugestão quando catalogoRolagem/onRolar não são passados (uso atual no MasterDashboard)', () => {
    render(<EventosMesaPanel eventos={[pedidoParaContaAtual]} status="conectado" />)

    expect(screen.getByText('Teste de Percepção...')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rolar' })).not.toBeInTheDocument()
  })

  it('associa visualmente uma reação pontual ao pedido e à rolagem que a originaram', () => {
    render(
      <EventosMesaPanel
        eventos={[pedidoRespondido, rolagemQueResponde, reacaoAoPedido]}
        status="conectado"
      />,
    )

    expect(screen.getByText('Reação a Thorin')).toBeInTheDocument()
    expect(screen.getByText('Thorin desvia por pouco da lâmina giratória.')).toBeInTheDocument()
    expect(screen.getByLabelText('Reação a um pedido de rolagem')).toBeInTheDocument()
    expect(screen.getByText(/Em resposta a: Teste de Reflexos CD 15/)).toBeInTheDocument()
    expect(screen.getByText(/Reflexos: 16/)).toBeInTheDocument()
  })

  it('exibe a reação normalmente, sem agrupamento visual, quando o pedido original não está na lista carregada', () => {
    render(<EventosMesaPanel eventos={[reacaoSemPedidoCarregado]} status="conectado" />)

    expect(screen.getByText('Reação a Thorin')).toBeInTheDocument()
    expect(screen.getByText('Thorin desvia por pouco da lâmina giratória.')).toBeInTheDocument()
    expect(screen.queryByText(/Em resposta a:/)).not.toBeInTheDocument()
  })

  it('não confunde uma reação pontual com o selo de narração de rodada da IA', () => {
    render(<EventosMesaPanel eventos={[reacaoAoPedido]} status="conectado" />)

    expect(screen.queryByLabelText('Evento gerado pela IA')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Reação a um pedido de rolagem')).toBeInTheDocument()
  })

  it('exibe o fallback de rolagem livre e envia a rolagem vinculada ao pedido mesmo sem correspondência no catálogo', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const onRolar = vi.fn()
    render(
      <EventosMesaPanel
        eventos={[pedidoSemCorrespondenciaParaContaAtual]}
        status="conectado"
        catalogoRolagem={catalogoRolagem}
        onRolar={onRolar}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Rolar' })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Notação (ex.: 2d6+3)'), '1d12+3')
    await user.click(screen.getByRole('button', { name: 'Rolar livre' }))

    expect(onRolar).toHaveBeenCalledWith({ tipo: 'livre', rotulo: 'Rolagem livre', notacao: '1d12+3' }, 'ev-10')
  })

  it('exibe a sugestão automática e o fallback de rolagem livre simultaneamente quando o pedido corresponde ao catálogo', () => {
    render(
      <EventosMesaPanel
        eventos={[pedidoParaContaAtual]}
        status="conectado"
        catalogoRolagem={catalogoRolagem}
        onRolar={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Rolar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rolar livre' })).toBeInTheDocument()
  })

  it('permite enviar duas rolagens pelo fallback do mesmo card, ambas vinculadas ao mesmo pedido', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const onRolar = vi.fn()
    render(
      <EventosMesaPanel
        eventos={[pedidoSemCorrespondenciaParaContaAtual]}
        status="conectado"
        catalogoRolagem={catalogoRolagem}
        onRolar={onRolar}
      />,
    )

    const input = screen.getByLabelText('Notação (ex.: 2d6+3)')
    const botao = screen.getByRole('button', { name: 'Rolar livre' })

    await user.type(input, '1d20+5')
    await user.click(botao)
    await user.type(input, '1d12+3')
    await user.click(botao)

    expect(onRolar).toHaveBeenCalledTimes(2)
    expect(onRolar).toHaveBeenNthCalledWith(1, { tipo: 'livre', rotulo: 'Rolagem livre', notacao: '1d20+5' }, 'ev-10')
    expect(onRolar).toHaveBeenNthCalledWith(2, { tipo: 'livre', rotulo: 'Rolagem livre', notacao: '1d12+3' }, 'ev-10')
  })

  it('rejeita notação inválida no fallback localmente, sem chamar onRolar', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const onRolar = vi.fn()
    render(
      <EventosMesaPanel
        eventos={[pedidoSemCorrespondenciaParaContaAtual]}
        status="conectado"
        catalogoRolagem={catalogoRolagem}
        onRolar={onRolar}
      />,
    )

    await user.type(screen.getByLabelText('Notação (ex.: 2d6+3)'), 'abc')
    await user.click(screen.getByRole('button', { name: 'Rolar livre' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Notação de dados inválida')
    expect(onRolar).not.toHaveBeenCalled()
  })

  it('não exibe nenhum controle de rolagem, nem sugestão nem fallback, para quem não é destinatário do pedido', () => {
    render(
      <EventosMesaPanel
        eventos={[pedidoDoMestre]}
        status="conectado"
        catalogoRolagem={[{ rotulo: 'Reflexos', tipo: 'livre', notacao: '1d20+2' }]}
        onRolar={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Rolar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rolar livre' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Notação (ex.: 2d6+3)')).not.toBeInTheDocument()
  })

  it('exibe o botão de rolagem pronto pelo NPC para um jogador sem catálogo casando', () => {
    render(<EventosMesaPanel eventos={[pedidoPeloNpc]} status="conectado" onRolar={vi.fn()} />)

    expect(screen.getByText('Rolar pelo Goblin: 1d20+4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rolar' })).toBeInTheDocument()
  })

  it('dispara a rolagem do NPC com a notação pronta ao clicar no botão', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const onRolar = vi.fn()
    render(<EventosMesaPanel eventos={[pedidoPeloNpc]} status="conectado" onRolar={onRolar} />)

    await user.click(screen.getByRole('button', { name: 'Rolar' }))
    expect(onRolar).toHaveBeenCalledWith({ tipo: 'livre', rotulo: 'Rolar pelo Goblin', notacao: '1d20+4' }, 'ev-npc-1')
  })

  it('esconde o botão de rolagem pelo NPC depois que outro jogador já respondeu ao pedido', () => {
    render(
      <EventosMesaPanel
        eventos={[pedidoPeloNpc, rolagemQueRespondePedidoNpc]}
        status="conectado"
        onRolar={vi.fn()}
      />,
    )

    expect(screen.queryByText('Rolar pelo Goblin: 1d20+4')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rolar' })).not.toBeInTheDocument()
  })

  it('mantém o comportamento de sugestão por catálogo para um pedido sem npcNome (regressão)', () => {
    render(
      <EventosMesaPanel
        eventos={[pedidoParaContaAtual]}
        status="conectado"
        catalogoRolagem={catalogoRolagem}
        onRolar={vi.fn()}
      />,
    )

    expect(screen.getByText('Percepção: 1d20+7')).toBeInTheDocument()
    expect(screen.queryByText(/Rolar pelo/)).not.toBeInTheDocument()
  })
})
