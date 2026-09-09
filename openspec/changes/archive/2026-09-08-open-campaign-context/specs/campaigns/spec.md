## ADDED Requirements

### Requirement: Descrição opcional ao criar campanha
Um mestre SHALL poder informar uma descrição opcional ao criar uma campanha, além do nome.

#### Scenario: Mestre cria campanha com descrição
- **WHEN** o mestre preenche o campo de descrição ao criar uma campanha
- **THEN** a UI envia essa descrição junto com o nome e a campanha é criada normalmente

#### Scenario: Mestre cria campanha sem descrição
- **WHEN** o mestre deixa o campo de descrição em branco
- **THEN** a UI cria a campanha normalmente, sem exigir o preenchimento

## MODIFIED Requirements

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
