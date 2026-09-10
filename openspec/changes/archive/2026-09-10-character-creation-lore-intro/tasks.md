## 1. Componente compartilhado de listagem de história

- [x] 1.1 Extrair de `CampaignLorePage.tsx` a lógica de agrupamento por categoria e a renderização da lista de elementos publicados para um componente reaproveitável (ex.: `LoreList`), sem mudar o comportamento/markup atual de `CampaignLorePage`.
- [x] 1.2 Atualizar `CampaignLorePage.tsx` para usar o componente extraído.

## 2. Tela de boas-vindas antes do assistente

- [x] 2.1 Criar o componente da tela de boas-vindas: recebe os elementos publicados, usa `LoreList` (tarefa 1.1) para exibi-los agrupados por categoria, e expõe uma ação "Começar a criar meu personagem".
- [x] 2.2 Em `CharacterSheetPage.tsx`, na branch de `redirecionarParaTrilha`: quando `mundoId` estiver presente, buscar `listarElementosPublicadosDaCampanha(id)` antes de decidir a UI.
- [x] 2.3 Se a busca retornar ao menos um elemento, renderizar a tela de boas-vindas em vez do `<Navigate>` direto; ao confirmar, navegar para `/campanhas/${id}/ficha/criar`.
- [x] 2.4 Se a busca retornar lista vazia, sem `mundoId`, ou se a busca falhar, manter o `<Navigate>` direto para `/campanhas/${id}/ficha/criar` (comportamento atual preservado).

## 3. Acesso à história durante o assistente

- [x] 3.1 Em `CharacterWizardPage.tsx`, capturar `mundoId` do retorno de `obterCampanha` (hoje descartado).
- [x] 3.2 Exibir no header do assistente o mesmo link condicional "História da campanha" (`/campanhas/${id}/historia`) já usado em `CharacterSheetPage.tsx`, visível quando `mundoId` estiver presente.

## 4. Testes

- [x] 4.1 Testes da tela de boas-vindas: exibe a lore agrupada por categoria, e navega para o assistente ao confirmar.
- [x] 4.2 Testes de `CharacterSheetPage`: com `mundoId` e elementos publicados → mostra boas-vindas em vez de redirecionar direto; sem `mundoId`, com `mundoId` mas lista vazia, e com falha na busca → redireciona direto para o assistente (três casos).
- [x] 4.3 Teste de `CharacterWizardPage`: link "História da campanha" aparece quando `mundoId` está presente e não aparece quando ausente.
