## Context

Ver proposal.md - Why. Pontos do código atual que moldam a abordagem:

- `PedidoRolagemPayload` ([types.ts](../../src/realtime/types.ts)) só tem `destinatarioContaId`, `destinatarioNomePersonagem` e `descricao` (texto livre) — não há campo estruturado. Esse contrato é compartilhado entre pedido de mestre humano e pedido da IA-mestre, e uma change irmã recente (`fix-rodada-ia-wire-contract`) documentou explicitamente que esse canal não seria tocado.
- O sistema de regras é Pathfinder 1ª edição (não D&D 5e): `CombateTab.tsx`/`rules/combat.ts` calculam Testes de Resistência (Fortitude/Reflexos/Vontade), Iniciativa, CMB/CMD e bônus de ataque — mas **nenhum desses tem um botão de rolar hoje**, são só valores exibidos.
- Só três seções da ficha já têm o padrão "item + botão Rolar → `rolarItem(tipoItem, itemId)` → servidor calcula e publica o resultado": Perícias (`nome`), Ataques (`arma`), Talentos (`nome`). O servidor é a fonte de verdade do resultado nesses três casos.
- `emitirRolagem` ([useCampaignEvents.ts:116](../../src/realtime/useCampaignEvents.ts#L116)) já aceita dois formatos: `{tipoItem, itemId}` (vinculado a um item da ficha) **ou** `{notacao}` (rolagem livre, notação calculada no cliente, sem verificação server-side contra a ficha — é o mesmo canal que alimenta o formulário "Rolagem livre" hoje).
- `rules/combat.ts` e `rules/attributeMods.ts`/`sheet/abilityMod.ts` já expõem funções puras (`savingThrow`, `initiative`, `attributeModifier`, `ABILIDADES`) suficientes para calcular, no cliente, o total de qualquer teste de resistência, iniciativa ou atributo puro a partir da `ficha` já carregada em `CharacterSheetPage`.

## Goals / Non-Goals

**Goals:**
- Resolver a sugestão inteiramente no cliente, sem nova chamada de API e sem mudar o payload de `pedido_rolagem`.
- Cobrir as duas famílias de rolagem que já existem na ficha: rolagens vinculadas a item (perícia/ataque/talento, via `rolarItem`) e rolagens derivadas sem item próprio (resistência/iniciativa/atributo puro, via rolagem livre com notação calculada no cliente).
- Reduzir falsos positivos na família "derivada", já que seus nomes (Força, Vontade, Reflexos...) são palavras comuns do português, ao contrário de nomes de perícia/ataque/talento que tendem a ser termos mais distintivos.
- Degradar sem erro quando não há correspondência — o card volta a ser exatamente o que é hoje.

**Non-Goals:**
- Resolver ambiguidade linguística sofisticada além do necessário para o MVP (múltiplas entradas na mesma frase, sinônimos, CD explícita no card) — evolução futura se necessário.
- Rotular o evento `rolagem_dados` resultante de uma rolagem livre de teste de resistência/atributo com o nome do teste (hoje ele aparece como "Você rolou 1d20+3", não "Você rolou Vontade") — é o mesmo comportamento que a Rolagem Livre já tem hoje; corrigir isso exigiria o payload carregar um rótulo, fora de escopo aqui.
- Mudar o contrato de `pedido_rolagem` no `dungeons-api` para carregar uma entrada estruturada/CD — considerado e descartado por ora (ver exploração anterior); pode ser revisitado como change separada.
- Aplicar a sugestão no painel do mestre (`MasterDashboard`) — o mestre não tem ficha própria contra a qual casar.

## Decisions

### Catálogo de rolagem unificado, construído a partir da ficha já carregada

Um novo helper monta, a partir da `Ficha` completa já carregada em `CharacterSheetPage`, uma lista de entradas `{ rotulo, notacaoOuItem }`, combinando:
- **Vinculadas a item** (perícias, ataques, talentos): `{ tipo: 'item', tipoItem, itemId }` — dispatch via `rolarItem`, resultado sempre do servidor.
- **Derivadas** (Fortitude, Reflexos, Vontade, Iniciativa, Força/Destreza/Constituição/Inteligência/Sabedoria/Carisma): `{ tipo: 'livre', notacao: '1d20+N' }`, onde `N` é calculado no cliente com as mesmas funções puras que `CombateTab` já usa (`savingThrow`, `initiative`, `attributeModifier`) — dispatch via `emitirRolagem({ notacao })`, o mesmo canal da Rolagem Livre.

**Alternativa considerada:** dar a testes de resistência/atributo um "item" fantasma no servidor (criar um tipo de item novo no backend) para que também passem por `rolarItem` e tenham verificação server-side do bônus. Descartada por exigir mudança de contrato em `dungeons-api` — o mesmo limite já identificado e descartado para o pedido estruturado; a rolagem livre já é o padrão aceito no produto para valores não vinculados a um item persistido.

### Dois modos de casamento texto → catálogo: direto (itens) vs. ancorado (derivados)

- Perícias/ataques/talentos: casamento por substring simples (normalizando acento/caixa), como já desenhado — nomes como "Percepção" ou "Espada longa" são termos distintivos, risco de falso positivo é baixo.
- Testes de resistência/iniciativa/atributo puro: exigem um padrão ancorado — o nome só conta como correspondência quando precedido por um termo-gatilho ("teste de", "resistência de", "salvamento de") ou quando é a própria palavra "iniciativa". Sem essa âncora, "Força", "Vontade", "Reflexos" são palavras comuns o bastante para aparecer em narração sem intenção de pedir uma rolagem (ex.: "você sente que precisa de mais Força de vontade para continuar").

**Alternativa considerada:** usar o mesmo casamento direto (substring simples) para as duas famílias, como na primeira versão desta proposta. Descartada após o escopo abranger atributos/resistência: o risco de falso positivo em texto narrativo é real e específico dessa família, não existia quando a proposta cobria só perícias.

### Ordem de prioridade quando mais de uma entrada bate na mesma descrição

Verifica-se primeiro a família vinculada a item (perícia → ataque → talento, nessa ordem, primeira correspondência encontrada), depois a família derivada (resistência → iniciativa → atributo). Itens são mais específicos ao personagem e ao texto que a IA tende a usar ("Teste de Percepção" é mais comum que "Teste de Sabedoria" para o mesmo caso de notar algo); resolver ambiguidade além dessa ordem fixa fica fora de escopo (ver Non-Goals).

### A sugestão e os dois botões de rolar vivem no `EventosMesaPanel`, reaproveitando os handlers existentes via prop

`EventosMesaPanel` passa a receber `catalogoRolagem: CatalogoRolagemEntry[]` e `onRolar: (entrada: CatalogoRolagemEntry) => void` como props opcionais (ausentes no `MasterDashboard`, presentes em `CharacterSheetPage`, onde o handler despacha para `rolarItem` ou `emitirRolagem({notacao})` conforme o tipo da entrada). Nenhuma lógica de cálculo ou de disparo é duplicada — o mesmo `rolarItem` já usado pelas abas de item, e o mesmo `emitirRolagem` já usado pela Rolagem Livre.

### Módulos novos isolados e testáveis

- `src/realtime/catalogoRolagem.ts`: função pura `montarCatalogoRolagem(ficha): CatalogoRolagemEntry[]`.
- `src/realtime/sugestaoRolagem.ts`: função pura `sugerirEntradaDoPedido(descricao, catalogo): CatalogoRolagemEntry | null`, com os dois modos de casamento.

Ambos seguem o padrão já existente de `notacao.ts` no mesmo diretório (função pura, testada isoladamente, consumida por um componente).

## Risks / Trade-offs

- [Rolagem livre de teste de resistência/atributo não é verificada pelo servidor contra a ficha real — um jogador poderia, em tese, editar a notação antes de enviar] → Aceito conscientemente: é exatamente o mesmo modelo de confiança que a Rolagem Livre já tem hoje para qualquer notação digitada manualmente; esta change não piora isso, só evita que o jogador precise digitar a notação à mão.
- [Falso positivo residual mesmo com âncora — ex.: "teste de força de vontade" sendo uma expressão idiomática, não um pedido real] → Aceitável para o MVP; se se mostrar um problema real na prática, refinar os termos-gatilho é uma mudança isolada no helper, sem impacto na spec.
- [Jogador renomeia ou apaga a perícia/ataque/talento padrão da ficha, quebrando o casamento] → Degrada graciosamente para o comportamento atual (card sem sugestão) — não é uma falha, é o fallback já especificado.
- [`EventosMesaPanel` ganha props que só fazem sentido em um dos dois contextos onde é usado (ficha do jogador vs. dashboard do mestre)] → Aceito: props opcionais, indefinidas no dashboard do mestre, sem exigir um segundo componente.

## Open Questions

(nenhuma — decisões acima resolvem os pontos levantados na exploração)
