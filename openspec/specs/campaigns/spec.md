## Purpose

Define o comportamento observável das telas de campanha: criação pelo mestre, convite por código, entrada do jogador, e a visão que cada papel recebe ao acessar uma campanha.

## Requirements

### Requirement: Criar campanha
Um usuário autenticado SHALL poder criar uma campanha informando um nome, sendo levado à sua tela de campanha (dashboard de mestre) ao concluir.

#### Scenario: Criação bem-sucedida
- **WHEN** o usuário preenche um nome válido e confirma a criação da campanha
- **THEN** a UI navega para a tela da campanha recém-criada, exibindo-a como uma campanha em que o usuário é mestre

#### Scenario: Nome vazio
- **WHEN** o usuário tenta confirmar a criação sem preencher um nome
- **THEN** a UI impede o envio e indica que o nome é obrigatório

### Requirement: Descrição opcional ao criar campanha
Um mestre SHALL poder informar uma descrição opcional ao criar uma campanha, além do nome.

#### Scenario: Mestre cria campanha com descrição
- **WHEN** o mestre preenche o campo de descrição ao criar uma campanha
- **THEN** a UI envia essa descrição junto com o nome e a campanha é criada normalmente

#### Scenario: Mestre cria campanha sem descrição
- **WHEN** o mestre deixa o campo de descrição em branco
- **THEN** a UI cria a campanha normalmente, sem exigir o preenchimento

### Requirement: Entrar em campanha aberta
Um usuário autenticado SHALL ver uma lista de campanhas abertas em que ainda não é membro — incluindo o nome do mestre e, quando definida, a descrição de cada uma — e poder entrar em qualquer uma delas com uma única ação, sem informar nenhum código.

#### Scenario: Usuário entra em uma campanha aberta
- **WHEN** o usuário escolhe "Entrar" numa campanha da lista de campanhas abertas
- **THEN** o sistema cria a membership como jogador e a ficha do usuário nessa campanha, e a UI navega direto para a ficha recém-criada

#### Scenario: Lista de campanhas abertas exclui campanhas onde já é membro
- **WHEN** o usuário já é mestre ou jogador de uma campanha
- **THEN** essa campanha não aparece na lista de "campanhas abertas" para esse usuário, mesmo continuando visível para outros usuários

#### Scenario: Nenhuma campanha aberta disponível
- **WHEN** não existe nenhuma campanha em que o usuário ainda não seja membro
- **THEN** a UI exibe um estado vazio explicativo na seção de campanhas abertas, não um erro

#### Scenario: Card de campanha aberta mostra mestre e descrição
- **WHEN** a lista de campanhas abertas é exibida
- **THEN** cada card mostra o nome do mestre responsável e, se definida, a descrição da campanha

#### Scenario: Campanha aberta sem descrição
- **WHEN** uma campanha aberta não tem descrição definida
- **THEN** o card mostra o nome do mestre normalmente, sem um espaço vazio ou rótulo "sem descrição" chamando atenção para a ausência

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

### Requirement: Jogador acessa diretamente sua ficha
Ao acessar uma campanha da qual é jogador, o usuário SHALL ser levado diretamente ao editor da sua própria ficha, não ao dashboard do mestre.

#### Scenario: Jogador acessa a campanha
- **WHEN** um usuário com papel de jogador numa campanha acessa a tela dessa campanha
- **THEN** a UI o direciona para o editor da sua ficha naquela campanha
