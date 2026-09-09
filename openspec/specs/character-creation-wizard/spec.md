# character-creation-wizard Specification

## Purpose

Guia o jogador na criação de um personagem D&D 3.5/Pathfinder 1e passo a passo (raça, classe, atributos, perícias, talentos, magias, equipamento), consumindo o compêndio real do `dungeons-api` para raça/classe/perícia/talento/magia e validação bloqueante onde é automaticamente verificável, em vez de exigir que o jogador preencha a ficha em branco sabendo as regras de cabeça.

## Requirements

### Requirement: Entrada no assistente para ficha nova

O sistema SHALL direcionar o jogador ao assistente de criação quando, na carga inicial da ficha, o nome do personagem, a classe e a raça estiverem todos vazios ou nulos, e SHALL manter essa decisão de roteamento fixa durante a sessão de edição (sem recomputar a cada sincronização de autosave).

#### Scenario: Jogador entra numa campanha com ficha em branco
- **WHEN** um jogador acessa a ficha de uma campanha e nome do personagem, classe e raça estão todos vazios ou nulos
- **THEN** o sistema exibe o assistente de criação de personagem em vez da ficha manual

#### Scenario: Jogador com personagem já iniciado acessa a ficha
- **WHEN** um jogador acessa a ficha de uma campanha e nome do personagem, classe ou raça já têm algum valor
- **THEN** o sistema exibe a ficha manual diretamente, sem redirecionar para o assistente

### Requirement: Raça, classe, perícias, talentos e magias vêm do compêndio da API

O sistema SHALL buscar as raças, classes, perícias e talentos do compêndio do `dungeons-api` (`GET /compendio/racas|classes|pericias|talentos`) ao carregar o assistente, e SHALL buscar as magias filtradas por classe e nível (`GET /compendio/magias?classe=&nivel=`) ao entrar na etapa de Magias com uma classe conjuradora escolhida.

#### Scenario: Carregamento do compêndio
- **WHEN** o assistente é aberto
- **THEN** o sistema busca raças, classes, perícias e talentos do compêndio e exibe as opções de Raça e Classe assim que a busca retorna

#### Scenario: Falha ao carregar o compêndio ou a ficha
- **WHEN** a busca da ficha ou do compêndio falha
- **THEN** o sistema exibe uma mensagem de erro em vez de um assistente com listas vazias

### Requirement: Navegação livre entre etapas

O sistema SHALL exibir todas as etapas do assistente numa barra lateral com o estado de cada uma (pendente, concluída, ou não aplicável), e SHALL permitir que o jogador navegue para qualquer etapa a qualquer momento, sem exigir ordem sequencial.

#### Scenario: Pular direto para uma etapa posterior
- **WHEN** o jogador seleciona, na barra lateral, uma etapa diferente da etapa atual
- **THEN** o sistema exibe o conteúdo daquela etapa imediatamente, preservando o que já foi preenchido em qualquer etapa

### Requirement: Atributos por compra de pontos, com bônus racial "à escolha" quando aplicável

O sistema SHALL permitir escolher um pool de pontos entre as opções oferecidas e SHALL impedir que o jogador aplique um aumento de atributo cujo custo total excederia o pool escolhido. Quando a raça escolhida não tem ajuste de atributo fixo no compêndio (bônus "à escolha do jogador"), o sistema SHALL oferecer um seletor de qual atributo recebe o bônus racial antes de permitir concluir a etapa.

#### Scenario: Aumento dentro do pool
- **WHEN** o jogador aumenta um atributo e o custo total permanece dentro do pool escolhido
- **THEN** o sistema aplica o aumento, soma o ajuste racial (fixo ou escolhido) e atualiza o saldo restante

#### Scenario: Aumento que excederia o pool
- **WHEN** o jogador tenta aumentar um atributo e o custo total excederia o pool escolhido
- **THEN** o sistema não aplica o aumento

#### Scenario: Raça com bônus de atributo "à escolha"
- **WHEN** a raça escolhida não tem ajuste de atributo fixo no compêndio
- **THEN** o sistema exige que o jogador escolha em qual atributo aplicar o bônus antes de liberar a conclusão da etapa

### Requirement: Perícias de classe e limite de graduações no 1º nível

O sistema SHALL marcar como perícia de classe as perícias listadas em `pericias_de_classe` da classe escolhida, e SHALL impedir que o jogador aloque mais graduações do que o máximo do 1º nível (4 de classe, 2 fora de classe) ou mais pontos do que o pool calculado a partir de `pontos_pericia_por_nivel` da classe, do modificador de Inteligência e de um bônus racial quando aplicável.

#### Scenario: Alocação dentro do limite
- **WHEN** o jogador aumenta as graduações de uma perícia e nem o máximo de graduações nem o pool de pontos de perícia são excedidos
- **THEN** o sistema aplica o aumento e desconta o custo (1 ponto por graduação em perícia de classe, 2 fora de classe) do pool restante

#### Scenario: Alocação que excederia o máximo ou o pool
- **WHEN** o jogador tenta alocar mais graduações do que o máximo permitido no 1º nível, ou o custo excederia o pool de pontos de perícia restante
- **THEN** o sistema não aplica a alocação

### Requirement: Talentos com bloqueio rígido quando o pré-requisito é reconhecido

O sistema SHALL avaliar o texto de `pre_requisitos` de cada talento do compêndio contra os atributos, base de ataque, nível de conjurador e talentos já escolhidos no assistente. Quando o pré-requisito é reconhecido e não atendido, o sistema SHALL impedir a escolha do talento e exibir o motivo. Quando o pré-requisito é reconhecido e atendido, o sistema SHALL permitir a escolha. Quando o texto do pré-requisito não é reconhecido pelo avaliador, o sistema SHALL permitir a escolha e exibir o texto do pré-requisito sinalizando que não foi verificado automaticamente.

#### Scenario: Pré-requisito reconhecido e satisfeito
- **WHEN** o texto do pré-requisito de um talento é reconhecido pelo avaliador e os dados atuais do personagem o satisfazem
- **THEN** o sistema permite escolher esse talento

#### Scenario: Pré-requisito reconhecido e não satisfeito
- **WHEN** o texto do pré-requisito de um talento é reconhecido pelo avaliador e os dados atuais do personagem não o satisfazem
- **THEN** o sistema impede a escolha desse talento e exibe o motivo do bloqueio

#### Scenario: Pré-requisito não reconhecido pelo avaliador
- **WHEN** o texto do pré-requisito de um talento não corresponde a nenhum padrão que o avaliador reconhece
- **THEN** o sistema permite escolher o talento e exibe o texto do pré-requisito sinalizando que não foi verificado automaticamente

#### Scenario: Pré-requisito passa a ser satisfeito depois de uma mudança em outra etapa
- **WHEN** o jogador ajusta um atributo (ou escolhe um talento pré-requisito) em outra etapa e retorna à etapa de Talentos
- **THEN** o sistema reavalia o pré-requisito com os dados atualizados

### Requirement: Magias iniciais filtradas por classe e nível, com limite de escolhas

O sistema SHALL, quando a classe escolhida é conjuradora, buscar do compêndio as magias disponíveis para aquela classe nos níveis 0 e 1, agrupadas por nível, e SHALL impedir escolher mais magias do que o limite definido por nível. Quando a classe escolhida não é conjuradora, o sistema SHALL marcar a etapa de magias como não aplicável, sem exigir nenhuma ação do jogador para prosseguir.

#### Scenario: Escolha de magia dentro do limite
- **WHEN** a classe escolhida é conjuradora e o jogador escolhe uma magia do compêndio dentro do limite daquele nível
- **THEN** o sistema grava a magia na ficha e atualiza a contagem de escolhidas daquele nível

#### Scenario: Escolha de magia além do limite
- **WHEN** o jogador tenta escolher mais uma magia de um nível que já atingiu o limite
- **THEN** o sistema impede a escolha

#### Scenario: Classe não conjuradora
- **WHEN** a classe escolhida pelo jogador não é conjuradora
- **THEN** o sistema exibe a etapa de magias como não aplicável e permite seguir em frente sem exigir escolha

### Requirement: Equipamento inicial por ouro de classe, com catálogo e limite de gasto

O sistema SHALL calcular o ouro inicial a partir do nome da classe escolhida (dado curado no frontend, já que o compêndio não cobre equipamento), SHALL oferecer um pacote inicial sugerido e uma lista de compra item a item, e SHALL impedir comprar (individualmente ou via pacote) um item cujo custo exceda o ouro restante.

#### Scenario: Aplicar o pacote inicial da classe
- **WHEN** o jogador aplica o pacote inicial sugerido para a classe escolhida
- **THEN** o sistema adiciona os itens do pacote cujo custo acumulado cabe no ouro disponível e desconta o total gasto

#### Scenario: Compra individual dentro do ouro disponível
- **WHEN** o jogador compra um item do catálogo cujo custo não excede o ouro restante
- **THEN** o sistema adiciona o item à lista de itens da ficha e desconta o custo do ouro restante

#### Scenario: Compra que excederia o ouro restante
- **WHEN** o jogador tenta comprar um item cujo custo excede o ouro restante
- **THEN** o sistema impede a compra

### Requirement: Cada etapa grava progresso imediatamente

O sistema SHALL persistir a escolha de cada etapa do assistente na ficha, através dos mesmos endpoints de seção usados pela edição manual, e SHALL permitir que o jogador saia do assistente a qualquer momento e retorne depois, recarregando o estado inicial de cada etapa a partir da ficha já salva. Ao clicar no botão de confirmação de uma etapa, o sistema SHALL forçar o envio imediato de qualquer alteração pendente daquela etapa (sem esperar o debounce do autosave) e SHALL só avançar para a próxima etapa depois que esse envio for confirmado pela API.

#### Scenario: Saída no meio do assistente
- **WHEN** o jogador completa uma ou mais etapas, sai do assistente, e retorna mais tarde (inclusive após recarregar a página)
- **THEN** o sistema recarrega a ficha e reflete, em cada etapa correspondente, os valores já salvos anteriormente

#### Scenario: Confirmar logo após uma alteração ainda não salva
- **WHEN** o jogador altera um campo da etapa atual e clica no botão de confirmação antes do autosave debounced disparar sozinho
- **THEN** o sistema envia a alteração pendente imediatamente e só avança para a próxima etapa depois que o envio for confirmado

#### Scenario: Falha ao confirmar
- **WHEN** o envio forçado pelo clique de confirmação falha
- **THEN** o sistema permanece na etapa atual, mantém os dados preenchidos e sinaliza o erro de salvamento em vez de avançar

### Requirement: Feedback visual de botão de confirmação desabilitado

O sistema SHALL exibir um estado visual distinto (opacidade reduzida e cursor de "não permitido") no botão de confirmação de cada etapa sempre que a etapa não satisfizer as condições para avançar, e SHALL exibir um estado de carregamento no botão enquanto o envio forçado pelo clique de confirmação está em andamento, desabilitando-o para evitar duplo envio.

#### Scenario: Etapa incompleta
- **WHEN** a etapa atual não satisfaz as condições para avançar (ex.: campo obrigatório vazio, escolha pendente)
- **THEN** o botão de confirmação exibe o estado visual de desabilitado, distinto do estado habilitado

#### Scenario: Confirmação em andamento
- **WHEN** o jogador clica no botão de confirmação e o envio forçado ainda não terminou
- **THEN** o botão exibe um estado de carregamento e não aceita novos cliques até o envio terminar
