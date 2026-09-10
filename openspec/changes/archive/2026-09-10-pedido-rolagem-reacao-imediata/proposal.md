## Why

Quando a IA mestre pede explicitamente uma rolagem a um jogador — para ele especificamente ou para a mesa toda — a resposta do jogador fica presa num canal sem retorno narrativo. Hoje a IA só reage quando alguém fecha a rodada inteira (modo exploração) ou quando o turno avança (modo combate); o jogador cumpre o pedido e "nada acontece" até bem depois, quebrando a expectativa natural de mesa de pedido → ação → reação.

## What Changes

- Ao emitir uma rolagem que responde a um `pedido_rolagem` visível no painel de eventos, o frontend passa a enviar o id desse evento de pedido como correlação (`pedidoEventoId`, novo parâmetro opcional em `emitirRolagem`).
- O painel de eventos passa a exibir, assim que chega via socket, uma narração de reação pontual e individual da IA a essa ação específica — sem esperar o fechamento da rodada corrente nem o avanço do turno — associada visualmente ao pedido/rolagem que a originou.
- Vale tanto para pedidos dirigidos especificamente ao jogador atual quanto para pedidos dirigidos à mesa toda; nesse segundo caso, cada jogador que responder recebe sua própria reação, independente dos demais e no seu próprio momento.
- Vale nos dois modos de campanha (exploração e combate), inclusive quando o pedido é respondido fora do turno ativo do respondente.
- Nenhuma mudança no mecanismo existente de resumo de rodada, fechar rodada ou ação de turno — eles continuam funcionando exatamente como hoje, para a progressão agregada da cena.
- Um `pedido_rolagem` que fica sem resposta até a rodada fechar ou o turno avançar simplesmente deixa de ser relevante; nenhuma narração especial é gerada por causa disso.
- Depende do change irmão de mesmo nome em `dungeons-api` para o campo de correlação e a geração da reação; este lado só consome o contrato novo.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `campaign-realtime-events`: o contrato de eventos ganha um id de correlação entre um `pedido_rolagem` e a rolagem/narração que o responde, e um novo tipo de narração pontual passa a ser exibido no painel de eventos assim que produzido, fora do ciclo de rodada/turno.

## Impact

- `src/realtime/types.ts`: mapear o novo campo de correlação (`pedido_evento_id`) na emissão de rolagem e no evento de narração de reação, incluindo dados do respondente para exibição.
- `src/realtime/useCampaignEvents.ts`: `emitirRolagem` passa a aceitar um `pedidoEventoId` opcional.
- `src/realtime/EventosMesaPanel.tsx`: renderizar a narração de reação associada visualmente ao card do pedido que a originou, distinta do fluxo de narração de rodada.
- `src/realtime/PedirRolagemForm.tsx` e os botões de rolagem existentes (`AtaquesTab`/`PericiasTab`/`TalentosTab`, `RolagemLivreForm`): precisam de um caminho para disparar uma rolagem "em resposta a" um pedido específico, passando seu id — ponto de coordenação com a change em andamento `pedido-rolagem-sugere-pericia`, que já está adicionando um atalho de rolagem nos cards de pedido.
- Nenhum impacto em `RodadaPanel.tsx` / `useCampaignEvents.ts`'s `rodada`, `enviarResumoRodada`, `fecharRodada` — mecanismo de rodada permanece intocado.
