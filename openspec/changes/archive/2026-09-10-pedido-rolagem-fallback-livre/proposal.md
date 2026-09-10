## Why

Hoje, um jogador só consegue responder a um `pedido_rolagem` de forma correlacionada (isto é, enviando `pedido_evento_id` para que a reação pontual da IA dispare) quando o texto do pedido casa com uma entrada já cadastrada no catálogo de rolagem da própria ficha (perícia, nome exato de um ataque, ou uma das frases fixas de resistência/iniciativa). Quando não há casamento — jogador sem o item cadastrado, pedido de dano (que não existe no catálogo), ou qualquer frase que a heurística de texto não reconheça — nenhum controle de rolagem correlacionada aparece no card do pedido. O jogador só tem a "Rolagem livre" da tela, que nunca envia `pedido_evento_id`, então a rolagem não é vinculada ao pedido e a reação pontual da IA nunca dispara. Isso deixa pedidos legítimos sem nenhuma forma de resposta correlacionada — incluindo o caso comum de um pedido composto (ex.: "role o ataque; se acertar, role o dano"), cuja segunda rolagem nunca tem catálogo correspondente.

## What Changes

- Todo card de `pedido_rolagem` em `EventosMesaPanel` passa a exibir, além da sugestão automática (quando houver casamento), um controle de rolagem livre — notação de dados (ex.: `1d12+3`) — sempre disponível para o destinatário do pedido (o jogador específico, ou qualquer jogador quando o pedido é para a mesa toda).
- Uma rolagem enviada por esse controle carrega o `pedido_evento_id` daquele card específico, exatamente como a sugestão automática já faz hoje.
- A sugestão automática existente (`sugerirEntradaDoPedido`) não é removida nem alterada em seu comportamento — continua sendo o atalho preferencial quando encontra um casamento; o novo controle é um fallback sempre presente, não um substituto.
- **BREAKING**: nenhuma — é uma adição de UI; nenhum contrato de evento existente muda.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `campaign-realtime-events`: o card de `pedido_rolagem` no painel de eventos de mesa ganha um controle de rolagem livre correlacionada, sempre disponível para o destinatário, além da sugestão automática já existente.

## Impact

- `src/realtime/EventosMesaPanel.tsx`: `EventoItem` passa a renderizar, para eventos `pedido_rolagem` cujo destinatário seja o usuário atual (ou pedido para a mesa toda), um pequeno formulário de notação livre que chama `onRolar`/`emitirRolagem` com o `pedido_evento_id` do card, reaproveitando a mesma validação de notação já usada em `RolagemLivreForm`.
- `src/routes/CharacterSheetPage.tsx`: nenhuma mudança de contrato — o `onRolar` já repassado a `EventosMesaPanel` (`rolarEntradaCatalogo`) já aceita `pedidoEventoId`; o novo controle usa o mesmo caminho, com uma notação livre em vez de uma entrada de catálogo.
- Nenhuma mudança em `dungeons-api` — o backend já aceita `pedido_evento_id` em qualquer rolagem (item de ficha ou notação livre), via `pedido-rolagem-reacao-imediata`.
