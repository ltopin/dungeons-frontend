## Context

Ver proposal.md - Why. Dois fatos do código atual moldam a abordagem:

- O frontend já tem todo o código de **consumo** de estado pronto e testado: `rodada.ts`'s `mapEstadoRodadaFromWire` e o tipo `EstadoRodadaWire` (`{modo, rodada, participantes: {conta_id, nome, resumo_enviado}[], ordem_iniciativa?, turno_atual_conta_id}`) já são exatamente o formato que faria o `RodadaPanel` funcionar — só falta algo do lado do servidor realmente popular isso.
- O `dungeons-api` já implementa toda a lógica de negócio (`submeterResumoRodada`, `fecharRodada` em `sessaoIA.ts`, incluindo o branch de combate que resolve a ação do jogador e avança turnos de NPC automaticamente) — só expõe isso via REST (`POST /campanhas/:id/rodada/resumo`, `POST /campanhas/:id/rodada/fechar`) e nunca transmite o estado resultante para os clientes conectados.

Ou seja: as duas metades já existem, só não foram conectadas uma à outra.

## Goals / Non-Goals

**Goals:**
- Definir exatamente qual lado (frontend/backend) muda o quê, minimizando reescrita do que já funciona.
- Manter a UI ao vivo (sem reload, sem polling) que a spec original já pedia.
- Deixar o contrato entre os dois repos documentado de forma inequívoca, já que a implementação do lado `dungeons-api` está fora do escopo desta change (é uma change irmã, mesmo nome, naquele repo).

**Non-Goals:**
- Redesenhar o modelo de dados de combate/rodada no backend (`Campanha.rodada_corrente`, `Campanha.combate`) — usamos o que já existe.
- Mudar a forma como rolagens de dados (`rolagem:emitir`/`rolagem:pedir`) funcionam — esse canal já está correto e não é tocado.
- Resolver o gap de nome de autor em eventos (já documentado como fora de escopo em `campaign-realtime-events`).

## Decisions

### 1. Envio de ação (resumo/fechar) continua via REST, não migra para socket
O `dungeons-api` já implementa `POST .../rodada/resumo` e `POST .../rodada/fechar` com toda a autorização (`requireMembership`, checagem de turno em combate) e a chamada à IA. Reescrever isso como handlers de socket duplicaria essa lógica sem necessidade. **Decisão:** o frontend troca `socket.emit('rodada:resumo'|'rodada:fechar', ...)` por `fetch`/`axios` REST para esses dois endpoints. Alternativa considerada — adicionar handlers de socket espelhando os REST — rejeitada por duplicar autorização e lógica de negócio em dois lugares.

### 2. Estado da rodada é transmitido por um evento de socket, não por polling nem só no GET da campanha
A spec exige que mudanças de estado apareçam para **todos os membros conectados**, não só para quem fez a ação (ex.: jogador B precisa ver que jogador A respondeu, sem recarregar). Um campo a mais no `GET /campanhas/:id` resolveria a carga inicial, mas não resolve atualização ao vivo para quem já está com a tela aberta. **Decisão:** `dungeons-api` transmite um evento `rodada:estado` (nome já usado pelo frontend existente — ver Contexto) para a sala da campanha (`salaCampanha`, o mesmo mecanismo já usado por `evento:novo`) em dois momentos:
  - Ao final de `submeterResumoRodada` e `fecharRodada` (após qualquer mudança de estado, incluindo avanços automáticos de turno de NPC).
  - Ao entrar na sala (`sala:entrar`), logo após emitir `evento:historico`, para popular o estado inicial de quem acabou de conectar — elimina a necessidade de um campo adicional no `GET /campanhas/:id`.

  Alternativa considerada — expor `modo`/`rodada_corrente`/`combate` no `GET /campanhas/:id` e o frontend recarregar (refetch) após cada ação própria — rejeitada: não atualiza outros membros já conectados sem polling, o que contradiz a spec (`Requirement: Estado da rodada sempre observável pelos membros`, cenário "Estado muda enquanto a tela está aberta").

### 3. Payload do `rodada:estado` reaproveita o formato que o frontend já espera
`EstadoRodadaWire` já existe e já é consumido corretamente por `RodadaPanel`/`mapEstadoRodadaFromWire`. **Decisão:** o backend monta o payload exatamente nesse formato (`modo`, `rodada`, `participantes: {conta_id, nome, resumo_enviado}[]`, `ordem_iniciativa` quando em combate, `turno_atual_conta_id`), evitando qualquer mudança no código de parsing do frontend. Isso é o contrato assumido pela change irmã em `dungeons-api`.

### 4. Ação de combate reaproveita o mesmo endpoint e o mesmo componente de envio
O backend já trata `POST rodada/resumo` de forma diferente quando `campanha.modo === 'combate'` (valida que é o turno do autor, resolve a ação, avança turno, resolve NPCs). **Decisão:** o `CombateTurnoPanel` ganha um formulário de texto livre visível só para `contaId === turnoAtualContaId`, reaproveitando a mesma função `enviarResumoRodada` (mesmo endpoint REST) já usada em exploração — só muda o rótulo/placeholder do campo e a condição de exibição, não o transporte.

## Risks / Trade-offs

- [Risco] Depender de dois repos avançarem juntos — se o `dungeons-frontend` for ao ar antes do `dungeons-api` emitir `rodada:estado` corretamente, o sintoma observado é idêntico ao bug atual (painel nunca aparece), só que por outro motivo. → Mitigação: as duas changes (mesmo nome nos dois repos) só devem ser consideradas concluídas/arquivadas depois de um teste manual ponta a ponta confirmando o painel aparecendo para dois jogadores simultâneos.
- [Risco] Múltiplos avanços de turno de NPC dentro de uma única requisição (`resolverTurnosNPCAutomaticos`) podem gerar várias transmissões de `rodada:estado` em sequência rápida. → Mitigação: aceitável — cada emissão reflete um estado real e válido; o cliente sempre re-renderiza a partir do último estado recebido, sem acumular.
- [Trade-off] Ação (REST) e leitura de estado (socket) usam transportes diferentes, o que é assimétrico. → Aceito conscientemente: evita duplicar autorização/lógica de negócio (decisão 1) e evita polling (decisão 2); o custo é documentar bem o contrato, que é o propósito deste design.md.

## Migration Plan

Não há dado existente para migrar — a feature nunca funcionou de ponta a ponta, então não há comportamento em produção para preservar. As duas changes (frontend e a irmã em `dungeons-api`) devem subir e ser verificadas juntas; não há necessidade de feature flag, já que o código só ativa quando `mestre === 'ia'` e hoje não faz nada de qualquer forma nesse caso.

## Open Questions

- Copy exata do campo de ação em combate (placeholder, rótulo do botão) — decisão de conteúdo, não de comportamento; fica para a implementação (tasks.md), sem impacto na spec.
