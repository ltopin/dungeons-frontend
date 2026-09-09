## Context

Ver `proposal.md` - Why. O padrão de tela existente (`CampaignsListPage`, `NewCampaignPage`, `MasterDashboard`, `CampaignPage`) segue: um módulo `src/api/<recurso>.ts` fino sobre `apiRequest` (`src/api/client.ts`), tipos em `src/api/types.ts`, componentes de rota que carregam dados em `useEffect`, tratam `null` (carregando) / erro (com "Tentar novamente") / vazio (mensagem explicativa) / preenchido, e usam as classes utilitárias já existentes (`campaigns-screen__*`). Este change reaproveita esse padrão em vez de introduzir um novo.

`CampanhaDoc.mundo_id` (do change espelhado `world-lore` no `dungeons-api`) só aparece no payload de `Campanha` quando definido - análogo a como `descricao`/`mestre_nome` já são opcionais em `CampanhaDisponivel` hoje.

## Goals / Non-Goals

**Goals:**
- Reaproveitar o padrão de tela/API já estabelecido nas telas de campanha, sem introduzir uma biblioteca de UI nova.
- Uma única tela de leitura ("História da campanha") serve tanto o mestre quanto o jogador, evitando duas implementações da mesma listagem.

**Non-Goals:**
- Editor de texto rico (WYSIWYG) para o campo `conteudo` - um `textarea` simples é suficiente nesta primeira versão; o mestre do exemplo que motivou este change já escreve em texto corrido.
- Busca textual entre elementos - a organização por categoria (agrupamento simples) é suficiente para o volume esperado.
- Qualquer integração com o canal em tempo real (`campaign-realtime-events`); publicar um elemento não emite nenhum evento de socket.

## Decisions

**Rotas novas dedicadas a mundo (`/mundos`, `/mundos/:mundoId`), separadas das rotas de campanha.**
Um mundo não pertence a nenhuma campanha específica (pode não ter nenhuma, ou várias) - colocar sua gestão sob `/campanhas/...` sugeriria uma relação de posse que não existe. `WorldsListPage` e `WorldPage` vivem no mesmo nível de navegação que `CampaignsListPage`.

**"História da campanha" é uma rota sob a campanha (`/campanhas/:id/historia`), não sob o mundo.**
Diferente da gestão (que é sempre feita pelo dono, direto no mundo), a leitura é sempre feita no contexto de uma campanha específica - é onde o jogador já está navegando, e é a campanha (não o mundo) que define quem tem permissão de ler. A tela busca o `mundoId` da campanha e delega ao endpoint de elementos publicados por campanha (não ao endpoint de elementos do mundo, que exige ser dono).

**Link para "História da campanha" nunca aparece se a campanha não tem mundo vinculado.**
Evita levar o jogador a uma tela vazia sem explicação na maioria dos casos (campanha sem mundo ainda). Quando o mestre vincula um mundo depois, o link passa a aparecer na próxima vez que a tela de campanha/ficha for carregada - não precisa de atualização em tempo real.

**Seletor de mundo em `NewCampaignPage` busca a lista de mundos do usuário só se ele tiver pelo menos um.**
Evita adicionar uma chamada de API extra (e um estado de carregamento) numa tela crítica de onboarding quando o usuário nunca criou um mundo - o campo dropdown some por completo (não aparece vazio) até o usuário ter ao menos um mundo.

## Risks / Trade-offs

- [Formulário de elemento com `textarea` simples pode ficar ruim para o exemplo de divindade (texto longo com muitas seções)] → Aceitável para a v1 - o mestre já escreve com formatação manual em texto corrido (linha em branco entre seções); um editor rico pode ser adicionado depois sem mudar o contrato (`conteudo` continua sendo uma string).
- [Mestre esquece de vincular um mundo à campanha e jogadores nunca veem o link de história] → Mitigado pelo dashboard do mestre sempre mostrar a ação "Vincular mundo" quando a campanha não tem um, tornando o estado visível a quem pode corrigi-lo.
