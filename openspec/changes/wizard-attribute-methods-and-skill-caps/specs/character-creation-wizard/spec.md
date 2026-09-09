## MODIFIED Requirements

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
