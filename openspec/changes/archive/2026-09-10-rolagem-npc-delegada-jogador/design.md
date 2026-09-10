## Context

Ver proposal.md - Why. Hoje `PedidoRolagemPayload` (`src/realtime/types.ts:26-30`) só carrega `destinatarioContaId`/`destinatarioNomePersonagem`/`descricao`. Quando `destinatarioContaId` é `null` ("toda a mesa"), `EventosMesaPanel.tsx`'s `sugestaoParaPedido` (linha 99) casa a `descricao` contra o catálogo de rolagem **do próprio jogador** (`sugestaoRolagem.ts`) — pensado para pedidos tipo "teste de Reflexos", onde cada jogador rola pela própria ficha, cada um sua vez, de forma independente (ver `pedido-rolagem-sugere-pericia`/`pedido-rolagem-reacao-imediata`). Isso não serve para um pedido "pelo NPC": não há ficha de NPC para casar, e só uma resposta deve valer, não uma por jogador.

`EstadoRodada`/`CombateTurnoPanel` (`src/realtime/RodadaPanel.tsx:215-295`) já lida com `turnoAtualContaId === null` mostrando "Aguardando a vez de `<NPC>`" sem nenhum affordance de ação — isso continua assim; a ação em si acontece no painel de eventos via o pedido, não em `RodadaPanel`.

## Goals / Non-Goals

**Goals:**
- Permitir que o painel de eventos ofereça, a qualquer jogador, um botão de rolagem pronto (notação já calculada) para um pedido "pelo NPC", distinto do fluxo de sugestão por catálogo existente.
- Garantir que, assim que qualquer jogador resolver esse pedido, ele pare de ser acionável para os demais — sem exigir um campo de estado novo, só observando a lista de eventos já carregada.

**Non-Goals:**
- Implementar a lógica de corrida/vencedor único, o cálculo real do dado, o avanço de turno ou o plano B de timeout — tudo isso é responsabilidade do `dungeons-api` (change irmã). Este lado só consome o payload novo e desenha o botão.
- Resolver a ambiguidade pré-existente de `turnoAtualContaId: null` quando há mais de um NPC na iniciativa (o painel de rodada já não distingue "qual NPC" está agindo quando há vários com `contaId: null` — ver Risks). Não é alterado por esta change.

## Decisions

1. **Detectar "pedido pelo NPC" pela presença do novo campo `npcNome` no payload, não por um discriminador de tipo novo.** Um `pedido_rolagem` com `npcNome` preenchido é, por definição, um pedido de corrida/vencedor único com notação pronta; ausente, comporta-se exatamente como hoje. Mantém `EventoMesa`/`tipo` inalterado, seguindo o padrão aditivo já usado em `pedido-rolagem-reacao-imediata` (tag no payload em vez de novo enum).
   Alternativa considerada: um novo `tipo: 'pedido_rolagem_npc'` — rejeitada por forçar todo consumidor existente (painel de eventos, agrupamento por rodada) a tratar mais um tipo de evento sem ganho de comportamento sobre uma checagem de campo.

2. **O botão de rolagem do pedido de NPC não passa por `sugestaoRolagem.ts`.** `sugestaoParaPedido` ganha um branch anterior: se `evento.payload.npcNome` está presente, retorna diretamente uma entrada sintética `{ tipo: 'livre', rotulo: `Rolar pelo ${npcNome}`, notacao: evento.payload.notacao }` — sem checar `destinatarioContaId` nem casar contra o catálogo do jogador atual — visível a qualquer jogador, inclusive quem não tem ficha nessa campanha ainda carregada.
   Alternativa considerada: estender `sugerirEntradaDoPedido` para aceitar esse caso — rejeitada porque esse módulo existe para casar texto livre contra o catálogo de quem responde; o pedido de NPC não precisa de nenhum casamento, só repassar um valor já pronto.

3. **Resolução cross-cliente observada nos eventos já carregados, sem estado novo.** O botão deve desaparecer/desabilitar para todos assim que **qualquer** `rolagem_dados` referenciando esse `pedidoEventoId` aparecer na lista — não só quando o próprio viewer respondeu (diferente do `pedidosRespondidos` local em `EventosMesaPanel.tsx:276`, que existe para feedback otimista antes do evento voltar pelo socket). `sugestaoParaPedido`/`EventoItem` passam a checar `eventos.some(e => e.tipo === 'rolagem_dados' && e.payload.pedidoEventoId === evento.id)` para decidir se o botão do pedido de NPC deve continuar visível — igual ao que `contextoDaReacao` (linha 123) já faz para achar a rolagem original de uma reação.
   Alternativa considerada: um campo `resolvido`/`respondido_por` no payload do pedido, atualizado via um evento adicional — rejeitada por não ser necessária: a lista de eventos já é a fonte da verdade em tempo real, e o servidor (lado api) já vai rejeitar uma segunda rolagem contra o mesmo pedido de NPC de qualquer forma.

4. **`emitirRolagem` não ganha parâmetro novo.** A resposta ao pedido de NPC usa exatamente `emitirRolagem({ notacao: entrada.notacao }, pedidoEventoId)` — o mesmo caminho de rolagem livre já usado por `rolarEntradaCatalogo` (`CharacterSheetPage.tsx:204-211`) para entradas `tipo: 'livre'`. A distinção "isso é uma rolagem pelo NPC" vive inteiramente no `pedidoEventoId` correlacionado; o servidor decide o que fazer com isso.

## Risks / Trade-offs

- [Risco] Com múltiplos NPCs na iniciativa, `turnoAtualContaId: null` não distingue qual deles está agindo — um jogador vendo "Aguardando a vez de `<NPC>`" em `CombateTurnoPanel` pode ver o nome errado se houver mais de um NPC com esse mesmo estado. → Mitigação: nenhuma nesta change (limitação pré-existente, não introduzida aqui); o pedido de rolagem em si sempre traz o `npcNome` correto vindo da IA, então o botão de rolagem nunca fica ambíguo — só o texto informativo de "aguardando" em `RodadaPanel` pode.
- [Risco] Dois jogadores clicam quase simultaneamente no mesmo pedido de NPC antes do primeiro `rolagem_dados` voltar pelo socket — o frontend não previne a segunda tentativa de envio localmente. → Mitigação: aceitável; a autoridade e a rejeição da segunda tentativa são do servidor (change irmã), o pior caso aqui é um jogador ver um erro genérico de envio.

## Migration Plan

Aditivo: `npcNome`/`notacao` no payload de `pedido_rolagem` são opcionais; clientes antigos (ou o `MasterDashboard`, que não tem `catalogoRolagem`) simplesmente não creem o botão novo, sem quebrar o fluxo existente. Nenhuma migração de dados.
