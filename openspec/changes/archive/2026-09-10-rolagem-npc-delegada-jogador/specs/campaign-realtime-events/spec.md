## ADDED Requirements

### Requirement: Painel de eventos oferece rolagem pronta para pedido pelo NPC
Quando um `pedido_rolagem` traz uma notação e um nome de NPC já preenchidos pela IA, o painel de eventos SHALL exibir, para qualquer jogador da mesa, um botão de rolagem pronto com essa notação — sem exigir casamento com o catálogo de rolagem do jogador que está vendo o painel.

#### Scenario: Jogador vê o botão de rolagem pelo NPC
- **WHEN** um `pedido_rolagem` cujo payload traz nome de NPC e notação chega ao painel de eventos
- **THEN** qualquer jogador da mesa vê um botão de rolagem identificado pelo nome do NPC, já com a notação pronta, independentemente do próprio catálogo de rolagem

#### Scenario: Jogador aciona o botão
- **WHEN** um jogador clica no botão de rolagem de um pedido pelo NPC
- **THEN** a UI envia uma rolagem livre com a notação do pedido, referenciando o id desse pedido, pelo mesmo caminho já usado para responder a outros pedidos de rolagem

### Requirement: Botão de rolagem pelo NPC deixa de ser acionável após a primeira resposta
Diferente de um pedido dirigido à mesa toda onde cada jogador responde de forma independente, um pedido pelo NPC SHALL admitir apenas uma resposta válida — assim que qualquer jogador responder, o painel de eventos SHALL deixar de oferecer o botão de rolagem desse pedido para os demais jogadores.

#### Scenario: Outro jogador já respondeu
- **WHEN** o painel de eventos de um jogador já contém uma rolagem de dados referenciando o pedido pelo NPC, emitida por outro jogador
- **THEN** esse jogador não vê mais (ou vê desabilitado) o botão de rolagem para esse mesmo pedido

#### Scenario: Ninguém respondeu ainda
- **WHEN** nenhuma rolagem de dados referenciando o pedido pelo NPC apareceu ainda no painel de eventos
- **THEN** o botão de rolagem desse pedido permanece visível e acionável para qualquer jogador da mesa
