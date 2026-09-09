## Purpose

Define, como comportamento testável, as fórmulas de Pathfinder 1ª edição que a ficha de personagem calcula automaticamente — extraídas e verificadas célula a célula a partir da planilha de origem (`Ficha D&D 3.75.xls`) fornecida pelo usuário, não de memória de regras genéricas.

## ADDED Requirements

### Requirement: Modificador de atributo
O sistema SHALL calcular o modificador de qualquer atributo (FOR/DES/CON/INT/SAB/CAR) como `floor((valor - 10) / 2)`.

#### Scenario: Atributo par
- **WHEN** um atributo tem valor 14
- **THEN** o modificador calculado é +2

#### Scenario: Atributo ímpar
- **WHEN** um atributo tem valor 15
- **THEN** o modificador calculado é +2

#### Scenario: Atributo abaixo de 10
- **WHEN** um atributo tem valor 8
- **THEN** o modificador calculado é -1

### Requirement: Classe de Armadura (CA total, toque e surpreendido)
O sistema SHALL calcular CA total como `10 + armadura + escudo + modificador de destreza + modificador de tamanho + natural + desvio + outros`; CA de toque como o mesmo total excluindo armadura, escudo e natural; CA surpreendido (flat-footed) como CA total menos o modificador de destreza quando este for positivo (um modificador de destreza negativo continua se aplicando normalmente).

#### Scenario: CA total com todos os componentes
- **WHEN** um personagem tem armadura +4, escudo +2, modificador de destreza +3, modificador de tamanho 0, natural +1, desvio 0, outros 0
- **THEN** a CA total calculada é 20

#### Scenario: CA de toque ignora armadura/escudo/natural
- **WHEN** o mesmo personagem do cenário anterior é avaliado para CA de toque
- **THEN** a CA de toque calculada é 13 (10 + destreza +3 + tamanho 0 + desvio 0 + outros 0)

#### Scenario: CA surpreendido remove o bônus de destreza positivo
- **WHEN** o mesmo personagem é avaliado para CA surpreendido
- **THEN** a CA surpreendido calculada é 17 (CA total 20 - destreza +3)

#### Scenario: CA surpreendido mantém a penalidade de destreza negativa
- **WHEN** um personagem tem modificador de destreza -2 e CA total 15
- **THEN** a CA surpreendido calculada continua 15 (a penalidade não é removida)

### Requirement: Modificador de tamanho segue a tabela da ficha de origem
O sistema SHALL calcular o modificador de tamanho usado em CA (e reaproveitado em CMB/CMD, ver requisito de manobra de combate) pela tabela: Minúsculo +8, Mínimo +4, Miúdo +2, Pequeno +1, Médio 0, Grande -1, Enorme -2, Imenso -4, Colossal -8.

#### Scenario: Tamanho Pequeno
- **WHEN** o tamanho do personagem é "PEQUENO"
- **THEN** o modificador de tamanho calculado é +1

#### Scenario: Tamanho Colossal
- **WHEN** o tamanho do personagem é "COLOSSAL"
- **THEN** o modificador de tamanho calculado é -8

### Requirement: Testes de resistência (Fortitude/Reflexos/Vontade)
O sistema SHALL calcular cada teste de resistência como `base + modificador do atributo correspondente (CON/DEX/WIS) + modificador mágico + outros`.

#### Scenario: Fortitude com todos os componentes
- **WHEN** um personagem tem base de Fortitude +5, modificador de CON +2, modificador mágico +1, outros 0
- **THEN** o total de Fortitude calculado é +8

### Requirement: Bônus de ataque corpo a corpo e à distância
O sistema SHALL calcular o bônus de ataque corpo a corpo como `BAB + modificador de força + modificador de tamanho + outros`, e o bônus de ataque à distância como `BAB + modificador de destreza + modificador de tamanho + outros`.

#### Scenario: Ataque corpo a corpo
- **WHEN** um personagem tem BAB +6, modificador de força +3, modificador de tamanho +1, outros 0
- **THEN** o bônus de ataque corpo a corpo calculado é +10

#### Scenario: Ataque à distância
- **WHEN** o mesmo personagem tem modificador de destreza +2
- **THEN** o bônus de ataque à distância calculado é +9

### Requirement: CMB e CMD reaproveitam o modificador de tamanho da CA
O sistema SHALL calcular CMB como `BAB + modificador de força + modificador de tamanho (mesma tabela de CA) + outros`, e CMD como `10 + BAB + modificador de força + modificador de destreza + modificador de tamanho (mesma tabela de CA) + outros`. Nota: isso reproduz fielmente a planilha de origem, que reaproveita a mesma célula de modificador de tamanho da CA para CMB/CMD — diferente da tabela oficial de Pathfinder, que usa sinais invertidos para manobra de combate (criaturas maiores ganham bônus, não penalidade). Ver design.md para a decisão de manter esse comportamento.

#### Scenario: CMB de um personagem Grande
- **WHEN** um personagem Grande (modificador de tamanho de CA -1) tem BAB +6, modificador de força +4, outros 0
- **THEN** o CMB calculado é +9 (não +11, pois o modificador de tamanho usado é o mesmo -1 da CA)

#### Scenario: CMD de um personagem Médio
- **WHEN** um personagem Médio (modificador de tamanho 0) tem BAB +6, modificador de força +4, modificador de destreza +2, outros 0
- **THEN** o CMD calculado é 22 (10 + 6 + 4 + 2 + 0)

### Requirement: Total de perícia
O sistema SHALL calcular o total de uma perícia como `graduações + modificador do atributo-chave + (3 se treinada, isto é, graduações > 0 e perícia de classe verdadeira, senão 0) + outros`.

#### Scenario: Perícia de classe treinada
- **WHEN** uma perícia tem 4 graduações, é perícia de classe, modificador de atributo +2 e outros 0
- **THEN** o total calculado é 9 (4 + 2 + 3 + 0)

#### Scenario: Perícia fora de classe treinada
- **WHEN** uma perícia tem 4 graduações, não é perícia de classe, modificador de atributo +2 e outros 0
- **THEN** o total calculado é 6 (4 + 2 + 0 + 0)

#### Scenario: Perícia sem graduações não recebe bônus de classe
- **WHEN** uma perícia tem 0 graduações, é perícia de classe, modificador de atributo +1 e outros 0
- **THEN** o total calculado é 1 (0 + 1 + 0 + 0, o bônus de +3 não se aplica sem ao menos 1 graduação)

### Requirement: CD de magia por nível
O sistema SHALL calcular a CD de resistência de uma magia como `10 + nível da magia + modificador do atributo de conjuração + outros`.

#### Scenario: CD de uma magia de 3º nível
- **WHEN** o atributo de conjuração tem modificador +4, o outros de CD é 0
- **THEN** a CD de uma magia de nível 3 calculada é 17 (10 + 3 + 4 + 0)

### Requirement: Capacidade de carga (leve/média/pesada) e múltiplos da carga pesada
O sistema SHALL calcular as três faixas de capacidade de carga (leve, média, pesada) a partir da força e do tamanho do personagem, usando a tabela oficial de capacidade de carga de Pathfinder 1ª edição, e derivar "erguer sobre a cabeça" como 1× a carga pesada, "erguer do chão" como 2× a carga pesada e "empurrar ou arrastar" como 5× a carga pesada — reproduzindo as três fórmulas de múltiplo encontradas na ficha de origem (`C117=C108`, `C130=C108*2`, `C143=C108*5`). Nota: a ficha de origem só automatiza os múltiplos — carga leve/média/pesada eram preenchidas manualmente pelo jogador a partir da tabela do livro; automatizar as três aqui é uma decisão deliberada que vai além da fórmula literal da planilha (ver design.md).

#### Scenario: Múltiplos derivados da carga pesada
- **WHEN** a carga pesada calculada para um personagem é 100 kg
- **THEN** erguer sobre a cabeça é 100 kg, erguer do chão é 200 kg, e empurrar ou arrastar é 500 kg

#### Scenario: Carga leve/média/pesada acompanham mudança de força
- **WHEN** o jogador altera o valor de força do personagem
- **THEN** as três faixas de capacidade de carga são recalculadas automaticamente, sem exigir entrada manual
