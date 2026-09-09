# world-lore Specification

## Purpose

Define as telas em que o mestre gerencia mundos e elementos de história, e em que os membros de uma campanha consultam a história publicada sem precisar perguntar ao mestre.

## Requirements

### Requirement: Mestre cria um mundo
Um usuário autenticado SHALL poder criar um mundo informando um nome, sendo levado à tela de gestão desse mundo ao concluir.

#### Scenario: Criação bem-sucedida
- **WHEN** o usuário preenche um nome válido e confirma a criação do mundo
- **THEN** a UI navega para a tela de gestão do mundo recém-criado

#### Scenario: Nome vazio
- **WHEN** o usuário tenta confirmar a criação sem preencher um nome
- **THEN** a UI impede o envio e indica que o nome é obrigatório

### Requirement: Lista dos próprios mundos
Um usuário autenticado SHALL ver a lista de mundos que criou, com uma ação visível para criar um novo.

#### Scenario: Usuário com mundos existentes
- **WHEN** o usuário acessa a tela "Meus mundos"
- **THEN** a UI lista cada mundo próprio pelo nome, com um link para sua tela de gestão

#### Scenario: Usuário sem nenhum mundo ainda
- **WHEN** o usuário acessa a tela "Meus mundos" sem ter criado nenhum
- **THEN** a UI exibe um estado vazio explicativo, com a ação de criar o primeiro mundo em destaque

### Requirement: Criação de elemento de história em rascunho
Na tela de gestão de um mundo, o dono SHALL poder criar um elemento de história informando título, categoria (campo de texto livre) e conteúdo, sendo adicionado à lista do mundo com o status "rascunho".

#### Scenario: Elemento criado com sucesso
- **WHEN** o dono do mundo preenche título, categoria e conteúdo e confirma a criação
- **THEN** a UI adiciona o elemento à lista do mundo, marcado como "rascunho"

#### Scenario: Categoria livre não exige valor de uma lista fixa
- **WHEN** o dono do mundo digita uma categoria que nunca foi usada antes nesse mundo
- **THEN** a UI aceita o valor digitado sem exigir escolha de uma lista predefinida

#### Scenario: Título ou conteúdo vazio
- **WHEN** o dono do mundo tenta confirmar a criação sem preencher título ou conteúdo
- **THEN** a UI impede o envio e indica os campos obrigatórios

### Requirement: Edição de elemento de história
Na tela de gestão de um mundo, o dono SHALL poder editar título, categoria e conteúdo de qualquer elemento, independentemente do status atual, sem que a edição altere esse status.

#### Scenario: Dono edita um elemento publicado
- **WHEN** o dono do mundo altera o conteúdo de um elemento já publicado e salva
- **THEN** a UI reflete o novo conteúdo mantendo o elemento com status "publicado"

### Requirement: Publicação de elemento de história
Na tela de gestão de um mundo, o dono SHALL poder publicar um elemento em rascunho por meio de uma ação dedicada, mudando seu status imediatamente.

#### Scenario: Dono publica um rascunho
- **WHEN** o dono do mundo aciona "Publicar" num elemento em rascunho
- **THEN** a UI atualiza o status do elemento para "publicado" sem exigir navegação adicional

### Requirement: Lista de elementos do mundo distingue rascunho de publicado
Na tela de gestão de um mundo, o dono SHALL ver todos os elementos do mundo (rascunho e publicados), com uma indicação visual clara do status de cada um.

#### Scenario: Mundo com elementos em ambos os status
- **WHEN** o dono do mundo acessa a lista de elementos
- **THEN** a UI marca visivelmente quais elementos estão em "rascunho" e quais estão "publicados"

### Requirement: Consulta da história publicada de uma campanha
Um membro (mestre ou jogador) de uma campanha vinculada a um mundo SHALL poder acessar uma tela listando os elementos publicados desse mundo, organizados por categoria, sem depender de nenhuma ação do mestre durante o acesso.

#### Scenario: Jogador consulta a história da campanha
- **WHEN** um jogador membro de uma campanha vinculada a um mundo acessa a tela "História da campanha"
- **THEN** a UI lista os elementos publicados desse mundo, agrupados por categoria

#### Scenario: Lista não inclui rascunhos para o jogador
- **WHEN** um jogador acessa a tela "História da campanha"
- **THEN** a UI não exibe nenhum elemento em status "rascunho"

#### Scenario: Campanha sem mundo vinculado
- **WHEN** um membro acessa a tela "História da campanha" de uma campanha sem mundo vinculado
- **THEN** a UI exibe um estado vazio explicativo, não um erro

#### Scenario: Mestre também consulta pela mesma tela
- **WHEN** o mestre dono do mundo acessa a tela "História da campanha" de uma de suas campanhas
- **THEN** a UI lista os mesmos elementos publicados que um jogador veria, a partir do mesmo ponto de navegação
