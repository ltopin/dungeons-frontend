## MODIFIED Requirements

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
