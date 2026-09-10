## Why

Hoje um `pedido_rolagem` (do mestre humano ou da IA) chega ao jogador como texto livre (ex.: "Teste de Percepção...", "Teste de Resistência de Vontade...", "Teste de Força..."). O jogador precisa decifrar sozinho o que rolar, encontrar o valor certo em alguma aba da ficha (Perícias, Ataques, Talentos ou Combate) e só então agir — em alguns casos (testes de resistência, iniciativa, atributo puro) nem existe botão de rolar hoje, só o número calculado exibido. Isso é fricção evitável: a ficha do próprio jogador já tem (ou já calcula) todos esses valores — só falta ligar o pedido a eles.

## What Changes

- Ao renderizar um evento `pedido_rolagem` direcionado ao jogador atual (`destinatarioContaId` igual à conta dele, ou pedido para toda a mesa), o painel de eventos tenta casar o texto da `descricao` contra o **catálogo de rolagem** do jogador: perícias, ataques e talentos da própria ficha, além de testes de resistência (Fortitude/Reflexos/Vontade), iniciativa e testes de atributo puro (Força/Destreza/Constituição/Inteligência/Sabedoria/Carisma).
- Perícias, ataques e talentos são casados por nome direto (proper nouns pouco ambíguos) — comportamento já desenhado na versão anterior desta proposta.
- Testes de resistência, iniciativa e atributos puros são casados por um padrão ancorado (ex.: "teste de X", "resistência de X", "iniciativa") — porque esses nomes ("Força", "Vontade", "Reflexos"...) são palavras comuns do português que apareceriam com frequência em narração sem ser um pedido de rolagem.
- Quando encontra uma correspondência, o card do evento passa a exibir o valor/notação (ex.: "Percepção: 1d20+4" ou "Vontade: 1d20+3") e um botão "Rolar":
  - para perícia/ataque/talento, dispara a mesma rolagem vinculada ao item já usada nas abas correspondentes (`rolarItem`);
  - para teste de resistência/iniciativa/atributo puro — que não são itens da ficha, só valores calculados — dispara uma rolagem livre (`1d20+<valor calculado no cliente>`) pelo mesmo canal já usado pela "Rolagem livre" existente.
- Quando não encontra correspondência (frase não reconhecível, ou perícia/ataque/talento removido da ficha), o card mantém o comportamento atual — só o texto da descrição, sem sugestão.
- Sem chamada nova de API e sem mudança no formato do evento `pedido_rolagem`: todo o casamento e cálculo é client-side, reaproveitando dados e funções que já existem (`skillTotal`, `savingThrow`, `initiative`, `attributeModifier`).
- Fora de escopo: o painel de eventos do mestre (`MasterDashboard`) não ganha essa sugestão — o mestre não tem uma ficha própria para calcular contra.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `campaign-realtime-events`: novo requisito — pedido de rolagem direcionado ao jogador exibe sugestão (valor/notação calculado + atalho para rolar) quando o texto do pedido corresponde a uma entrada do catálogo de rolagem da própria ficha (perícia, ataque, talento, teste de resistência, iniciativa ou atributo puro).

## Impact

- `src/realtime/EventosMesaPanel.tsx` — lógica de renderização do card de `pedido_rolagem` ganha a sugestão e o botão de rolar; passa a receber o catálogo de rolagem do jogador e os dois handlers de disparo (`rolarItem`, rolagem livre) como props.
- `src/routes/CharacterSheetPage.tsx` — monta o catálogo de rolagem a partir da `ficha` carregada e passa para `EventosMesaPanel`.
- Novo módulo utilitário (ex.: `src/realtime/catalogoRolagem.ts`) que constrói o catálogo a partir da ficha (perícias, ataques, talentos via `skillTotal`/dados já salvos; resistência/iniciativa/atributo via `rules/combat.ts` e `rules/attributeMods.ts`) e outro (ex.: `src/realtime/sugestaoRolagem.ts`) com a função de casamento texto → entrada do catálogo, com os dois modos de matching (direto vs. ancorado).
- Nenhum impacto em `dungeons-api` nem no contrato de eventos — mudança inteiramente client-side.
