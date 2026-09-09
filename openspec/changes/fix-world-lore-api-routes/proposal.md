## Why

O `world-lore` foi implementado em paralelo no `dungeons-frontend` e no `dungeons-api`, ambos a partir da mesma spec comportamental (`openspec/specs/world-lore/spec.md`, que descreve apenas requisitos SHALL, sem fixar formato de URL ou de corpo). As duas implementações divergiram no contrato de rede: 4 chamadas do frontend batem em rotas que não existem no backend real (404), e 2 chamadas enviam campos com casing que o backend não reconhece (falha silenciosa). O resultado é que editar/publicar elemento de história, ver a história publicada de uma campanha, e vincular um mundo a uma campanha estão todos quebrados em produção, apesar de todas as tasks do change `world-lore` estarem marcadas como concluídas.

## What Changes

- Corrigir `editarElemento` em `src/api/worlds.ts` para chamar `PATCH /mundos/:mundoId/elementos/:elementoId` (rota real, aninhada sob o mundo) em vez de `PATCH /elementos/:elementoId`.
- Corrigir `publicarElemento` em `src/api/worlds.ts` para chamar `POST /mundos/:mundoId/elementos/:elementoId/publicar` em vez de `POST /elementos/:elementoId/publicar`.
- Corrigir `listarElementosPublicadosDaCampanha` em `src/api/worlds.ts` para chamar `GET /campanhas/:campanhaId/mundo/elementos` em vez de `GET /campanhas/:campanhaId/historia`.
- Corrigir `vincularMundoACampanha` em `src/api/campaigns.ts` para usar `PATCH /campanhas/:campanhaId/mundo` (método correto) em vez de `POST`.
- Corrigir o corpo enviado por `criarCampanha` e `vincularMundoACampanha` em `src/api/campaigns.ts` para usar a chave `mundo_id` (snake_case, como o backend espera) em vez de `mundoId`.
- Ajustar as assinaturas de `editarElemento` e `publicarElemento` (e os componentes que as chamam, como `WorldPage.tsx`) para também passar o `mundoId`, já que ele agora faz parte do caminho.
- Ajustar os testes existentes (`api/worlds.test.ts`, `api/campaigns.test.ts` se houver, `WorldPage.test.tsx`) para refletir os novos caminhos/corpos e servir como trava contra nova divergência.

Nenhuma **BREAKING** change de comportamento observável pelo usuário: as telas continuam com o mesmo fluxo, só passam a efetivamente funcionar.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
(nenhuma — o comportamento descrito em `specs/world-lore` e `specs/campaigns` não muda; este change corrige apenas o contrato de rede entre uma implementação de frontend e o backend real, que já respeitam a spec cada um a seu modo)

## Impact

- `src/api/worlds.ts` — 3 funções (`editarElemento`, `publicarElemento`, `listarElementosPublicadosDaCampanha`)
- `src/api/campaigns.ts` — 2 funções (`criarCampanha`, `vincularMundoACampanha`)
- `src/routes/WorldPage.tsx` — precisa passar `mundoId` para `editarElemento`/`publicarElemento`
- Testes correspondentes em `src/api/worlds.test.ts` e `src/routes/WorldPage.test.tsx`
- Nenhum impacto em `dungeons-api` (backend já está correto; é o consumidor que precisa se ajustar)
