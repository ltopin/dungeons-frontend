## MODIFIED Requirements

### Requirement: Acesso à história da campanha a partir do dashboard e da ficha

O dashboard do mestre, a tela de ficha do jogador e o assistente de criação de personagem SHALL exibir um link de navegação para a tela "História da campanha" daquela campanha, quando a campanha tiver um mundo vinculado.

#### Scenario: Mestre acessa a história pelo dashboard
- **WHEN** o mestre está no dashboard de uma campanha
- **THEN** a UI exibe um link visível para a história dessa campanha

#### Scenario: Jogador acessa a história pela ficha
- **WHEN** o jogador está na tela de edição da própria ficha
- **THEN** a UI exibe um link visível para a história da campanha à qual a ficha pertence

#### Scenario: Jogador acessa a história durante o assistente de criação
- **WHEN** o jogador está em qualquer etapa do assistente de criação de personagem de uma campanha com mundo vinculado
- **THEN** a UI exibe um link visível para a história dessa campanha
