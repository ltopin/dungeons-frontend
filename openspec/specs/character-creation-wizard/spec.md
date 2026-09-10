# character-creation-wizard Specification

## Purpose

Guia o jogador na criação de um personagem D&D 3.5/Pathfinder 1e passo a passo (raça, classe, atributos, perícias, talentos, magias, equipamento), consumindo o compêndio real do `dungeons-api` para raça/classe/perícia/talento/magia e validação bloqueante onde é automaticamente verificável, em vez de exigir que o jogador preencha a ficha em branco sabendo as regras de cabeça.

## Requirements

### Requirement: Entrada no assistente para ficha nova

O sistema SHALL direcionar o jogador ao assistente de criação quando, na carga inicial da ficha, o nome do personagem, a classe e a raça estiverem todos vazios ou nulos, e SHALL manter essa decisão de roteamento fixa durante a sessão de edição (sem recomputar a cada sincronização de autosave).

Quando a campanha tem um mundo vinculado, antes de direcionar ao assistente o sistema SHALL buscar os elementos de história publicados desse mundo. Havendo pelo menos um elemento publicado, o sistema SHALL exibir uma tela de boas-vindas com essa história em vez de ir direto ao assistente, e só SHALL navegar ao assistente depois que o jogador confirmar nessa tela. Sem mundo vinculado, com mundo vinculado mas sem nenhum elemento publicado, ou se a busca da história falhar, o sistema SHALL manter o comportamento direto de ir ao assistente sem tela intermediária.

#### Scenario: Jogador entra numa campanha com ficha em branco
- **WHEN** um jogador acessa a ficha de uma campanha sem mundo vinculado e nome do personagem, classe e raça estão todos vazios ou nulos
- **THEN** o sistema exibe o assistente de criação de personagem diretamente, sem tela intermediária

#### Scenario: Jogador com personagem já iniciado acessa a ficha
- **WHEN** um jogador acessa a ficha de uma campanha e nome do personagem, classe ou raça já têm algum valor
- **THEN** o sistema exibe a ficha manual diretamente, sem redirecionar para o assistente e sem buscar história do mundo

#### Scenario: Ficha em branco numa campanha com mundo sem história publicada
- **WHEN** um jogador acessa a ficha em branco de uma campanha cujo mundo vinculado não tem nenhum elemento de história publicado
- **THEN** o sistema exibe o assistente de criação de personagem diretamente, sem tela intermediária

#### Scenario: Falha ao buscar a história publicada
- **WHEN** um jogador acessa a ficha em branco de uma campanha com mundo vinculado e a busca dos elementos publicados falha
- **THEN** o sistema exibe o assistente de criação de personagem diretamente, sem bloquear o jogador por causa do erro

### Requirement: Tela de boas-vindas com a história do mundo antes do assistente

Quando há pelo menos um elemento de história publicado, o sistema SHALL exibir, antes do assistente, uma tela listando esses elementos agrupados por categoria, e SHALL oferecer uma ação explícita para prosseguir à criação do personagem.

#### Scenario: Jogador lê a história e prossegue
- **WHEN** o jogador está na tela de boas-vindas de uma campanha com história publicada e aciona a ação de prosseguir
- **THEN** o sistema navega para o assistente de criação de personagem

#### Scenario: Jogador sai sem prosseguir
- **WHEN** o jogador sai da tela de boas-vindas sem acionar a ação de prosseguir
- **THEN** o sistema não avança para o assistente, e a ficha permanece em branco para ser retomada depois (inclusive vendo a mesma tela de boas-vindas novamente, já que a ficha continua sem nome, classe ou raça)

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

O sistema SHALL oferecer três modos de definição da pontuação base dos atributos — Sortear, Compra de pontos e Manual — através de um seletor, mantendo o estado de cada modo independente ao trocar de seleção (trocar de modo não traduz valores de um modo para outro).

No modo Sortear, o sistema SHALL rolar 4d6 descartando o menor valor, seis vezes, apresentar os seis valores brutos para distribuição manual entre os atributos, SHALL permitir rerolar o conjunto inteiro sem limite de vezes (descartando qualquer distribuição já feita), e SHALL exigir que todos os seis valores estejam distribuídos entre os atributos antes de permitir concluir a etapa.

No modo Compra de pontos, o sistema SHALL permitir escolher um pool de pontos entre as opções oferecidas e SHALL impedir que o jogador aplique um aumento de atributo cujo custo total excederia o pool escolhido.

No modo Manual, o sistema SHALL permitir digitar livremente a pontuação de cada atributo dentro da faixa 3–18, sem cálculo de custo associado.

Em qualquer um dos três modos, quando a raça escolhida não tem ajuste de atributo fixo no compêndio (bônus "à escolha do jogador"), o sistema SHALL oferecer um seletor de qual atributo recebe o bônus racial antes de permitir concluir a etapa, e o ajuste racial (fixo ou escolhido) SHALL ser somado por cima da pontuação base definida em qualquer um dos três modos.

#### Scenario: Selecionar o modo Sortear

- **WHEN** o jogador seleciona o modo Sortear pela primeira vez
- **THEN** o sistema rola 4d6 descartando o menor valor, seis vezes, e apresenta os seis valores para distribuição, sem nenhum ainda atribuído a um atributo

#### Scenario: Distribuir um valor sorteado

- **WHEN** o jogador atribui um dos valores sorteados ainda não distribuídos a um atributo
- **THEN** o sistema aplica esse valor ao atributo, soma o ajuste racial, e remove o valor da lista de valores disponíveis para distribuição

#### Scenario: Rerolar o conjunto sorteado

- **WHEN** o jogador aciona "rolar novamente" no modo Sortear, com ou sem valores já distribuídos
- **THEN** o sistema descarta o conjunto atual e qualquer distribuição já feita, e rola um novo conjunto de seis valores

#### Scenario: Concluir a etapa no modo Sortear com valores pendentes

- **WHEN** o jogador está no modo Sortear e nem todos os seis valores sorteados foram distribuídos entre os atributos
- **THEN** o sistema impede concluir a etapa

#### Scenario: Aumento dentro do pool

- **WHEN** o jogador está no modo Compra de pontos e aumenta um atributo mantendo o custo total dentro do pool escolhido
- **THEN** o sistema aplica o aumento, soma o ajuste racial (fixo ou escolhido) e atualiza o saldo restante

#### Scenario: Aumento que excederia o pool

- **WHEN** o jogador está no modo Compra de pontos e tenta aumentar um atributo além do que o custo total do pool escolhido permite
- **THEN** o sistema não aplica o aumento

#### Scenario: Digitar pontuação no modo Manual

- **WHEN** o jogador digita, no modo Manual, um valor entre 3 e 18 para um atributo
- **THEN** o sistema aplica o valor ao atributo e soma o ajuste racial, sem verificar nenhum custo

#### Scenario: Digitar pontuação fora da faixa no modo Manual

- **WHEN** o jogador tenta digitar, no modo Manual, um valor menor que 3 ou maior que 18 para um atributo
- **THEN** o sistema não aplica o valor

#### Scenario: Raça com bônus de atributo "à escolha"

- **WHEN** a raça escolhida não tem ajuste de atributo fixo no compêndio, em qualquer um dos três modos
- **THEN** o sistema exige que o jogador escolha em qual atributo aplicar o bônus antes de liberar a conclusão da etapa

### Requirement: Perícias de classe, limite de graduações no 1º nível e bônus "Outros"

O sistema SHALL marcar como perícia de classe as perícias listadas em `pericias_de_classe` da classe escolhida, e SHALL impedir que o jogador aloque mais graduações do que o máximo do 1º nível — 4, tanto para perícia de classe quanto fora de classe — ou mais pontos do que o pool calculado a partir de `pontos_pericia_por_nivel` da classe, do modificador de Inteligência e de um bônus racial quando aplicável. O custo por graduação continua sendo 1 ponto para perícia de classe e 2 pontos para perícia fora de classe.

O sistema SHALL oferecer, para cada perícia, um campo numérico "Outros" editável livremente pelo jogador, representando a soma de bônus de raça, classe, magia ou qualquer outra origem, sem exigir que o jogador discrimine a origem de cada parcela. Esse valor SHALL ser somado ao total exibido da perícia e SHALL NOT consumir o pool de pontos de perícia.

#### Scenario: Alocação dentro do limite

- **WHEN** o jogador aumenta as graduações de uma perícia e nem o máximo de 4 graduações nem o pool de pontos de perícia são excedidos
- **THEN** o sistema aplica o aumento e desconta o custo (1 ponto por graduação em perícia de classe, 2 fora de classe) do pool restante

#### Scenario: Alocação que excederia o máximo ou o pool

- **WHEN** o jogador tenta alocar mais graduações do que o máximo de 4 permitido no 1º nível, ou o custo excederia o pool de pontos de perícia restante
- **THEN** o sistema não aplica a alocação

#### Scenario: Editar o campo "Outros" de uma perícia

- **WHEN** o jogador digita um valor no campo "Outros" de uma perícia
- **THEN** o sistema soma esse valor ao total exibido da perícia, sem alterar o pool de pontos de perícia restante

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

O sistema SHALL calcular o ouro inicial a partir do nome da classe escolhida (dado curado no frontend, já que o compêndio não cobre equipamento), SHALL oferecer um pacote inicial sugerido e uma lista de compra item a item, e SHALL impedir comprar (individualmente ou via pacote) um item cujo custo exceda o ouro restante. Quando o item comprado é uma arma com dados de combate cadastrados no catálogo, o sistema SHALL também criar a linha de Ataque correspondente, pré-preenchida com esses dados; quando esse item é removido, o sistema SHALL remover a linha de Ataque correspondente.

#### Scenario: Aplicar o pacote inicial da classe
- **WHEN** o jogador aplica o pacote inicial sugerido para a classe escolhida
- **THEN** o sistema adiciona os itens do pacote cujo custo acumulado cabe no ouro disponível e desconta o total gasto

#### Scenario: Compra individual dentro do ouro disponível
- **WHEN** o jogador compra um item do catálogo cujo custo não excede o ouro restante
- **THEN** o sistema adiciona o item à lista de itens da ficha e desconta o custo do ouro restante

#### Scenario: Compra que excederia o ouro restante
- **WHEN** o jogador tenta comprar um item cujo custo excede o ouro restante
- **THEN** o sistema impede a compra

#### Scenario: Comprar uma arma cria o Ataque correspondente
- **WHEN** o jogador compra (individualmente ou via pacote inicial) um item do catálogo que é uma arma com dados de combate cadastrados
- **THEN** o sistema, além de adicionar o item ao inventário, cria uma linha em Ataques com o nome da arma e os dados de combate (dano, crítico, tipo) do catálogo

#### Scenario: Comprar um item sem dados de combate não cria Ataque
- **WHEN** o jogador compra um item do catálogo que não é uma arma, ou é uma arma sem dados de combate cadastrados
- **THEN** o sistema adiciona o item apenas ao inventário, sem criar nenhuma linha em Ataques

#### Scenario: Remover uma arma comprada remove o Ataque correspondente
- **WHEN** o jogador remove da lista de itens adquiridos uma arma que gerou uma linha de Ataque
- **THEN** o sistema remove tanto o item do inventário quanto a linha de Ataque correspondente, e devolve o ouro gasto

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

### Requirement: Qualidades especiais de raça e classe gravadas automaticamente

Ao confirmar a etapa Raça e Classe com uma raça e uma classe escolhidas, o sistema SHALL gravar automaticamente, como linhas de talentos com categoria `qualidade_especial`, cada traço de `raca.tracos` e cada característica de `classe.caracteristicas` com `nivel === 1`, usando o nome e a descrição vindos do compêndio. O sistema SHALL NOT criar uma linha duplicada quando já existir uma linha de talento com o mesmo nome. O sistema SHALL NOT remover ou ressincronizar automaticamente linhas já gravadas quando o jogador trocar de raça ou classe depois de confirmar a etapa.

#### Scenario: Confirmar raça e classe pela primeira vez

- **WHEN** o jogador escolhe uma raça e uma classe e confirma a etapa Raça e Classe
- **THEN** o sistema grava uma linha de qualidade especial para cada traço da raça e para cada característica de nível 1 da classe, visível na aba Talentos e Qualidades Especiais da ficha

#### Scenario: Confirmar novamente sem mudanças

- **WHEN** o jogador retorna à etapa Raça e Classe (sem trocar raça nem classe) e confirma de novo
- **THEN** o sistema não duplica nenhuma linha de qualidade especial já existente com o mesmo nome

#### Scenario: Trocar de raça ou classe após já ter confirmado

- **WHEN** o jogador troca a raça ou a classe escolhida e confirma novamente a etapa
- **THEN** o sistema grava as qualidades especiais da nova raça/classe que ainda não existem como linha, e mantém as linhas já gravadas anteriormente (inclusive as da escolha anterior), sem removê-las automaticamente
