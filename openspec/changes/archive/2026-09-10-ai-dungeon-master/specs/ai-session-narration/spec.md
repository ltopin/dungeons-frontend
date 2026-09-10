## Purpose

Dá aos jogadores de uma campanha conduzida por IA a interface para jogar rodadas em modo exploração (resumo por jogador, fechamento de rodada) e acompanhar a narração e o combate por turnos que a IA conduz.

## ADDED Requirements

### Requirement: Campo de resumo de rodada por jogador
Em modo exploração, o sistema SHALL exibir a cada jogador um campo de texto livre para registrar o resumo da própria rodada, e SHALL indicar, para os demais membros, quem já escreveu seu resumo nessa rodada.

#### Scenario: Jogador escreve o resumo da rodada
- **WHEN** um jogador digita e confirma o resumo da própria rodada
- **THEN** o sistema registra esse resumo e passa a indicá-lo como "já respondeu" para os demais membros

#### Scenario: Indicação de quem falta responder
- **WHEN** um membro visualiza a tela da rodada corrente
- **THEN** o sistema mostra quais jogadores presentes ainda não escreveram o resumo daquela rodada

### Requirement: Fechar a rodada dispara a narração
Qualquer membro da campanha SHALL poder fechar a rodada corrente a qualquer momento, mesmo com jogadores que ainda não escreveram resumo, disparando a narração da IA sobre aquela rodada.

#### Scenario: Membro fecha a rodada
- **WHEN** qualquer membro aciona o botão de fechar a rodada
- **THEN** o sistema envia o fechamento e exibe um estado de carregamento até a narração chegar

#### Scenario: Fechar rodada com jogador sem resumo
- **WHEN** um membro fecha a rodada com um ou mais jogadores presentes que não escreveram resumo
- **THEN** o sistema permite o fechamento normalmente, sem exigir que todos tenham respondido

### Requirement: Narração exibida no painel de eventos
A narração gerada pela IA para uma rodada SHALL aparecer no painel de eventos de mesa da campanha, junto com rolagens e pedidos de rolagem, assim que transmitida pelo servidor.

#### Scenario: Narração chega para os membros conectados
- **WHEN** o servidor transmite a narração de uma rodada
- **THEN** o painel de eventos de todos os membros conectados exibe a narração, sem precisar recarregar a página

### Requirement: UI de turnos durante o modo combate
Quando a campanha está em modo combate, o sistema SHALL exibir a ordem de iniciativa e o turno corrente, e SHALL habilitar os controles de ação apenas para o jogador cujo turno está ativo.

#### Scenario: Campanha entra em modo combate
- **WHEN** a IA inicia um combate durante a narração
- **THEN** o sistema passa a exibir a ordem de iniciativa e destaca o turno corrente

#### Scenario: Controles de ação fora do turno
- **WHEN** um jogador cujo turno não está ativo visualiza a tela de combate
- **THEN** o sistema exibe os controles de ação desabilitados para ele, indicando de quem é a vez

#### Scenario: Combate termina
- **WHEN** a IA encerra o combate durante a narração
- **THEN** o sistema volta a exibir a tela de rodada em modo exploração, com o campo de resumo disponível novamente
