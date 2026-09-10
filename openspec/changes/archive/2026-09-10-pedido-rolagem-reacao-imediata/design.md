## Context

See proposal.md - Why. The round/turn UI (`RodadaPanel.tsx`) and the events panel (`EventosMesaPanel.tsx`) are two independent consumers of `useCampaignEvents`; `pedido_rolagem`/`rolagem_dados` events today only ever render as static log entries (`EventosMesaPanel.tsx`'s `descreverEvento`), with no id passed back when a roll is emitted (`emitirRolagem` in `useCampaignEvents.ts` takes `tipoItem`/`itemId`/`notacao` only). The sibling `dungeons-api` change (same name) adds an optional `pedido_evento_id` on `rolagem:emitir`, plus a reaction narração event tagged with `pedido_evento_id`/`respondente_conta_id`/`respondente_nome_personagem`.

## Goals / Non-Goals

**Goals:**
- Let any roll UI (free-roll form, tab roll buttons, and eventually a shortcut from the in-progress `pedido-rolagem-sugere-pericia`) optionally say "this roll answers pedido X".
- Render the resulting reaction narração distinctly, associated with the pedido/rolagem pair that produced it.

**Non-Goals:**
- Building the shortcut-roll-from-pedido-card UI itself — that's `pedido-rolagem-sugere-pericia`'s scope; this change only makes sure whatever triggers a roll *can* pass a `pedidoEventoId` through.
- Any change to `RodadaPanel.tsx` or round/turn state.

## Decisions

1. **`emitirRolagem` gains an optional trailing parameter `pedidoEventoId?: string`.** Threaded through unchanged to the `rolagem:emitir` socket emit payload as `pedido_evento_id`. Existing callers that don't pass it are unaffected.
   Alternative considered: a separate `emitirRolagemRespondendoPedido` function — rejected, adds a second API surface for what's structurally the same call with one more optional field.

2. **Correlation is opt-in per call site, never inferred.** A roll only carries `pedidoEventoId` when the UI that triggered it explicitly knows which pedido it's answering (i.e., a future "responder" action on a `pedido_rolagem` card). A player using the generic tab roll buttons or free-roll form while a pedido happens to be open does NOT get auto-correlated — avoids guessing wrong when multiple pedidos are open, or the roll is unrelated to any of them.

3. **`types.ts` gains `pedidoEventoId`/`respondenteContaId`/`respondenteNomePersonagem` on the narração event mapping** (mirrors the existing `autorNomePersonagem`/`destinatarioNomePersonagem` optional-field pattern already used for `campaign-events-character-names`). A `narracao` event with `pedidoEventoId` set is a reação pontual; without it, it's regular round narração — same discriminated union, no new event-type branch needed.

4. **`EventosMesaPanel.tsx` renders a reaction distinctly** — visually associated with the originating pedido/rolagem (using `pedidoEventoId` to look up that prior event in the already-loaded `eventos` array) instead of blending into the generic narração stream, and labels it with `respondenteNomePersonagem` so a table-wide pedido's independent reactions are each clearly attributed.
   Alternative considered: no special grouping, just show it in chronological order like any other event — rejected; the explicit design goal is that the reaction reads as "the response to this", not a disconnected narration beat.

## Risks / Trade-offs

- [Risco] Até uma change adicionar um jeito de rolar "em resposta a" um pedido pela UI (ex.: `pedido-rolagem-sugere-pericia`), não existe nenhum caminho de UI que preencha `pedidoEventoId` — o contrato e a exibição ficam prontos, mas sem produtor real → Mitigação: aceitável; esta change entrega o contrato consumível, e o botão de atalho fica como próximo passo natural (já sinalizado no proposal.md).
- [Risco] Se `pedidoEventoId` referenciar um evento fora da janela de eventos já carregada no painel (ex.: pedido antigo, fora do burst inicial), a UI não consegue localizar o card original para agrupar visualmente → Mitigação: fallback gracioso — exibir a reação normalmente, apenas sem o agrupamento visual, nunca ocultar a narração.

## Migration Plan

Aditivo; nenhuma migração de dados no frontend. Depende do deploy do change irmão em `dungeons-api` para o campo e o evento existirem de fato; até lá, este código apenas nunca recebe/envia o campo novo, sem quebrar nada existente.
