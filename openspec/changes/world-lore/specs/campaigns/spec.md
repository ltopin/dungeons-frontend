## MODIFIED Requirements

### Requirement: Criar campanha
Um usuário autenticado SHALL poder criar uma campanha informando um nome, sendo levado à sua tela de campanha (dashboard de mestre) ao concluir. Opcionalmente, SHALL poder escolher um mundo próprio para vincular à campanha já na criação.

#### Scenario: Criação bem-sucedida
- **WHEN** o usuário preenche um nome válido e confirma a criação da campanha
- **THEN** a UI navega para a tela da campanha recém-criada, exibindo-a como uma campanha em que o usuário é mestre

#### Scenario: Nome vazio
- **WHEN** o usuário tenta confirmar a criação sem preencher um nome
- **THEN** a UI impede o envio e indica que o nome é obrigatório

#### Scenario: Criação com mundo vinculado
- **WHEN** o usuário escolhe um de seus mundos no seletor opcional ao criar a campanha
- **THEN** a campanha é criada já vinculada a esse mundo

#### Scenario: Criação sem escolher mundo
- **WHEN** o usuário não possui nenhum mundo criado, ou não seleciona nenhum
- **THEN** a UI cria a campanha normalmente, sem exigir a escolha de um mundo

## ADDED Requirements

### Requirement: Vincular ou trocar o mundo de uma campanha existente
No dashboard do mestre, o mestre da campanha SHALL poder vincular um mundo próprio a uma campanha sem mundo vinculado, ou trocar o mundo já vinculado por outro mundo próprio.

#### Scenario: Mestre vincula mundo a campanha sem mundo
- **WHEN** o mestre escolhe um de seus mundos na campanha que ainda não tem mundo vinculado
- **THEN** a UI confirma o vínculo e passa a exibir esse mundo como o mundo da campanha

#### Scenario: Mestre troca o mundo vinculado
- **WHEN** o mestre escolhe outro mundo próprio numa campanha que já tem um mundo vinculado
- **THEN** a UI substitui o vínculo pelo novo mundo escolhido

### Requirement: Acesso à história da campanha a partir do dashboard e da ficha
O dashboard do mestre e a tela de ficha do jogador SHALL exibir um link de navegação para a tela "História da campanha" daquela campanha.

#### Scenario: Mestre acessa a história pelo dashboard
- **WHEN** o mestre está no dashboard de uma campanha
- **THEN** a UI exibe um link visível para a história dessa campanha

#### Scenario: Jogador acessa a história pela ficha
- **WHEN** o jogador está na tela de edição da própria ficha
- **THEN** a UI exibe um link visível para a história da campanha à qual a ficha pertence
