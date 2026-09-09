## 1. `useSectionAutosave`

- [x] 1.1 Adicionar parâmetro opcional `onSaved?: (value: T) => void`, invocado com o valor retornado por `atualizarSecao` após um save bem-sucedido (não o valor otimista local).
- [x] 1.2 No `useEffect` de cleanup, se houver um patch pendente em `pendingRef`, disparar `save(pendingRef.current)` (flush) antes de limpar o timer, em vez de só `clearTimeout`.
- [x] 1.3 Atualizar/adicionar testes em `useSectionAutosave.test.ts` cobrindo: `onSaved` é chamado com o valor confirmado pela API; unmount com patch pendente dispara o save.

## 2. `useListSection`

- [x] 2.1 Adicionar parâmetro opcional `onItemsChange?: (items: Item[]) => void` (ou callback equivalente), invocado após `addItem`, `removerLinha` e após um save de campo bem-sucedido, refletindo o array `items` atualizado.
- [x] 2.2 Garantir flush de qualquer edição de campo pendente (por linha) no cleanup de desmontagem, análogo à tarefa 1.2.
- [x] 2.3 Atualizar/adicionar testes em `useListSection.test.ts` cobrindo `onItemsChange` e o flush no unmount.

## 3. `useMagiaNiveis`

- [x] 3.1 Aplicar o mesmo padrão de callback (`onSaved`) e, se houver debounce pendente, flush no unmount, seguindo o mesmo raciocínio das seções 1 e 2.

## 4. `CharacterSheetPage`

- [x] 4.1 Para cada seção (`geral`, `combate`, `magiasConfig`, `moedas`, `notas`, `talentos`, `ataques`, `pericias`, `magiaNiveis`, `magias`, `itens`), criar um callback que atualiza `ficha` via `setFicha((f) => f && { ...f, <secao>: valor })` e passá-lo para a aba correspondente.
- [x] 4.2 Confirmar que `ficha` permanece a fonte de verdade única passada como prop para todas as abas, sem introduzir estado duplicado na página.

## 5. Abas (`src/sheet/tabs/*.tsx`)

- [x] 5.1 `GeralTab`: repassar o novo callback de `CharacterSheetPage` para `useSectionAutosave`.
- [x] 5.2 `CombateTab`: idem.
- [x] 5.3 `TalentosTab`: repassar callback de `useListSection`.
- [x] 5.4 `AtaquesTab`: idem.
- [x] 5.5 `PericiasTab`: idem.
- [x] 5.6 `MagiasTab`: repassar callbacks de `useSectionAutosave` (config), `useListSection` (magias) e `useMagiaNiveis`.
- [x] 5.7 `InventarioTab`: repassar callbacks de `useSectionAutosave` (moedas) e `useListSection` (itens).
- [x] 5.8 `NotasTab`: repassar callback de `useSectionAutosave`.
- [x] 5.9 `FamiliarTab` (aba adicionada por outra change em paralelo, `character-sheet-computed-fields`, após a proposta deste change): mesmo tratamento, por consistência — mesmo padrão de bug se não tratada.

## 6. Verificação

Não há backend local disponível nesta sessão (a API vive no repo `dungeons-api`), então a verificação foi feita via testes de integração automatizados em `CharacterSheetPage.test.tsx` (mockando a API, mesmo padrão dos testes já existentes no arquivo) em vez de manualmente no navegador.

- [x] 6.1 Teste "preserva um campo de Geral editado e salvo ao trocar de aba e voltar, sem precisar de refresh": edita `nomePersonagem`, aguarda o autosave confirmar, troca para Combate e volta para Geral, confirma que o valor editado permanece.
- [x] 6.2 Teste "preserva uma linha de Talentos editada e salva ao trocar de aba e voltar, sem precisar de refresh": edita o nome de um talento, aguarda o autosave confirmar, troca de aba e volta, confirma que a linha editada permanece.
- [x] 6.3 Teste "salva uma edição em Notas mesmo trocando de aba antes do debounce de 1s disparar": edita as notas e troca de aba imediatamente (sem aguardar o debounce), confirma que `atualizarSecao` foi chamado mesmo assim — valida o flush no unmount.

Recomendado: repetir manualmente em `/campanhas/:id/ficha` contra o backend real antes do deploy, cobrindo também Perícias/Ataques/Magias/Inventário/Familiar (mesmo padrão, não testados individualmente aqui).
