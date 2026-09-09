## Why

O usuário relatou sentir falta de uma forma de voltar para `/campanhas` a partir de dentro de uma campanha. Investigando, o link "Voltar à campanha" presente na ficha do jogador, na trilha de criação de personagem e na história da campanha aponta para `/campanhas/:id` — rota que, para quem tem papel de jogador, redireciona automaticamente de volta para a própria ficha (`CampaignPage.tsx` linha 64). Isso cria um loop: o jogador clica em "voltar" e é devolvido para a tela em que já estava, sem nenhum caminho de volta para a lista de campanhas a não ser editar a URL manualmente. Como um jogador pode participar de várias campanhas, esse loop o prende dentro de uma delas.

## What Changes

- `src/routes/CharacterSheetPage.tsx`: o link "Voltar à campanha" passa a apontar para `/campanhas` ("Voltar às campanhas") em vez de `/campanhas/:id`.
- `src/wizard/CharacterWizardPage.tsx`: idem.
- `src/routes/CampaignLorePage.tsx`: idem.
- Nenhuma mudança no `MasterDashboard.tsx`, que já tem "Voltar às campanhas" apontando corretamente para `/campanhas`.

Nenhuma **BREAKING** change: o link continua no mesmo lugar visual, só passa a levar a um destino que sempre funciona, em vez de um destino que só funciona para mestres.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `campaigns`: adiciona o requisito de que qualquer tela dentro de uma campanha aberta ofereça um caminho de volta para a lista de campanhas que não dependa do papel do usuário.

## Impact

- `src/routes/CharacterSheetPage.tsx`
- `src/wizard/CharacterWizardPage.tsx`
- `src/routes/CampaignLorePage.tsx`
- Testes correspondentes, se cobrirem o texto/destino do link "Voltar à campanha" (`CharacterSheetPage.test.tsx`, `CampaignFlow.test.tsx`, `CampaignLorePage.test.tsx`)
