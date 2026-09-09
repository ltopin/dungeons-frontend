## Why

No editor de ficha (`/campanhas/:id/ficha`), uma edição feita numa aba (ex.: Geral) é salva com sucesso no backend, mas some visualmente ao trocar de aba e voltar — só um refresh de página recupera o dado. Causa: `CharacterSheetPage` renderiza cada aba condicionalmente (desmontando a anterior), e os hooks de autosave (`useSectionAutosave`, `useListSection`) inicializam seu estado local a partir do prop recebido apenas uma vez no mount, sem nunca re-sincronizar com o resultado do save. Como a página nunca atualiza sua `ficha` após um PATCH bem-sucedido, remontar uma aba sempre volta ao snapshot carregado no GET inicial. Adicionalmente, o cleanup do debounce de autosave cancela o timer pendente sem disparar o save, então uma edição feita menos de 1s antes de trocar de aba é descartada e nem sobrevive a um refresh.

## What Changes

- `useSectionAutosave` e `useListSection` (e `useMagiaNiveis`) passam a expor o resultado confirmado pelo backend ao chamador via callback, em vez de descartá-lo após `setStatus('salvo')`.
- `CharacterSheetPage` passa a manter sua `ficha` atualizada com o retorno de cada save bem-sucedido, para que qualquer aba, ao remontar, receba o dado mais recente em vez do snapshot do carregamento inicial.
- O cleanup de desmontagem dos hooks de autosave passa a disparar (flush) qualquer save pendente em vez de apenas cancelar o timer, evitando perda de edições feitas nos últimos instantes antes de trocar de aba.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `character-sheets`: o editor de ficha passa a preservar edições salvas ao trocar de aba (sem exigir refresh) e a garantir que uma edição pendente no momento da troca de aba seja persistida antes de descartar o estado local da aba.

## Impact

- `src/routes/CharacterSheetPage.tsx` — passa a receber/propagar atualizações de seção para sua `ficha`.
- `src/sheet/useSectionAutosave.ts`, `src/sheet/useListSection.ts`, `src/sheet/useMagiaNiveis.ts` — expõem o resultado do save via callback e fazem flush no unmount.
- Todas as abas em `src/sheet/tabs/*.tsx` — passam a receber e usar o novo callback ao invocar os hooks acima.
- Nenhuma mudança de API/backend; é puramente sincronização de estado no frontend.
