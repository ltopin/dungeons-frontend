## Why

Ao concluir a ficha e entrar pela primeira vez na tela de rodada de uma campanha mestrada por IA, o jogador cai direto num campo de texto vazio perguntando "o que seu personagem faz nesta rodada?" — sem qualquer narração prévia dizendo onde o personagem está, com quem, ou o que está acontecendo. A narração da IA só existe hoje como resposta ao fechamento de uma rodada (`ai-session-narration`); não há nenhuma cena de abertura. O jogador é forçado a agir antes de saber o que está vendo.

## What Changes

- Ao entrar pela primeira vez na tela de rodada, cada personagem (não a campanha como um todo) recebe sua própria narração de chegada, gerada pela IA a partir do contexto daquele personagem (raça, classe e demais campos da ficha disponíveis no momento). É individual por personagem, não uma cena única compartilhada — assim funciona igual em campanhas solo e multiplayer, sem precisar esperar que todos os jogadores estejam presentes.
- Essa narração de chegada aparece no painel de eventos de mesa como um novo tipo de evento, distinto da narração de rodada normal, identificando de quem é a chegada — visível a todos os membros conectados, não só ao personagem que chegou.
- Enquanto a narração de chegada daquele personagem ainda não existe, a tela de rodada exibe um estado de carregamento em vez do campo de resumo, evitando que o jogador escreva uma ação antes de saber a cena.
- Geração é feita uma única vez por personagem (idempotente) — reentrar na tela depois da primeira vez não dispara uma nova narração de chegada nem duplica o evento.
- Só se aplica a campanhas mestradas por IA (`mestre === 'ia'`); nenhuma mudança para campanhas com mestre humano.
- Depende de um contrato novo em `dungeons-api` (change irmã de mesmo nome nesse repo) para gerar, persistir e transmitir esse evento — ver Impact.

## Capabilities

### Modified Capabilities
- `ai-session-narration`: ganha um novo requisito de narração de chegada individual por personagem, disparada no primeiro acesso à tela de rodada, antes do fluxo de resumo de rodada existente.

## Impact

- `src/realtime/types.ts` — novo tipo de evento `narracao_chegada` com payload `{ texto, personagemId, personagemNome }` e caso em `mapEventoFromWire`.
- `src/api/aiMaster.ts` — nova função para disparar a narração de chegada (endpoint REST a definir em `dungeons-api`, mesmo padrão de `enviarResumoRodada`/`fecharRodada`).
- `src/routes/CharacterSheetPage.tsx` / `src/realtime/useCampaignEvents.ts` — ao detectar campanha IA sem narração de chegada do personagem atual nos eventos já carregados, disparar a chamada e exibir estado de carregamento até o evento chegar.
- `src/realtime/EventosMesaPanel.tsx` — novo caso de renderização para `narracao_chegada`, distinguindo visualmente de `narracao_ia`.
- `dungeons-api` (fora do escopo de implementação desta change, apenas contrato documentado — ver change irmã de mesmo nome nesse repo): precisa expor um endpoint que gere (via IA, usando o contexto do personagem) e persista esse evento de forma idempotente por personagem.
- **Sequenciamento**: aplicar depois que `fix-rodada-ia-wire-contract` e `rodada-resumo-chat` estiverem concluídas/arquivadas nos dois repos — todas mexem em `useCampaignEvents.ts`/`RodadaPanel.tsx`/`EventosMesaPanel.tsx`/`types.ts`, e esta change assume o contrato REST (não socket) já corrigido por `fix-rodada-ia-wire-contract` e o agrupamento por rodada já introduzido por `rodada-resumo-chat`.
