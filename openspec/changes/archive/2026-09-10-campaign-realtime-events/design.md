## Context

Ver proposal.md - Why/What Changes. Hoje `CampaignPage` (src/routes/CampaignPage.tsx) carrega a `Campanha` (com `role: 'mestre' | 'jogador'`) e decide entre `MasterDashboard` (mestre) e a navegação para `/campanhas/:id/ficha` (jogador) — não há nenhuma conexão de longa duração nem estado de tempo real na aplicação hoje. A camada de API (`src/api/*.ts`) é só request/response sobre `fetch`. O contrato de canal, autenticação e payloads é definido pelo change espelhado `campaign-realtime-events` no `dungeons-api` (ver design.md daquele repositório) — este documento assume esse contrato e cobre apenas o lado de consumo.

## Goals / Non-Goals

**Goals:**
- Um hook/módulo único de conexão por campanha, reaproveitado tanto pelo `MasterDashboard` quanto pela tela de ficha do jogador.
- Painel de eventos e controles de rolagem que dependem só do resultado vindo do servidor — nenhuma lógica de soma de bônus ou sorteio de dado no frontend.
- Falha de conexão em tempo real não impede o uso do resto da tela (dashboard/ficha continuam funcionando por REST normalmente).

**Non-Goals:**
- Reimplementar ou duplicar a lógica de autorização/bônus do `dungeons-api` no cliente — a UI só envia a intenção (qual item, ou qual notação livre) e exibe o que volta.
- Notificação de mudança de HP/iniciativa nesta v1 (fora de escopo também no lado da API).
- Persistir estado do painel de eventos localmente entre sessões (o histórico vem sempre do servidor ao entrar).

## Decisions

### Módulo único de conexão por campanha, montado na tela da campanha
Um módulo/hook (`useCampaignEvents(campanhaId)` ou equivalente) encapsula a conexão de tempo real, a entrada na sala da campanha e o estado do painel de eventos (histórico + eventos novos). É montado uma vez por `campanhaId`, tanto em `MasterDashboard` quanto na tela de ficha do jogador, para não duplicar a lógica de conexão entre os dois papéis.

**Alternativa considerada**: lógica de conexão duplicada em cada tela. Rejeitada — as duas telas precisam do mesmo painel e do mesmo comportamento de reconexão; um módulo único evita divergência de comportamento entre a visão do mestre e a do jogador.

### Resultado de rolagem é sempre o que o servidor devolve
Os controles de rolagem (vinculada a item ou livre) só coletam a intenção do usuário (qual item, ou a notação) e enviam; o valor mostrado no painel de eventos é sempre o que chega de volta pelo canal. Não há cálculo de bônus nem sorteio de dado no cliente, mesmo para preview.

**Alternativa considerada**: mostrar um resultado otimista no cliente e depois corrigir se o servidor devolver algo diferente. Rejeitada — para um jogo de mesa, um número "errado" aparecendo mesmo que por um instante é uma fonte real de confusão/disputa; melhor esperar o servidor confirmar.

### Painel de eventos como lista cronológica simples, sem paginação inicial na v1
O painel mostra os eventos recebidos no burst inicial (ao entrar) mais os que chegam depois, em uma lista simples. Buscar mais histórico além do burst inicial (ex.: "carregar mais antigos") fica para depois, se necessário — a v1 cobre o caso de sessão em andamento, não uma revisão extensa de sessões passadas.

**Alternativa considerada**: paginação completa com scroll infinito desde a v1. Rejeitada por escopo — o valor principal (ver e disparar rolagens ao vivo) não depende disso, e adicionar paginação depois não exige redesenho do painel.

## Risks / Trade-offs

- [Conexão de tempo real cai enquanto o usuário está na tela] → A tela (dashboard/ficha) continua funcional via REST; o painel indica visualmente que a conexão caiu e tenta reconectar, sem bloquear o resto da UI.
- [Frontend fica bloqueado até a API expor o canal de eventos] → O change da API é proposto em paralelo (mesmo nome de change, repositório `dungeons-api`); até lá, o painel pode ficar atrás de um estado "indisponível" sem quebrar o restante da tela.
- [Dois pontos de montagem do painel (`MasterDashboard` e tela de ficha do jogador) podem divergir em estilo/comportamento se não compartilharem o mesmo componente] → Mitigado pelo módulo único de conexão (ver Decisions); o componente visual do painel também deve ser compartilhado entre as duas telas.

## Migration Plan

Change aditivo: nenhuma tela existente perde comportamento, o painel é adicionado às telas já existentes. Sem dado local a migrar. Se o canal da API ainda não estiver disponível no momento do deploy do frontend, o painel deve degradar para um estado "indisponível" em vez de quebrar a tela.
