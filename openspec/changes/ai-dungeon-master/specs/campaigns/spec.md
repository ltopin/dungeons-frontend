## MODIFIED Requirements

### Requirement: Criar campanha
Um usuário autenticado SHALL poder criar uma campanha informando um nome, sendo levado à sua tela de campanha (dashboard de mestre) ao concluir. Opcionalmente, SHALL poder escolher um mundo próprio para vincular à campanha já na criação. Alternativamente, o usuário SHALL poder escolher gerar a campanha via IA, o que leva ao wizard de criação de mundo (`ai-world-generation`) em vez de criar a campanha e o dashboard de mestre diretamente.

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

#### Scenario: Usuário escolhe gerar campanha via IA
- **WHEN** o usuário escolhe a opção de gerar campanha via IA em vez de preencher nome e mundo manualmente
- **THEN** a UI navega para o wizard de criação de mundo, sem criar a campanha nem o dashboard de mestre diretamente
