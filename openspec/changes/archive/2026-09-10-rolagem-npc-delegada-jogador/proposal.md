## Why

Em modo de combate, o turno de um NPC/monstro é hoje resolvido inteiramente pela IA narrando livremente — não existe nenhuma rolagem de dados real por trás (nem servidor, nem cliente): a IA apenas escreve em texto o que "aconteceu", incluindo o número do resultado, e esse número tende a ser sempre baixo/zero. Delegar a rolagem de fato a um jogador — a IA só decide a notação, um humano clica para rolar — resolve isso com uma rolagem de verdade (mesmo mecanismo já usado para rolagens de jogador, autoridade sempre do servidor), em vez de precisar simular aleatoriedade dentro de uma narração de IA.

## What Changes

- Quando é a vez de um NPC em combate e a ação exige uma rolagem (ataque, dano, resistência etc.), a IA passa a emitir um `pedido_rolagem` com a notação já calculada (ex.: `1d20+4`), em vez de resolver a rolagem sozinha dentro da narração.
- Esse pedido aparece no painel de eventos para **qualquer jogador da mesa** com um botão "Rolar pelo `<nome do NPC>`" pronto para clicar — sem precisar casar com o catálogo da própria ficha (a notação já vem pronta do pedido).
- **Semântica de corrida:** diferente do pedido dirigido "à mesa toda" hoje (onde cada jogador responde de forma independente pela própria reação), aqui só a **primeira** rolagem vale — assim que qualquer jogador resolve, o botão some/desabilita para os demais em tempo real.
- Se ninguém responder dentro de um tempo, a IA rola sozinha como plano B, usando o mesmo mecanismo de rolagem determinística do servidor (não mais a narração livre de hoje) — combate nunca trava esperando um jogador.
- Nenhuma mudança no turno de jogador (`CombateTurnoPanel`/ação de turno) nem no mecanismo de resumo de rodada em modo exploração — afeta só a resolução do turno de NPC.
- Depende do change irmão de mesmo nome em `dungeons-api`, que introduz o campo de notação no pedido, a resolução com corrida/vencedor único e a reação/avanço de turno correspondentes; este lado só consome o contrato novo.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `campaign-realtime-events`: o `pedido_rolagem` ganha um modo "pelo NPC" (nome do NPC + notação pronta), visível a qualquer jogador da mesa com resolução de corrida (primeira resposta vale, resto desabilita), distinto do pedido dirigido a jogador(es) existente.

## Impact

- `src/realtime/types.ts`: mapear os novos campos opcionais do payload de `pedido_rolagem` (nome do NPC e notação).
- `src/realtime/EventosMesaPanel.tsx`: quando o pedido for "pelo NPC", exibir um botão de rolagem pronto (sem passar por `sugestaoRolagem.ts`/catálogo do jogador) para qualquer jogador presente, e desabilitá-lo/ocultá-lo assim que uma `rolagem_dados` referenciando esse pedido aparecer na lista de eventos (de qualquer autor) — sem precisar de estado novo além do já observável nos eventos carregados.
- `src/realtime/useCampaignEvents.ts`/`emitirRolagem`: nenhuma mudança de assinatura — a resposta ao pedido de NPC usa o mesmo caminho de rolagem livre (`{ notacao }`, `pedidoEventoId`) já existente.
- Nenhum impacto em `RodadaPanel.tsx`/`CombateTurnoPanel`: o turno de NPC continua sem affordance própria ali; a ação acontece no painel de eventos, como qualquer outro pedido de rolagem.
