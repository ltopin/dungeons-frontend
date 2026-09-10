## ADDED Requirements

### Requirement: Pedido de rolagem sugere a entrada correspondente do catálogo de rolagem do jogador
Quando um evento `pedido_rolagem` é direcionado ao jogador atual (para ele especificamente ou para toda a mesa) e o texto do pedido corresponde a uma entrada do catálogo de rolagem da própria ficha desse jogador — perícia, ataque, talento, teste de resistência (Fortitude/Reflexos/Vontade), iniciativa ou teste de atributo puro (Força/Destreza/Constituição/Inteligência/Sabedoria/Carisma) — o painel de eventos SHALL exibir, junto ao card do pedido, o valor ou a notação calculada dessa entrada e um atalho para disparar a rolagem correspondente, sem que o jogador precise sair do painel de eventos para localizá-la manualmente.

#### Scenario: Pedido de rolagem corresponde a uma perícia, ataque ou talento da ficha
- **WHEN** o jogador atual recebe (ou é incluído em) um `pedido_rolagem` cuja descrição menciona o nome de uma perícia, ataque ou talento presente na sua própria ficha (ex.: "Teste de Percepção...", "role para atacar com sua Espada longa")
- **THEN** o painel de eventos exibe, no card desse pedido, o total calculado do item correspondente e um botão que dispara a mesma rolagem vinculada a esse item já disponível na aba correspondente da ficha

#### Scenario: Pedido de rolagem corresponde a um teste de resistência, iniciativa ou atributo puro
- **WHEN** o jogador atual recebe um `pedido_rolagem` cuja descrição contém um padrão reconhecível de teste de resistência, iniciativa ou atributo puro (ex.: "Teste de Resistência de Vontade CD 15", "role Iniciativa", "Teste de Força")
- **THEN** o painel de eventos exibe, no card desse pedido, a notação de dados calculada (1d20 + o valor total daquele teste, calculado a partir da própria ficha) e um botão que dispara essa rolagem

#### Scenario: Menção incidental a uma palavra de atributo/resistência não gera sugestão
- **WHEN** a descrição de um `pedido_rolagem` contém uma palavra igual ao nome de um atributo ou teste de resistência (ex.: "Vontade", "Força") mas não em um padrão reconhecível de pedido de teste (ex.: menção narrativa solta, sem "teste de"/"resistência de"/termo equivalente)
- **THEN** o painel de eventos não exibe sugestão para essa palavra, evitando falsos positivos a partir de palavras comuns do português

#### Scenario: Rolar a partir da sugestão produz o mesmo resultado que rolar pela aba correspondente
- **WHEN** o jogador aciona o botão de rolagem exibido na sugestão do card de `pedido_rolagem` para uma entrada vinculada a um item da ficha (perícia, ataque ou talento)
- **THEN** o sistema dispara a mesma rolagem vinculada a esse item (resultado sempre calculado pelo servidor) que seria disparada ao clicar em Rolar na aba correspondente

#### Scenario: Pedido de rolagem sem correspondência no catálogo
- **WHEN** o texto de um `pedido_rolagem` direcionado ao jogador atual não corresponde a nenhuma entrada do catálogo de rolagem da sua ficha (ex.: pedido descrito de forma não reconhecível, ou perícia/ataque/talento removido da ficha)
- **THEN** o painel de eventos exibe o card apenas com o texto da descrição, sem sugestão nem atalho de rolagem

#### Scenario: Pedido de rolagem direcionado a outro jogador não exibe sugestão
- **WHEN** um `pedido_rolagem` é direcionado especificamente a outro jogador (`destinatarioContaId` diferente da conta atual)
- **THEN** o painel de eventos do jogador atual não exibe sugestão nem atalho de rolagem para esse card, independentemente de o texto corresponder a uma entrada do catálogo dele

#### Scenario: Painel do mestre não exibe sugestão
- **WHEN** o painel de eventos é exibido no dashboard do mestre
- **THEN** os cards de `pedido_rolagem` não exibem sugestão nem atalho de rolagem, já que o mestre não tem uma ficha própria associada
