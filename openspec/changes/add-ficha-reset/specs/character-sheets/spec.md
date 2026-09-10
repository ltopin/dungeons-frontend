## ADDED Requirements

### Requirement: Reiniciar ficha para o estado inicial de criação
Na aba Geral, a UI SHALL oferecer um controle para o jogador dono da ficha reiniciá-la por completo, apagando todos os dados e devolvendo-a ao estado inicial de criação de personagem. Este controle SHALL exigir confirmação explícita antes de executar a ação, dado seu caráter destrutivo e irreversível.

#### Scenario: Jogador aciona o controle de reiniciar
- **WHEN** o jogador dono clica no controle de reiniciar ficha
- **THEN** a UI exibe um modal de confirmação informando que todos os dados da ficha serão apagados e que a ação não pode ser desfeita, sem executar o reset ainda

#### Scenario: Jogador cancela a confirmação
- **WHEN** o jogador dono fecha ou cancela o modal de confirmação
- **THEN** nenhuma chamada de reset é feita e a ficha permanece inalterada

#### Scenario: Jogador confirma o reset com sucesso
- **WHEN** o jogador dono confirma o reset no modal e a chamada à API é bem-sucedida
- **THEN** a UI redireciona para a trilha de criação de personagem daquela campanha

#### Scenario: Falha ao resetar
- **WHEN** o jogador dono confirma o reset no modal e a chamada à API falha
- **THEN** a UI exibe uma mensagem de erro, mantém o modal disponível para nova tentativa, e não navega para a trilha de criação
