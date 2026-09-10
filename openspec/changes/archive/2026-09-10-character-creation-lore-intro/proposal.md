## Why

Uma campanha com mundo vinculado (gerado por IA ou criado manualmente pelo mestre) já deixa a história publicada acessível ao jogador, mas só depois que a ficha existe e já tem algo preenchido: a rota `/ficha` redireciona direto para o assistente de criação assim que detecta ficha em branco, e o assistente em si não tem nenhum link para a história. O jogador entra numa campanha nova sem nenhuma chance de ler o mundo antes de escolher raça, classe ou antecedente, e não tem como consultar a lore no meio da criação sem perder o progresso da navegação (a barra lateral do assistente não mantém estado ao sair da página).

## What Changes

- Quando a ficha do jogador ainda não foi iniciada e a campanha tem `mundoId`, o sistema busca os elementos de história publicados do mundo antes de decidir a rota: havendo pelo menos um elemento, exibe uma tela de boas-vindas com a lore (mesma listagem agrupada por categoria já usada em `CampaignLorePage`) e só segue para o assistente quando o jogador confirmar.
- Sem `mundoId`, ou com `mundoId` mas nenhum elemento publicado, o comportamento atual é preservado: redirecionamento direto para o assistente, sem tela extra.
- O assistente de criação de personagem (`CharacterWizardPage`) passa a exibir, no cabeçalho, o mesmo link "História da campanha" que a ficha manual já mostra quando há `mundoId`, para consulta livre durante qualquer etapa.
- Sem lore contextual por etapa (ex.: cruzar divindades com classe escolhida) — é a mesma listagem genérica em todos os pontos de acesso.

## Capabilities

### Modified Capabilities
- `character-creation-wizard`: a entrada no assistente para ficha nova passa a condicionar-se à leitura prévia da história do mundo quando ela existe.
- `campaigns`: o requisito de acesso à história da campanha (hoje só dashboard do mestre e ficha do jogador) passa a incluir também o assistente de criação de personagem.

## Impact

- `src/routes/CharacterSheetPage.tsx`: a branch que hoje faz `redirecionarParaTrilha` → `<Navigate>` direto passa a, quando há `mundoId`, buscar `listarElementosPublicadosDaCampanha` antes de decidir entre mostrar a tela de boas-vindas ou navegar direto.
- Nova tela de boas-vindas (provavelmente reaproveitando a listagem de `CampaignLorePage.tsx` em vez de duplicá-la) com CTA para seguir ao assistente.
- `src/wizard/CharacterWizardPage.tsx`: passa a ler `mundoId` do retorno de `obterCampanha` (hoje descartado) e exibir o link condicional no header, no mesmo padrão de `CharacterSheetPage.tsx`.
- Nenhuma mudança de contrato em `dungeons-api`: os endpoints usados (`GET /campanhas/:id` para `mundoId`, `GET /campanhas/:id/mundo/elementos` para a lore publicada) já existem e já são usados pelo jogador nesse mesmo contexto de acesso (`CampaignLorePage`).
