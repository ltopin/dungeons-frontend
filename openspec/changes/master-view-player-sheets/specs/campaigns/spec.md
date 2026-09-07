## MODIFIED Requirements

### Requirement: Dashboard do mestre
Ao acessar uma campanha da qual é mestre, o usuário SHALL ver uma aba para cada ficha registrada nela, e poder abrir qualquer uma em modo somente leitura.

#### Scenario: Campanha com fichas registradas
- **WHEN** o mestre acessa uma campanha com um ou mais jogadores já registrados
- **THEN** a UI exibe uma aba por ficha, rotulada com o nome do personagem e o nome do jogador dono da ficha

#### Scenario: Campanha sem jogadores ainda
- **WHEN** o mestre acessa uma campanha em que nenhum jogador entrou
- **THEN** a UI exibe um estado vazio explicativo, não um erro, e nenhuma aba de ficha

#### Scenario: Mestre abre a ficha de um jogador
- **WHEN** o mestre seleciona a aba de uma ficha
- **THEN** a UI navega para a rota dedicada dessa ficha, exibindo-a em modo somente leitura
