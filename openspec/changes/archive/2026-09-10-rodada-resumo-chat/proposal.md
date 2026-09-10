## Why

O resumo de rodada de cada jogador (modo exploração) e a ação de cada turno (modo combate) hoje são tratados como estado privado: os demais membros só veem um "✓ respondeu" / "aguardando", nunca o texto em si, e esse texto desaparece assim que a rodada fecha ou o turno passa. Isso impede que a mesa acompanhe em tempo real o que os colegas estão fazendo/dizendo — a experiência mais próxima de um chat de mesa que o mestre-IA deveria dar.

## What Changes

- `rodada:estado` passa a carregar o texto atual do resumo de cada jogador (não só o booleano `resumo_enviado`), atualizado em tempo real a cada envio/edição enquanto a rodada de exploração está aberta. Reenviar o resumo substitui o texto anterior silenciosamente, sem marca de "editado".
- Ao fechar a rodada, o resumo final de cada jogador vira um evento permanente no painel de eventos de mesa (novo tipo `resumo_rodada`), exibido junto com a narração da IA daquela mesma rodada — dando uma fronteira visual clara entre rodadas (agrupamento por número de rodada).
- Em modo combate, a ação de turno enviada por cada jogador passa a ser persistida e emitida como evento permanente (novo tipo `acao_turno`) assim que enviada — hoje esse texto não é salvo em lugar nenhum depois de alimentar a IA.
- Nenhuma quebra de contrato REST existente (`POST .../rodada/resumo`, `POST .../rodada/fechar` continuam iguais) — só payload adicional em `rodada:estado` e dois tipos novos de evento no canal já existente.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `campaign-realtime-events`: o painel de eventos de mesa ganha dois tipos de evento novos (`resumo_rodada`, `acao_turno`) e o estado de rodada em tempo real passa a expor o texto do resumo/ação de cada jogador, não só se ele já respondeu.

## Impact

- `src/realtime/types.ts` — novos tipos `ResumoRodadaPayload`/`AcaoTurnoPayload` e casos em `mapEventoFromWire`.
- `src/realtime/rodada.ts` — `ParticipanteRodada` ganha `resumoTexto: string | null`.
- `src/realtime/useCampaignEvents.ts`, `EventosMesaPanel.tsx`, `RodadaPanel.tsx` — exibir o texto em vez do checkmark; renderizar os dois eventos novos; agrupar o feed por rodada.
- Depende do payload novo vindo do `dungeons-api` (change irmã de mesmo nome nesse repo).
- **Sequenciamento**: aplicar depois que `fix-rodada-ia-wire-contract` estiver concluída/arquivada nos dois repos — ambas mexem em `rodadaEstado`/`sessaoIA`/`useCampaignEvents`/`RodadaPanel`.
