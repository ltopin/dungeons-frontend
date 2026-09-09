## ADDED Requirements

### Requirement: Retornar à lista de campanhas a partir de uma campanha aberta
A partir de qualquer tela dentro de uma campanha aberta — dashboard do mestre, ficha do jogador, trilha de criação de personagem, ou história da campanha — o usuário SHALL ter um link de navegação que o leva à lista de suas campanhas (`/campanhas`), independentemente do seu papel na campanha. Esse link SHALL levar sempre à lista, nunca de volta para uma rota que redirecione o usuário para a tela em que ele já estava.

#### Scenario: Jogador volta à lista a partir da ficha
- **WHEN** o jogador está no editor da própria ficha e aciona o link "Voltar às campanhas"
- **THEN** a UI navega para `/campanhas`, exibindo a lista de campanhas do usuário

#### Scenario: Jogador volta à lista a partir da trilha de criação de personagem
- **WHEN** o jogador está na trilha de criação de personagem e aciona o link de retorno
- **THEN** a UI navega para `/campanhas`

#### Scenario: Jogador volta à lista a partir da história da campanha
- **WHEN** o jogador está vendo a história da campanha e aciona o link de retorno
- **THEN** a UI navega para `/campanhas`

#### Scenario: Mestre volta à lista a partir do dashboard
- **WHEN** o mestre está no dashboard de uma campanha e aciona o link "Voltar às campanhas"
- **THEN** a UI navega para `/campanhas`
