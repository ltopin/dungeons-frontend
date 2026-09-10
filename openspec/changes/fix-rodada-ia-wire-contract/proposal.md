## Why

A UI de rodada/narração da campanha mestrada por IA (`ai-dungeon-master`, frontend com as 28 tarefas marcadas como concluídas) foi implementada assumindo um contrato via Socket.IO — `socket.on('rodada:estado', ...)`, `socket.emit('rodada:resumo'|'rodada:fechar', ...)` — que o `dungeons-api` nunca implementou. O backend expõe essas mesmas ações apenas como rotas REST (`POST /campanhas/:id/rodada/resumo`, `POST /campanhas/:id/rodada/fechar`), não emite nenhum evento de estado de rodada, e não devolve `modo`/`rodada_corrente`/`combate` no `GET /campanhas/:id`. Na prática, o `RodadaPanel` nunca renderiza para nenhum jogador, em nenhuma campanha mestrada por IA — o estado `rodada` do frontend fica preso em `null` para sempre. Além disso, o backend já espera que, em modo combate, o jogador do turno ativo envie sua ação pelo mesmo campo `resumo`, mas o `CombateTurnoPanel` do frontend não tem nenhum campo de texto — só exibe a ordem de iniciativa. A feature está presente nos dois repos, mas não funciona de ponta a ponta.

## What Changes

- `dungeons-frontend` passa a consumir os endpoints REST reais do backend (`POST /campanhas/:id/rodada/resumo`, `POST /campanhas/:id/rodada/fechar`) para enviar resumo e fechar rodada, em vez de emitir eventos de socket inexistentes.
- `dungeons-frontend` ganha um campo de texto livre no `CombateTurnoPanel`, visível apenas para o jogador cujo turno está ativo, para declarar a ação do turno — reaproveitando o mesmo endpoint que o backend já usa para isso em modo combate.
- `dungeons-frontend` passa a obter o estado corrente da rodada (modo, participantes e quem já respondeu, ordem de iniciativa, turno atual) tanto no carregamento inicial da tela quanto em tempo real após qualquer mudança de estado (resumo enviado, rodada fechada, turno avançado), substituindo a espera por um evento de socket que nunca é emitido.
- **BREAKING** (interno, sem usuários afetados hoje pois a feature nunca funcionou de fato): remove o código que assume `rodada:resumo`/`rodada:fechar`/`rodada:estado` como eventos de socket.
- Fora do escopo desta change (repo `dungeons-api`, apenas documentado aqui como contrato assumido): o backend precisa passar a transmitir o estado da rodada — seja via um novo evento de socket na sala da campanha, seja via campo adicional no `GET /campanhas/:id`, seja ambos. Uma change irmã em `dungeons-api` (mesmo nome, `fix-rodada-ia-wire-contract`) é necessária para o backend implementar esse lado; esta proposta trata apenas do frontend.

## Capabilities

### New Capabilities
- `ai-session-narration`: painel de rodada (resumo por jogador, fechamento, narração em tempo real) e UI de turno em combate para campanhas mestradas por IA. Esta capability foi especificada dentro da change `ai-dungeon-master` (ainda não arquivada em `openspec/specs/`), mas nunca chegou a funcionar por causa do descompasso de contrato descrito acima; esta change formaliza a versão corrigida (contrato REST real + campo de ação em combate) como o `spec.md` canônico em `openspec/specs/`.

### Modified Capabilities
(nenhuma — não há capability já presente em `openspec/specs/` sendo alterada; `ai-session-narration` ainda não foi sincronizada lá)

## Impact

- `dungeons-frontend`: `src/realtime/useCampaignEvents.ts` (troca de emit/on por chamadas HTTP + nova forma de obter estado), `src/realtime/RodadaPanel.tsx` (novo campo de ação em `CombateTurnoPanel`), `src/realtime/rodada.ts` (possível ajuste no mapeamento wire→app conforme o formato real de resposta REST).
- `dungeons-api` (fora do escopo de implementação desta change, apenas contrato documentado): precisa passar a transmitir o estado da rodada de alguma forma consumível pelo frontend; ver nota em "What Changes".
- Nenhuma tela ou fluxo de campanha com mestre humano é afetado — o código só ativa quando `mestre === 'ia'`.
