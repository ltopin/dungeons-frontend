## Purpose

Define o comportamento observável das telas de campanha: criação pelo mestre, convite por código, entrada do jogador, e a visão que cada papel recebe ao acessar uma campanha.

## ADDED Requirements

### Requirement: Criar campanha
Um usuário autenticado SHALL poder criar uma campanha informando um nome, sendo levado à sua tela de campanha (dashboard de mestre) ao concluir.

#### Scenario: Criação bem-sucedida
- **WHEN** o usuário preenche um nome válido e confirma a criação da campanha
- **THEN** a UI navega para a tela da campanha recém-criada, exibindo-a como uma campanha em que o usuário é mestre

#### Scenario: Nome vazio
- **WHEN** o usuário tenta confirmar a criação sem preencher um nome
- **THEN** a UI impede o envio e indica que o nome é obrigatório

### Requirement: Gerar e revogar convite
Na tela de uma campanha da qual é mestre, o usuário SHALL poder gerar um código de convite e revogar um convite ativo.

#### Scenario: Gerar convite
- **WHEN** o mestre solicita um novo convite na tela da campanha
- **THEN** a UI exibe o código/link gerado, disponível para copiar

#### Scenario: Revogar convite ativo
- **WHEN** o mestre revoga um convite que estava ativo
- **THEN** a UI deixa de exibir aquele código como válido

### Requirement: Entrar em campanha via código
Um usuário SHALL poder informar um código de convite numa tela dedicada para entrar em uma campanha como jogador.

#### Scenario: Código válido
- **WHEN** o usuário submete um código de convite ativo
- **THEN** a UI navega para a ficha do usuário nessa campanha

#### Scenario: Código inválido ou inativo
- **WHEN** o usuário submete um código que não existe ou foi revogado
- **THEN** a UI exibe uma mensagem de erro e permanece na tela de entrada, sem navegar

### Requirement: Dashboard do mestre
Ao acessar uma campanha da qual é mestre, o usuário SHALL ver uma lista resumida das fichas registradas nela.

#### Scenario: Campanha com fichas registradas
- **WHEN** o mestre acessa uma campanha com um ou mais jogadores já registrados
- **THEN** a UI exibe um resumo de cada ficha (ao menos nome do personagem e classe/nível)

#### Scenario: Campanha sem jogadores ainda
- **WHEN** o mestre acessa uma campanha em que nenhum jogador entrou
- **THEN** a UI exibe um estado vazio explicativo, não um erro

### Requirement: Jogador acessa diretamente sua ficha
Ao acessar uma campanha da qual é jogador, o usuário SHALL ser levado diretamente ao editor da sua própria ficha, não ao dashboard do mestre.

#### Scenario: Jogador acessa a campanha
- **WHEN** um usuário com papel de jogador numa campanha acessa a tela dessa campanha
- **THEN** a UI o direciona para o editor da sua ficha naquela campanha
