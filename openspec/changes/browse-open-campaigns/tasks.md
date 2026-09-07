## 1. API client

- [x] 1.1 Em `src/api/types.ts`, remover o tipo `Convite` e adicionar um tipo para item da lista de campanhas abertas (ex.: `CampanhaDisponivel { id: string; nome: string }`)
- [x] 1.2 Em `src/api/campaigns.ts`, remover `gerarConvite`, `obterConviteAtivo`, `revogarConvite` e `entrarComCodigo`
- [x] 1.3 Em `src/api/campaigns.ts`, adicionar `listarCampanhasAbertas(): Promise<CampanhaDisponivel[]>` (`GET /campanhas/disponiveis`)
- [x] 1.4 Em `src/api/campaigns.ts`, adicionar `entrarNaCampanha(campanhaId: string): Promise<{ campanhaId: string; fichaId: string }>` (`POST /campanhas/:campanhaId/entrar`, sem corpo)
- [x] 1.5 Atualizar `src/api/campaigns.test.ts`: remover o teste de `entrarComCodigo`, adicionar testes de `entrarNaCampanha` (mapeamento da resposta) e `listarCampanhasAbertas`

## 2. Tela de campanhas (CampaignsListPage)

- [x] 2.1 Buscar `listarCampanhasAbertas()` em paralelo com `listarCampanhas()` ao montar a página
- [x] 2.2 Renderizar a seção "Campanhas abertas" com um item por campanha e um botão "Entrar"
- [x] 2.3 Ao clicar "Entrar", chamar `entrarNaCampanha(id)` e navegar para `/campanhas/:campanhaId` (ou direto para `/campanhas/:campanhaId/ficha`, conforme o padrão já usado após `entrarComCodigo`)
- [x] 2.4 Exibir erro (`role="alert"`) se a entrada falhar, sem navegar
- [x] 2.5 Exibir estado vazio explicativo quando não houver campanhas abertas
- [x] 2.6 Remover o link "Entrar com código" da navegação

## 3. Remoção do fluxo de código

- [x] 3.1 Remover `src/routes/JoinCampaignPage.tsx`
- [x] 3.2 Remover a rota `/campanhas/entrar` e o import de `JoinCampaignPage` em `src/App.tsx`
- [x] 3.3 Em `src/routes/MasterDashboard.tsx`, remover a seção "Convite" (estado `convite`/`erroConvite`, `handleGerarConvite`, `handleRevogarConvite`, e o `<section aria-label="Convite">`)

## 4. Testes de fluxo (CampaignFlow.test.tsx)

- [x] 4.1 Remover o describe `'convite'` (gerar/revogar) e o describe `'entrar em campanha via código'`
- [x] 4.2 Adicionar teste: a lista de campanhas abertas aparece em `/campanhas` e "Entrar" navega até a ficha (mockando `listarCampanhasAbertas` e `entrarNaCampanha`)
- [x] 4.3 Adicionar teste: erro ao entrar exibe alerta e mantém o usuário na lista
- [x] 4.4 Ajustar o teste `'navega para a campanha criada ao informar um nome válido'` para não referenciar `obterConviteAtivo`
