## Why

Uma revisão de design (`/impeccable critique`) da tela `/campanhas` apontou que a seção "Campanhas abertas" mostra hoje só o nome de cada campanha: o usuário decide entrar — e com isso registrar sua única ficha naquela campanha — sem saber quem é o mestre nem do que se trata. A API (change `open-campaign-context` no repositório `dungeons-api`) passa a expor `mestre_nome` e `descricao` em `GET /campanhas/disponiveis`, e a aceitar `descricao` opcional em `POST /campanhas`; falta o frontend capturar e exibir esses dados.

## What Changes

- `NewCampaignPage`: novo campo opcional "Descrição" (textarea), enviado como `descricao` em `criarCampanha`.
- `api/campaigns.ts`: `criarCampanha(nome: string, descricao?: string)`.
- `api/types.ts`: `CampanhaDisponivel` ganha `descricao?: string` e `mestre_nome?: string`.
- `CampaignsListPage`: cada card de "Campanhas abertas" passa a exibir o nome do mestre e a descrição (quando presentes), ao lado da data de criação já exibida.

## Capabilities

### Modified Capabilities
- `campaigns`: criação de campanha aceita descrição opcional; listagem de campanhas abertas exibe mestre e descrição.

## Impact

- `src/routes/NewCampaignPage.tsx`, `src/routes/CampaignsListPage.tsx`, `src/api/campaigns.ts`, `src/api/types.ts`, `src/styles.css` (ajuste de espaço no card para o texto extra).
- Depende do change `open-campaign-context` no `dungeons-api` já estar aplicado (novos campos na resposta e no corpo aceito por `POST /campanhas`).
