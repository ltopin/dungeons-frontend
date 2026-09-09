## Why

Hoje o `MasterDashboard` só lista um resumo raso das fichas da campanha (`nomePersonagem — classe (nível)`) como texto simples, sem link para abrir nada. O mestre não tem como consultar a ficha completa de um jogador (perícias, talentos, inventário, magias etc.), mesmo sendo isso essencial para conduzir a campanha.

## What Changes

- `MasterDashboard` passa a exibir uma aba por ficha registrada na campanha (rótulo: personagem + nome do jogador), navegando para uma rota dedicada por ficha em vez do `<ul>` de texto atual.
- Nova rota `/campanhas/:id/fichas/:fichaId` (contexto do mestre) abre a ficha selecionada em **modo somente leitura**, com as mesmas 8 seções do editor do jogador (Geral, Combate, Talentos, Ataques, Perícias, Magias, Inventário, Notas).
- Novo componente de visualização somente leitura, separado dos componentes de edição existentes (`GeralTab`, `CombateTab` etc.) — não reaproveita `useSectionAutosave`/`useListSection`, para que a evolução do modo leitura não arrisque introduzir edição acidental nem acoplar os dois modos.
- `FichaResumo` ganha `nomeJogador`, consumido no rótulo da aba externa. Depende do change correspondente no `dungeons-api` expor esse campo em `GET /campanhas/:id/fichas`.

## Capabilities

### Modified Capabilities
- `campaigns`: o dashboard do mestre passa de uma lista de texto para navegação por abas, uma por ficha, cada uma levando a uma rota dedicada.
- `character-sheets`: adiciona um modo de visualização somente leitura da ficha completa, acessível ao mestre da campanha.

## Impact

- `src/routes/MasterDashboard.tsx`, `src/routes/CampaignPage.tsx` (nova rota aninhada), `src/api/types.ts` (`FichaResumo.nomeJogador`), `src/api/campaigns.ts`.
- Novo(s) componente(s) de visualização somente leitura da ficha (local a definir em design.md).
- Depende do change espelhado no `dungeons-api` que expõe `nome_jogador` em `GET /campanhas/:id/fichas`; implementação da API é feita pelo agente responsável por aquele repositório — aqui apenas se propõe e mantém o contrato esperado.
