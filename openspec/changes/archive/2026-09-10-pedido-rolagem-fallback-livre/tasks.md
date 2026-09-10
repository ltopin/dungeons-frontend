## 1. Controle de fallback no card do pedido

- [x] 1.1 Em `EventosMesaPanel.tsx`, criar um componente local (ex.: `RespostaLivrePedido`) com input de notação + botão, reaproveitando `isNotacaoDadosValida` de `./notacao` para validação e a mesma mensagem de erro já usada em `RolagemLivreForm`
- [x] 1.2 Extrair a checagem de destinatário hoje embutida em `sugestaoParaPedido` (evento é `pedido_rolagem`, `destinatarioContaId` nulo ou igual à conta atual) para uma função reaproveitável (ex.: `pedidoEhParaContaAtual`), usada tanto pela sugestão quanto pelo novo fallback
- [x] 1.3 Renderizar o fallback em `EventoItem` quando `pedidoEhParaContaAtual(evento)` e `onRolar` estiverem presentes — sem exigir `catalogoRolagem` — ao lado da sugestão automática quando ela também existir
- [x] 1.4 No submit do fallback, construir `{ tipo: 'livre', rotulo: 'Rolagem livre', notacao }` e chamar o mesmo `onRolar` já passado a `EventoItem` (o mesmo caminho usado pela sugestão), sem introduzir novo prop em `EventosMesaPanel`/`CharacterSheetPage`
- [x] 1.5 Garantir que o fallback NÃO seja desabilitado por `pedidosRespondidos`/`jaRolado` — permanece disponível no mesmo card após um envio, para suportar pedidos compostos (ex.: ataque, depois dano)

## 2. Testes

- [x] 2.1 Teste: pedido cujo texto não casa com o catálogo ainda exibe o fallback, e usá-lo envia a rolagem com o `pedido_evento_id` do card
- [x] 2.2 Teste: pedido cujo texto casa com o catálogo exibe sugestão automática E fallback simultaneamente
- [x] 2.3 Teste: duas rolagens enviadas pelo fallback do mesmo card (ex.: ataque, depois dano) carregam o mesmo `pedido_evento_id`, e o controle permanece habilitado entre as duas
- [x] 2.4 Teste: notação inválida no fallback é rejeitada localmente (mensagem de erro), sem chamar `onRolar`
- [x] 2.5 Teste: jogador que não é destinatário do pedido (nem é pedido para a mesa toda) não vê nenhum controle de rolagem nesse card
- [x] 2.6 Confirmar que nenhum teste existente de `EventosMesaPanel`/`useCampaignEvents` quebra com as mudanças

## 3. Validação

- [x] 3.1 `tsc -b` limpo
- [x] 3.2 `npm run build` limpo
- [x] 3.3 `vitest run` completo, sem regressões (1 falha pré-existente e não relacionada em `MasterDashboard.test.tsx`, confirmada também no HEAD limpo via `git stash`, antes de qualquer mudança desta sessão)
- [x] 3.4 `openspec validate pedido-rolagem-fallback-livre --strict`
