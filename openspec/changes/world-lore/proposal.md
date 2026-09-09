## Why

Hoje o produto não tem nenhuma tela onde o mestre registre informação sobre o universo da campanha (divindades, locais, história), nem onde o jogador consulte isso sozinho. Toda essa informação circula fora do produto (voz, chat externo), o que faz o mestre virar um gargalo constante para perguntas que ele já sabe responder de cabeça.

## What Changes

- Nova área "Meus mundos" para o mestre: criar um mundo (cenário reutilizável entre campanhas), listar os mundos próprios, e dentro de um mundo criar/editar elementos de história (título, categoria em texto livre, conteúdo) com fluxo rascunho → publicado.
- `NewCampaignPage` ganha um seletor opcional de mundo (entre os mundos do próprio mestre) ao criar uma campanha.
- Dashboard do mestre (`MasterDashboard`) ganha uma ação para vincular ou trocar o mundo de uma campanha já existente, e um link para a visão de gestão do mundo vinculado (incluindo rascunhos).
- Nova tela "História da campanha", acessível tanto ao mestre quanto aos jogadores de uma campanha vinculada a um mundo, listando os elementos publicados desse mundo, organizados por categoria, para consulta livre sem precisar perguntar ao mestre.
- Depende do change espelhado `world-lore` no `dungeons-api`, que define o contrato de mundos, elementos de história e o vínculo opcional entre campanha e mundo; a implementação da API é feita pelo agente responsável por aquele repositório — aqui apenas se consome o contrato esperado.

## Capabilities

### New Capabilities
- `world-lore`: telas de gestão de mundos e elementos de história pelo mestre dono, e leitura da história publicada pelos membros de uma campanha vinculada.

### Modified Capabilities
- `campaigns`: criação de campanha ganha um vínculo opcional a um mundo próprio do mestre; a tela da campanha ganha acesso para vincular/trocar esse mundo e para consultar sua história publicada.

## Impact

- Novas telas: `WorldsListPage.tsx` (lista de mundos do mestre), `WorldPage.tsx` (gestão de elementos de um mundo — criar, editar, publicar), `CampaignLorePage.tsx` (leitura dos elementos publicados de uma campanha, acessível a mestre e jogadores).
- `src/routes/NewCampaignPage.tsx`: seletor opcional de mundo.
- `src/routes/MasterDashboard.tsx`: ação de vincular/trocar mundo da campanha e link para a gestão do mundo e para a história da campanha.
- Ficha do jogador (`CharacterSheetPage.tsx` ou tela equivalente): link de navegação para "História da campanha".
- `src/api/worlds.ts` (novo): `criarMundo`, `listarMundos`, `criarElemento`, `editarElemento`, `publicarElemento`, `listarElementosDoMundo`, `vincularMundoACampanha`, `listarElementosPublicadosDaCampanha`.
- `src/api/types.ts`: novos tipos `Mundo` e `ElementoHistoria`; `Campanha` ganha `mundoId` opcional.
- Depende do change espelhado no `dungeons-api` (mesmo nome) para o contrato de mundos, elementos e vínculo com campanha.
