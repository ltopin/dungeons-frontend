## ADDED Requirements

### Requirement: Painel de eventos exibe reação pontual a pedido de rolagem respondido
Quando a IA transmite uma narração de reação pontual vinculada a um `pedido_rolagem`, o painel de eventos SHALL exibi-la assim que recebida, associada visualmente ao pedido e à rolagem que a originaram, sem que o membro precise fechar a rodada ou aguardar o avanço do turno.

#### Scenario: Reação chega para um pedido dirigido ao jogador atual
- **WHEN** o jogador atual responde, via rolagem, a um `pedido_rolagem` do qual é destinatário direto
- **THEN** o painel de eventos exibe a narração de reação assim que chega pelo socket, associada ao card do pedido/rolagem correspondente

#### Scenario: Reação chega para um pedido dirigido à mesa toda
- **WHEN** um `pedido_rolagem` dirigido à mesa toda é respondido por qualquer jogador presente
- **THEN** o painel de eventos de todos os membros conectados exibe a reação correspondente a essa resposta específica, assim que produzida, sem esperar outros jogadores responderem ao mesmo pedido

#### Scenario: Rolagem em resposta a um pedido informa a correlação
- **WHEN** o jogador dispara uma rolagem a partir do pedido de rolagem exibido no painel
- **THEN** o frontend envia o id desse pedido junto com a rolagem, permitindo ao servidor vincular a reação gerada a esse pedido

#### Scenario: Painel de rodada permanece inalterado
- **WHEN** uma reação pontual é exibida no painel de eventos
- **THEN** o estado de rodada/turno exibido em `RodadaPanel` (resumo, fechamento, ordem de turnos) não é afetado por essa reação
