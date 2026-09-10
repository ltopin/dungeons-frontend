## 1. Tipos e mapeamento de payload

- [x] 1.1 Adicionar `npcNome: string | null` e `notacao: string | null` a `PedidoRolagemPayload` em `src/realtime/types.ts`, com o mapeamento de/para o wire (`npc_nome`/`notacao`), retrocompatível com pedidos sem esses campos.

## 2. Botão de rolagem pelo NPC no painel de eventos

- [x] 2.1 Em `EventosMesaPanel.tsx`, adicionar em `sugestaoParaPedido` um branch anterior ao casamento por catálogo: quando `evento.payload.npcNome` está presente, retornar diretamente uma entrada sintética `{ tipo: 'livre', rotulo: 'Rolar pelo <npcNome>', notacao: evento.payload.notacao }`, disponível a qualquer jogador (sem checar `destinatarioContaId` nem `catalogoRolagem`).
- [x] 2.2 Ajustar a lógica de "já resolvido" para esse botão: visível/habilitado apenas enquanto nenhum `rolagem_dados` da lista de eventos já carregada referencia esse `pedidoEventoId` (não apenas o estado local `pedidosRespondidos` do próprio viewer).
- [x] 2.3 Garantir que o texto/rótulo distingue visualmente "pedido pelo NPC" de um pedido comum dirigido a jogador(es), reaproveitando os estilos já existentes de card de pedido/sugestão.

## 3. Testes

- [x] 3.1 Teste: pedido com `npcNome`+`notacao` exibe o botão pronto para um jogador sem catálogo casando (ex.: MasterDashboard/jogador sem ficha carregada).
- [x] 3.2 Teste: clicar no botão dispara `emitirRolagem({ notacao }, pedidoEventoId)`.
- [x] 3.3 Teste: após um `rolagem_dados` referenciando o mesmo `pedidoEventoId` aparecer na lista (de outro autor), o botão some/desabilita para o viewer atual.
- [x] 3.4 Teste: um `pedido_rolagem` sem `npcNome` continua se comportando exatamente como hoje (regressão do fluxo de sugestão por catálogo).

## 4. Verificação manual

- [ ] 4.1 Bloqueado até o lado `dungeons-api` desta change estar implantado: validar ponta a ponta que o pedido pelo NPC aparece para qualquer jogador em combate real, que só a primeira resposta é aceita, e que o plano B (sem resposta) segue narrando via IA sem travar o combate.
