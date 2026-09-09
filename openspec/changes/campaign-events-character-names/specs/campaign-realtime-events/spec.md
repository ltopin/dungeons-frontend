## ADDED Requirements

### Requirement: Atribuição do autor da rolagem por nome do personagem
Ao exibir um evento de rolagem de dados no painel de eventos, a UI SHALL identificar o personagem (ficha) que executou a rolagem pelo nome, exceto quando o evento for do próprio usuário vendo o painel, caso em que SHALL exibir "Você".

#### Scenario: Rolagem de outro jogador aparece com o nome do personagem
- **WHEN** um evento de rolagem de dados de outro membro da campanha chega ao painel de eventos
- **THEN** o painel exibe o nome do personagem (ficha) que executou aquela rolagem, em vez de um rótulo genérico como "Um jogador"

#### Scenario: Rolagem do próprio usuário continua identificada como "Você"
- **WHEN** o evento de rolagem de dados exibido no painel foi emitido pelo próprio usuário que está vendo o painel
- **THEN** o painel continua exibindo "Você" como autor, em vez do nome do personagem dele

## MODIFIED Requirements

### Requirement: Mestre pede uma rolagem
O mestre SHALL poder pedir que um jogador específico da campanha, ou todos os jogadores, façam uma rolagem determinada.

#### Scenario: Mestre pede rolagem a um jogador específico
- **WHEN** o mestre escolhe um jogador da campanha e confirma um pedido de rolagem para ele
- **THEN** a UI envia o pedido e ele passa a aparecer no painel de eventos de todos os membros da mesa, identificando o jogador solicitado pelo nome do personagem (ficha) dele

#### Scenario: Mestre pede rolagem a toda a mesa
- **WHEN** o mestre confirma um pedido de rolagem sem selecionar um jogador específico
- **THEN** a UI envia o pedido como direcionado a todos, e ele aparece no painel de eventos de todos os membros da mesa

#### Scenario: Jogador não vê o controle de pedido de rolagem
- **WHEN** um jogador (não mestre) acessa a tela da campanha
- **THEN** a UI não exibe o controle de pedido de rolagem para esse usuário
