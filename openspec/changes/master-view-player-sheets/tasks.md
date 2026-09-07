## 1. API client

- [x] 1.1 Em `src/api/types.ts`, `FichaResumo` ganha `nomeJogador?: string`
- [x] 1.2 Atualizar `src/api/campaigns.test.ts` (mock de `listarFichasDaCampanha`) para cobrir `nomeJogador`

## 2. Componentes de leitura da ficha

- [x] 2.1 Criar componente(s) de visualização somente leitura para cada seção (Geral, Combate, Talentos, Ataques, Perícias, Magias, Inventário, Notas), recebendo os dados já carregados da `Ficha` e sem importar `useSectionAutosave`/`useListSection`
- [x] 2.2 Criar `CharacterSheetReadOnlyPage` (ou equivalente), com a mesma navegação por abas internas (Geral/Combate/.../Notas) de `CharacterSheetPage`, mas usando os componentes de leitura de 2.1
- [x] 2.3 Reaproveitar `obterFicha(fichaId)` para carregar os dados (função já é genérica, aceita qualquer `fichaId`)

## 3. Rota e MasterDashboard

- [x] 3.1 Adicionar rota `/campanhas/:id/fichas/:fichaId` no router (`App.tsx`), renderizando `CharacterSheetReadOnlyPage`
- [x] 3.2 Reescrever `MasterDashboard` para renderizar uma aba por item de `listarFichasDaCampanha`, rotulada com `nomePersonagem` + `nomeJogador` (fallback para só `nomePersonagem` quando `nomeJogador` ausente)
- [x] 3.3 Cada aba é um `<Link>`/`<NavLink>` para `/campanhas/:id/fichas/:fichaId`; manter o estado vazio existente ("Nenhum jogador entrou nesta campanha ainda") quando a lista é vazia

## 4. Testes

- [x] 4.1 Teste: mestre vê uma aba por ficha, rotulada com personagem e jogador
- [x] 4.2 Teste: selecionar uma aba navega para a rota da ficha e exibe todas as seções, sem nenhum input editável
- [x] 4.3 Teste: campanha sem fichas continua mostrando o estado vazio, sem abas
- [x] 4.4 Atualizar `RoleRouting.test.tsx`/`CampaignFlow.test.tsx` conforme necessário para cobrir a navegação por abas do mestre
