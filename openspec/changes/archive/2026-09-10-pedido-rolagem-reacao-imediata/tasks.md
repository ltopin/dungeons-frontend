## 1. Contrato de eventos

- [x] 1.1 Em `src/realtime/types.ts`, mapear `pedido_evento_id`→`pedidoEventoId`, `respondente_conta_id`→`respondenteContaId` e `respondente_nome_personagem`→`respondenteNomePersonagem` no payload de `rolagem_dados` e de `narracao`
- [x] 1.2 Garantir que um evento `narracao` com `pedidoEventoId` presente continua compatível com o tratamento existente de narração de rodada (sem quebrar `RodadaPanel`/agrupamento por rodada)

## 2. Emissão de rolagem correlacionada

- [x] 2.1 Em `useCampaignEvents.ts`, adicionar parâmetro opcional `pedidoEventoId?: string` a `emitirRolagem`, repassado como `pedido_evento_id` no `socket.emit("rolagem:emitir", ...)`

## 3. Exibição da reação no painel

- [x] 3.1 Em `EventosMesaPanel.tsx`, ao renderizar um evento `narracao` com `pedidoEventoId`, localizar (se disponível na lista já carregada) o `pedido_rolagem`/`rolagem_dados` originais e exibir a reação associada visualmente a eles
- [x] 3.2 Exibir `respondenteNomePersonagem` na reação, para atribuição clara em pedidos dirigidos à mesa toda
- [x] 3.3 Fallback: se o pedido original não estiver na janela de eventos carregada, exibir a reação normalmente (sem agrupamento visual), nunca ocultá-la

## 4. Testes

- [x] 4.1 Teste: `emitirRolagem` chamado com `pedidoEventoId` envia `pedido_evento_id` no payload do socket
- [x] 4.2 Teste: `emitirRolagem` chamado sem `pedidoEventoId` mantém o payload atual (sem o campo)
- [x] 4.3 Teste: `EventosMesaPanel` associa visualmente uma reação (`narracao` com `pedidoEventoId`) ao pedido/rolagem correspondente
- [x] 4.4 Teste: `EventosMesaPanel` exibe a reação normalmente mesmo quando o pedido original não está na lista carregada
- [x] 4.5 Confirmar que nenhum teste existente de `RodadaPanel`/`useCampaignEvents` (resumo, fechar rodada, ação de turno) quebra com as mudanças de tipos

## 5. Validação

- [x] 5.1 `tsc -b` limpo
- [x] 5.2 `npm run build` limpo
- [x] 5.3 `vitest run` completo, sem regressões
- [x] 5.4 `openspec validate pedido-rolagem-reacao-imediata --strict`
- [ ] 5.5 Verificação manual ponta a ponta só é possível após o deploy do change irmão em `dungeons-api` — sinalizar como dependência externa, não bloqueante para o merge deste lado
