## Context

Ver proposal.md - Why. `CharacterSheetPage.tsx` já busca `mundoId` da campanha e, quando a ficha ainda não foi iniciada, redireciona imediatamente para `/ficha/criar` (`CharacterWizardPage`) sem nenhuma parada intermediária. `CampaignLorePage.tsx` já implementa a listagem de elementos publicados agrupados por categoria via `listarElementosPublicadosDaCampanha`, reaproveitada tanto pelo mestre quanto pelo jogador em outros pontos da UI.

## Goals / Non-Goals

**Goals:**
- Reaproveitar a listagem e o endpoint já usados por `CampaignLorePage` em vez de duplicar a lógica de busca/agrupamento.
- Preservar o comportamento atual (redirecionamento direto) para toda campanha sem mundo vinculado ou sem história publicada — zero fricção adicional nesses casos, que hoje são a maioria.
- Falhar de forma aberta: um erro ao buscar a história publicada não deve impedir o jogador de criar seu personagem.

**Non-Goals:**
- Lore contextual por etapa do assistente (ex.: cruzar divindades com classe escolhida) — fica para uma change futura, se houver demanda.
- Persistir preferência de "já vi essa tela" — a tela de boas-vindas reaparece sempre que a ficha ainda está em branco, o que é aceitável dado que ela só aparece nesse estado transitório.
- Mudar o contrato de `dungeons-api` — os dois endpoints usados já existem e já são acessíveis ao jogador nesse mesmo contexto.

## Decisions

**Tela de boas-vindas como um novo estado renderizado por `CharacterSheetPage`, não uma rota nova.** A decisão de ir para o assistente já mora em `CharacterSheetPage` (`redirecionarParaTrilha`). Em vez de criar uma rota `/ficha/intro` separada, a própria branch que hoje faz `<Navigate>` passa a, quando há `mundoId`, buscar os elementos publicados primeiro e decidir entre renderizar a tela de boas-vindas (elementos não vazios) ou navegar direto (vazio, ou mundo ausente). Alternativa considerada: rota dedicada — descartada porque exigiria propagar `mundoId`/estado de navegação entre rotas sem ganho real, já que a decisão já é feita nesse componente.

**Reaproveitar a listagem de `CampaignLorePage` como componente compartilhado.** A tela de boas-vindas mostra a mesma lore, agrupada por categoria, que `CampaignLorePage` já exibe. Extrair a listagem (agrupamento + renderização) para um componente comum evita duas implementações divergentes da mesma lógica de agrupamento por categoria.

**Falha na busca da história = seguir direto pro assistente.** Um erro de rede ao buscar `listarElementosPublicadosDaCampanha` não deve virar uma tela de erro bloqueante nesse ponto específico — diferente de `CampaignLorePage`, que é uma navegação deliberada do usuário e pode mostrar erro com retry. Aqui, a leitura da história é incidental à entrada na criação de personagem; se falhar, o sistema trata como "sem história disponível" e segue.

**Link no header do assistente busca `mundoId` do mesmo jeito que `CharacterSheetPage` já faz.** `CharacterWizardPage` já chama `obterCampanha(id)` e descarta a maior parte da resposta — só precisa parar de descartar `mundoId` e replicar a condicional de header já existente em `CharacterSheetPage`.

## Risks / Trade-offs

- [Duas buscas de rede sequenciais antes de decidir a UI (campanha, depois elementos)] → aceitável: já é o padrão hoje (campanha, depois ficha); a chamada extra só ocorre quando há `mundoId`, e nenhuma delas bloqueia campanhas sem mundo vinculado.
- [Tela de boas-vindas reaparece toda vez que o jogador sai e volta antes de preencher qualquer campo] → aceitável dado o Non-Goal explícito de não persistir "já vi"; evita estado adicional para um caso transitório e de baixo custo (um clique a mais).
