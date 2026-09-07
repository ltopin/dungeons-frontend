## ADDED Requirements

### Requirement: Visualização somente leitura da ficha para o mestre
O mestre de uma campanha SHALL poder visualizar a ficha completa de qualquer jogador registrado nela, em modo somente leitura, sem poder editar nenhum campo.

#### Scenario: Mestre abre a ficha de um jogador
- **WHEN** o mestre acessa a rota de uma ficha da sua campanha
- **THEN** a UI exibe todas as seções da ficha (Geral, Combate, Talentos, Ataques, Perícias, Magias, Inventário, Notas) com os valores atuais, sem nenhum campo editável nem indicador de autosave

#### Scenario: Nenhum controle de edição disponível
- **WHEN** o mestre está na visualização somente leitura de uma ficha
- **THEN** a UI não oferece nenhum controle de edição (inputs habilitados, botões de adicionar/remover linha) em nenhuma seção
