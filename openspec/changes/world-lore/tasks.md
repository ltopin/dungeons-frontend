## 1. API client e tipos

- [x] 1.1 Em `src/api/types.ts`, adicionar `Mundo { id, nome }` e `ElementoHistoria { id, mundoId, titulo, categoria, conteudo, status: 'rascunho' | 'publicado' }`
- [x] 1.2 Em `src/api/types.ts`, `Campanha` ganha `mundoId?: string`
- [x] 1.3 Criar `src/api/worlds.ts` com `criarMundo(nome)`, `listarMundos()`, `criarElemento(mundoId, { titulo, categoria, conteudo })`, `editarElemento(elementoId, dados)`, `publicarElemento(elementoId)`, `listarElementosDoMundo(mundoId)`
- [x] 1.4 Em `src/api/worlds.ts`, adicionar `listarElementosPublicadosDaCampanha(campanhaId)`
- [x] 1.5 Em `src/api/campaigns.ts`, `criarCampanha` passa a aceitar `mundoId?: string` opcional e enviá-lo no corpo do `POST /campanhas`
- [x] 1.6 Em `src/api/campaigns.ts`, adicionar `vincularMundoACampanha(campanhaId, mundoId)`
- [x] 1.7 Testes de `src/api/worlds.ts` e dos ajustes em `src/api/campaigns.ts` (mock de `apiRequest`, formato de corpo/URL)

## 2. Tela "Meus mundos" (WorldsListPage)

- [x] 2.1 Criar `src/routes/WorldsListPage.tsx`: lista os mundos do usuário (`listarMundos`), com ação "Criar mundo"
- [x] 2.2 Estado vazio explicativo quando o usuário não tem nenhum mundo
- [x] 2.3 Registrar a rota (ex.: `/mundos`) e um ponto de navegação a partir de `CampaignsListPage`

## 3. Criação de mundo (NewWorldPage)

- [x] 3.1 Criar `src/routes/NewWorldPage.tsx`: formulário com campo "Nome" (obrigatório), chama `criarMundo`
- [x] 3.2 Ao criar com sucesso, navegar para a tela de gestão do mundo recém-criado

## 4. Gestão de um mundo (WorldPage)

- [x] 4.1 Criar `src/routes/WorldPage.tsx`: carrega o mundo e seus elementos (`listarElementosDoMundo`)
- [x] 4.2 Lista de elementos com indicação visual de status (rascunho/publicado)
- [x] 4.3 Formulário de criar elemento (título, categoria — input de texto livre, conteúdo — textarea)
- [x] 4.4 Formulário de editar um elemento existente (mesmos campos, preserva o status atual)
- [x] 4.5 Ação "Publicar" num elemento em rascunho, atualizando o status na lista sem recarregar a página
- [x] 4.6 Registrar a rota (ex.: `/mundos/:mundoId`)

## 5. Vínculo de mundo à campanha

- [x] 5.1 Em `NewCampaignPage.tsx`, buscar `listarMundos()`; se houver ao menos um, exibir um seletor opcional "Mundo desta campanha" e enviar `mundoId` ao criar
- [x] 5.2 Se o usuário não tiver nenhum mundo, omitir o seletor por completo (sem estado vazio nem placeholder)
- [x] 5.3 Em `MasterDashboard.tsx`, exibir o mundo vinculado (se houver) e uma ação para vincular um mundo quando a campanha não tiver nenhum, ou trocar o mundo já vinculado (usa `vincularMundoACampanha`)

## 6. Tela "História da campanha" (CampaignLorePage)

- [x] 6.1 Criar `src/routes/CampaignLorePage.tsx`: carrega `listarElementosPublicadosDaCampanha(campanhaId)`, agrupa por categoria
- [x] 6.2 Estado vazio explicativo quando a campanha não tem mundo vinculado ou o mundo não tem elementos publicados
- [x] 6.3 Registrar a rota (ex.: `/campanhas/:id/historia`), acessível tanto a mestre quanto a jogador da campanha

## 7. Pontos de navegação para a história da campanha

- [x] 7.1 Em `MasterDashboard.tsx`, adicionar link para "História da campanha", visível só quando a campanha tem mundo vinculado
- [x] 7.2 Na tela de ficha do jogador (`CharacterSheetPage.tsx`), adicionar o mesmo link, visível só quando a campanha tem mundo vinculado

## 8. Testes

- [x] 8.1 `WorldsListPage`: lista mundos existentes; estado vazio sem nenhum mundo
- [x] 8.2 `NewWorldPage`: cria mundo com nome válido; bloqueia envio com nome vazio
- [x] 8.3 `WorldPage`: cria elemento em rascunho; edita elemento preservando status; publica um rascunho e reflete o novo status
- [x] 8.4 `WorldPage`: campo de categoria aceita texto livre sem lista fixa
- [x] 8.5 `NewCampaignPage`: seletor de mundo aparece só quando há mundos; envia `mundoId` quando selecionado; cria normalmente sem seleção
- [x] 8.6 `MasterDashboard`: exibe ação de vincular mundo quando ausente; permite trocar quando já vinculado
- [x] 8.7 `CampaignLorePage`: jogador vê elementos publicados agrupados por categoria; não vê rascunhos; estado vazio quando campanha sem mundo vinculado
- [x] 8.8 Link para "História da campanha" some no dashboard/ficha quando a campanha não tem mundo vinculado
