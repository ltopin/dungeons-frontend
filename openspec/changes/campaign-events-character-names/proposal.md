## Why

O painel de eventos de mesa (`campaign-realtime-events`) hoje identifica quem fez o quê de forma genérica: uma rolagem de outro jogador aparece como "Um jogador rolou X", e um pedido de rolagem do mestre para alguém específico aparece como "Mestre pediu uma rolagem para um jogador" — nunca o nome do personagem envolvido. Numa mesa com vários jogadores isso obriga quem está lendo o painel a adivinhar quem rolou ou foi chamado, o que esvazia o valor do painel como log da sessão. Como cada jogador tem exatamente uma ficha por campanha, o nome do personagem autor (ou alvo) de cada evento é sempre resolvível sem ambiguidade — só falta ele chegar até a UI.

## What Changes

- **dungeons-api** (spec-only nesta sessão — proposta espelhada lá para outro agente implementar): o payload do evento `rolagem_dados` passa a incluir `autor_nome_personagem`, resolvido a partir da ficha do autor no momento em que o evento é criado (rolagem por item já carrega a ficha para validar o dono; rolagem livre por notação ganha um lookup adicional por `autor_conta_id` + `campanha_id`). O payload do evento `pedido_rolagem` passa a incluir `destinatario_nome_personagem` quando há um destinatário específico, resolvido do mesmo jeito. Os nomes ficam gravados no evento (documento já é `payload: Mixed`, sem migração) — um evento antigo mantém o nome do personagem de quando ocorreu, mesmo que a ficha seja renomeada depois.
- **dungeons-frontend**: `EventosMesaPanel` passa a exibir `"${autorNomePersonagem} rolou ${origem}"` para rolagens de outros jogadores (mantendo "Você rolou X" para a própria rolagem) e `"Mestre pediu uma rolagem para ${destinatarioNomePersonagem}"` para pedidos com destinatário específico (mantendo "toda a mesa" quando não há destinatário). `types.ts` ganha os dois campos novos no mapeamento de payload.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `campaign-realtime-events`: o painel de eventos passa a identificar o autor de uma rolagem de dados e o destinatário de um pedido de rolagem pelo nome do personagem (ficha), em vez de um rótulo genérico ("Um jogador" / "um jogador").

## Impact

- **dungeons-frontend**: `src/realtime/types.ts` (mapeamento de payload), `src/realtime/EventosMesaPanel.tsx` (texto exibido), testes correspondentes (`EventosMesaPanel.test.tsx`, `useCampaignEvents.test.ts`).
- **dungeons-api** (fora do escopo de implementação desta sessão, só proposta): `src/services/eventosMesa.ts` (`emitirRolagemDados`, `pedirRolagem`), possivelmente um lookup novo de `Ficha` por `(jogador_conta_id, campanha_id)` para o caso de rolagem livre.
- Nenhuma mudança de schema/migração — `payload` já é `Mixed`; eventos antigos sem os campos novos continuam válidos (frontend trata a ausência como já trata hoje, caindo no rótulo genérico anterior).
