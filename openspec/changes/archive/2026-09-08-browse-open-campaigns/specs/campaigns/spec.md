## MODIFIED Requirements

### Requirement: Entrar em campanha aberta
Um usuário autenticado SHALL ver uma lista de campanhas abertas em que ainda não é membro e poder entrar em qualquer uma delas com uma única ação, sem informar nenhum código.

#### Scenario: Usuário entra em uma campanha aberta
- **WHEN** o usuário escolhe "Entrar" numa campanha da lista de campanhas abertas
- **THEN** o sistema cria a membership como jogador e a ficha do usuário nessa campanha, e a UI navega direto para a ficha recém-criada

#### Scenario: Lista de campanhas abertas exclui campanhas onde já é membro
- **WHEN** o usuário já é mestre ou jogador de uma campanha
- **THEN** essa campanha não aparece na lista de "campanhas abertas" para esse usuário, mesmo continuando visível para outros usuários

#### Scenario: Nenhuma campanha aberta disponível
- **WHEN** não existe nenhuma campanha em que o usuário ainda não seja membro
- **THEN** a UI exibe um estado vazio explicativo na seção de campanhas abertas, não um erro

## REMOVED Requirements

### Requirement: Gerar e revogar convite
**Reason**: O acesso a uma campanha não depende mais de um código de convite; toda campanha é aberta a qualquer usuário autenticado.
**Migration**: Remover a seção "Convite" do dashboard do mestre. Não há ação equivalente — a entrada agora acontece pela lista de campanhas abertas.

### Requirement: Entrar em campanha via código
**Reason**: Substituída pela entrada direta a partir da lista de campanhas abertas, sem código.
**Migration**: Remover a tela `/campanhas/entrar`. Jogadores entram a partir de "Campanhas abertas" em `CampaignsListPage`.
