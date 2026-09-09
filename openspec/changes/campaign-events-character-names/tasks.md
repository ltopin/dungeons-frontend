## 1. Dependência externa

- [x] 1.1 Confirmar que a proposta espelhada `campaign-events-character-names` no `dungeons-api` foi implementada (payload de `rolagem_dados` com `autor_nome_personagem`; payload de `pedido_rolagem` com `destinatario_nome_personagem`) antes de considerar este change completo — sem isso, o frontend só exercita o caminho de fallback.

## 2. Mapeamento de payload (`src/realtime/types.ts`)

- [x] 2.1 Adicionar `autorNomePersonagem: string | null` a `RolagemDadosPayload` e mapear de `autor_nome_personagem` em `mapRolagemDadosPayload` (ausente/`undefined` → `null`).
- [x] 2.2 Adicionar `destinatarioNomePersonagem: string | null` a `PedidoRolagemPayload` e mapear de `destinatario_nome_personagem` em `mapPedidoRolagemPayload` (ausente/`undefined` → `null`).

## 3. Painel de eventos (`src/realtime/EventosMesaPanel.tsx`)

- [x] 3.1 Em `descreverEvento`, para `rolagem_dados`: se o evento não for do usuário atual e `autorNomePersonagem` existir, usar esse nome no título; manter "Você" para o próprio autor e "Um jogador" como fallback quando `autorNomePersonagem` for `null`.
- [x] 3.2 Em `descreverEvento`, para `pedido_rolagem`: se houver `destinatarioContaId` e `destinatarioNomePersonagem` existir, usar esse nome no lugar de "um jogador"; manter "um jogador" como fallback quando `destinatarioNomePersonagem` for `null`, e "toda a mesa" quando não houver destinatário.

## 4. Testes

- [x] 4.1 Atualizar `src/realtime/EventosMesaPanel.test.tsx` cobrindo: rolagem de outro jogador com nome do personagem presente; rolagem de outro jogador sem o campo (fallback "Um jogador"); rolagem do próprio usuário (sempre "Você", mesmo com o campo presente); pedido de rolagem a jogador específico com nome presente e com fallback; pedido de rolagem a toda a mesa (inalterado).
- [x] 4.2 Atualizar `src/realtime/useCampaignEvents.test.ts` / fixtures relevantes se o formato de payload mockado precisar dos novos campos.
- [x] 4.3 Rodar a suíte de testes do frontend e `tsc -b` para confirmar que nada quebrou.
