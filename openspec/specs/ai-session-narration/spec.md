# ai-session-narration Specification

## Purpose

Dá aos membros de uma campanha conduzida por IA a interface para jogar rodadas em modo exploração (resumo por jogador, fechamento de rodada) e para agir e acompanhar o combate por turnos que a IA conduz, com o estado da rodada sempre observável e atualizado para todos os membros conectados.

## Requirements

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
A narração gerada pela IA para uma rodada SHALL aparecer no painel de eventos de mesa da campanha, junto com rolagens e pedidos de rolagem, assim que produzida pelo servidor, sem exigir que o membro recarregue a página.

#### Scenario: Narração chega para os membros conectados
- **WHEN** o servidor conclui a narração de uma rodada
- **THEN** o painel de eventos de todos os membros conectados exibe a narração, sem precisar recarregar a página

### Requirement: Estado da rodada sempre observável pelos membros
Ao acessar ou permanecer na tela da campanha, todo membro presente SHALL ver o estado corrente da rodada — modo (exploração ou combate), quem já respondeu ou, em combate, ordem de iniciativa e turno atual — refletindo qualquer mudança ocorrida enquanto a tela estava aberta, sem exigir recarregar a página.

#### Scenario: Membro abre a tela no meio de uma rodada em andamento
- **WHEN** um membro acessa a tela da campanha enquanto já existe uma rodada aberta
- **THEN** o sistema exibe o estado corrente dessa rodada, incluindo quem já respondeu, sem que o membro precise agir para "descobrir" o estado

#### Scenario: Estado muda enquanto a tela está aberta
- **WHEN** outro membro envia um resumo, fecha a rodada, ou o combate avança de turno
- **THEN** todo membro com a tela aberta vê essa mudança refletida sem recarregar a página

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

### Requirement: Jogador declara a própria ação no turno de combate
Quando é o turno de um jogador em modo combate, o sistema SHALL exibir a ele um campo de texto livre para descrever a ação do personagem naquele turno, e SHALL enviar essa ação para resolução assim que confirmada.

#### Scenario: Jogador age no próprio turno
- **WHEN** um jogador cujo turno está ativo digita e confirma sua ação
- **THEN** o sistema envia a ação para resolução e exibe um estado de carregamento até a narração daquele turno chegar

#### Scenario: Turno avança após a ação
- **WHEN** a ação de um jogador é resolvida
- **THEN** o sistema atualiza o turno corrente para o próximo combatente, incluindo turnos de NPCs resolvidos automaticamente pela IA

### Requirement: Narração de chegada individual por personagem
Ao acessar pela primeira vez a tela de rodada de uma campanha mestrada por IA, cada personagem SHALL receber sua própria narração de chegada, gerada a partir do contexto daquele personagem, antes de o sistema pedir seu resumo da rodada corrente. Essa narração SHALL ser gerada uma única vez por personagem.

#### Scenario: Personagem acessa a rodada pela primeira vez
- **WHEN** um jogador cujo personagem ainda não tem narração de chegada acessa a tela de rodada
- **THEN** o sistema exibe um estado de carregamento e, ao concluir, mostra a narração de chegada desse personagem antes do campo de resumo da rodada

#### Scenario: Personagem reacessa a tela depois da primeira vez
- **WHEN** um jogador cujo personagem já tem narração de chegada acessa novamente a tela de rodada
- **THEN** o sistema não dispara uma nova geração, e o campo de resumo da rodada fica disponível imediatamente

#### Scenario: Vários personagens chegam em momentos diferentes
- **WHEN** personagens distintos da mesma campanha acessam a tela de rodada pela primeira vez em momentos diferentes
- **THEN** cada um recebe sua própria narração de chegada, independente dos demais já terem ou não recebido a sua

### Requirement: Narração de chegada visível a toda a mesa
A narração de chegada de um personagem SHALL aparecer no painel de eventos de mesa de todos os membros conectados, identificando de qual personagem é a chegada, e distinta visualmente da narração de rodada.

#### Scenario: Outro membro vê a chegada de um personagem
- **WHEN** a narração de chegada de um personagem é gerada
- **THEN** o painel de eventos de todos os membros conectados à campanha exibe esse evento, identificando o nome do personagem que chegou
