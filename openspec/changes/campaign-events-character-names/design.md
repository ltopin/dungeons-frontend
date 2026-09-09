## Context

Ver proposal.md - Why/What Changes. Este change é espelhado no `dungeons-api` (mesmo nome de change lá, como foi feito para `campaign-realtime-events`) — este documento cobre só o lado de consumo no `dungeons-frontend`; o contrato de payload abaixo é o que a proposta espelhada na API implementa. `EventoMesa` chega pelo canal Socket.IO já mapeado em `src/realtime/types.ts` (`mapEventoFromWire`), que é a única camada que conhece a diferença snake_case (fio) / camelCase (app). `EventosMesaPanel.tsx` (`descreverEvento`) hoje só distingue "Você" (comparando `autorContaId` com `getContaAtual()?.id`) de rótulos genéricos ("Um jogador", "um jogador", "toda a mesa").

## Goals / Non-Goals

**Goals:**
- Consumir dois campos novos e opcionais no payload dos eventos (`autor_nome_personagem` em `rolagem_dados`, `destinatario_nome_personagem` em `pedido_rolagem`) e usá-los para identificar autor/alvo pelo nome do personagem.
- Degradar sem quebrar quando o evento não tiver esses campos (evento antigo, gravado antes do change da API entrar no ar, ou API ainda não atualizada).

**Non-Goals:**
- Resolver o nome no cliente a partir do roster da campanha (`listarFichasDaCampanha`) — decisão já tomada em favor do enriquecimento no servidor (ver Decisions), justamente para não precisar abrir/validar permissão de jogador ler fichas de outros jogadores nem duplicar essa resolução em duas telas (`MasterDashboard` e `CharacterSheetPage`).
- Qualquer mudança de schema/migração de dados existentes — os dois campos são opcionais no payload (`Mixed` na API).
- Implementar a mudança correspondente no `dungeons-api` (spec-only nesta sessão; ver [[project_dnd_repo_split]]).

## Decisions

### Nome do personagem chega pronto no payload do evento (enriquecimento no servidor), não é resolvido no cliente
Alternativa considerada: frontend buscar `listarFichasDaCampanha(campanhaId)` e montar um mapa `contaId → nomePersonagem`, como o `MasterDashboard` já faz para o `PedirRolagemForm`. Rejeitada porque (a) `CharacterSheetPage` — a tela do jogador, onde a maioria dos eventos de rolagem é vista — não busca esse roster hoje, e o spec de `campaigns` enquadra `GET /campanhas/:id/fichas` como parte do "Dashboard do mestre", então abrir isso para jogadores exigiria uma decisão de permissão separada; (b) resolver no servidor, no momento da criação do evento, "congela" o nome no histórico — um evento de sessão passada continua mostrando o nome do personagem de então mesmo que ele seja renomeado depois, o que é o comportamento esperado de um log de mesa.

### Campos novos são opcionais; ausência cai no rótulo genérico atual
`mapRolagemDadosPayload`/`mapPedidoRolagemPayload` tratam `autor_nome_personagem`/`destinatario_nome_personagem` ausentes como `null`, e `descreverEvento` mantém o fallback atual ("Um jogador" / "um jogador") nesse caso. Isso cobre o período de deploy em que o frontend já foi atualizado mas a API ainda não (ou eventos antigos já persistidos sem o campo), sem exigir coordenação de deploy entre os dois repositórios.

### "Você" continua tendo prioridade sobre o nome do personagem para o próprio autor
Confirmado na exploração: para a própria rolagem, o painel continua mostrando "Você" (não o nome do personagem), preservando a leitura rápida "isso aqui é meu" no meio da lista. A checagem `autorContaId === getContaAtual()?.id` continua vindo antes de usar `autorNomePersonagem`.

## Risks / Trade-offs

- [Frontend e API são deployados fora de ordem] → Campos opcionais com fallback para o rótulo genérico atual cobrem os dois sentidos (frontend novo + API antiga, ou API nova + frontend antigo ignorando o campo extra).
- [Nome do personagem pode ficar desatualizado em eventos antigos se o jogador renomear a ficha] → Comportamento intencional (ver Decisions) — é o mesmo princípio de um log de mesa mostrar quem era "Thorin" na hora, não quem ele se chama hoje.
