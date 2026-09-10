## ADDED Requirements

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
