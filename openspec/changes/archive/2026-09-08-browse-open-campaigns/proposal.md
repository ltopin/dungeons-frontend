## Why

O fluxo atual de entrada em campanha depende de o mestre gerar um código de convite e enviá-lo ao jogador por um canal externo (WhatsApp, Discord etc.) antes que ele consiga entrar. Isso cria atrito desnecessário e não deixa o jogador descobrir campanhas por conta própria. Queremos que qualquer campanha fique visível e abrível diretamente pela lista, sem código. Um mecanismo de restrição (senha) para campanhas privadas fica para uma iteração futura — por ora, toda campanha criada é aberta a qualquer jogador autenticado.

## What Changes

- `CampaignsListPage` ganha uma seção "Campanhas abertas" listando todas as campanhas em que o usuário autenticado ainda não é membro, cada uma com uma ação "Entrar" que cria a membership e a ficha imediatamente e navega para a campanha.
- Campanhas em que o usuário já é membro (mestre ou jogador) continuam em "Suas campanhas" e somem da lista de "Campanhas abertas" (mas a campanha em si continua listada para outros jogadores).
- **BREAKING**: Remove a página `/campanhas/entrar` (`JoinCampaignPage`) e o formulário de código de convite.
- **BREAKING**: Remove a seção "Convite" do `MasterDashboard` (gerar/revogar código) — não há mais convite para gerenciar.
- `api/campaigns.ts`: remove `gerarConvite`, `obterConviteAtivo`, `revogarConvite`, `entrarComCodigo`; adiciona `listarCampanhasAbertas()` e `entrarNaCampanha(campanhaId)`.
- `api/types.ts`: remove o tipo `Convite`; adiciona um tipo para item da lista de campanhas abertas (nome da campanha, dados básicos — sem código).

## Capabilities

### Modified Capabilities
- `campaigns`: substitui "gerar/revogar convite" e "entrar via código" por "listar campanhas abertas" e "entrar diretamente"; as demais regras (criar campanha, dashboard do mestre, jogador vai direto à ficha) permanecem.

## Impact

- Frontend: `src/routes/CampaignsListPage.tsx`, `src/routes/JoinCampaignPage.tsx` (removido), `src/routes/MasterDashboard.tsx`, `src/api/campaigns.ts`, `src/api/types.ts`, configuração de rotas (remove `/campanhas/entrar`).
- Backend (`dungeons-api`, repositório separado): precisa de um endpoint para listar campanhas abertas (excluindo as em que a conta já é membro) e um endpoint para entrar em uma campanha sem código. Os endpoints de convite (`POST /campanhas/:id/convites`, `GET /campanhas/:id/convites/ativo`, `DELETE .../convites/:id`) e o corpo `{ codigo }` de `POST /campanhas/entrar` deixam de ser necessários. Essa mudança de contrato é tratada como uma spec própria nesse outro repositório.
