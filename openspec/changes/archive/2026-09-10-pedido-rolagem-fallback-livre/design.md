## Context

Ver proposal.md - Why. `EventosMesaPanel.tsx` já resolve, para cada `pedido_rolagem`, uma sugestão automática (`sugestaoParaPedido` → `sugerirEntradaDoPedido`) que só aparece quando o texto do pedido casa com uma entrada do catálogo (`catalogoRolagem`) da ficha do usuário atual. A rolagem disparada por essa sugestão já viaja corretamente correlacionada: `handleRolar(eventoId, entrada)` chama `onRolar(entrada, eventoId)`, que em `CharacterSheetPage.tsx` é `rolarEntradaCatalogo`, e essa função já aceita tanto `entrada.tipo === 'item'` (perícia/ataque/talento) quanto `entrada.tipo === 'livre'` (notação livre com `entrada.notacao`), repassando `pedidoEventoId` para `emitirRolagem` em ambos os casos. Ou seja: o caminho "rolagem livre correlacionada a um pedido" já existe na cadeia de callbacks — só falta um controle de UI que construa uma `CatalogoRolagemEntry` do tipo `livre` a partir de texto digitado pelo jogador, em vez de depender do catálogo já ter uma entrada pronta.

## Goals / Non-Goals

**Goals:**
- Garantir que todo `pedido_rolagem` visível para seu destinatário sempre tenha um jeito de responder de forma correlacionada, com ou sem casamento no catálogo.
- Reaproveitar a cadeia `onRolar`/`emitirRolagem` já existente, sem novo contrato entre `EventosMesaPanel` e `CharacterSheetPage`.
- Suportar pedidos compostos (ex.: ataque, depois dano) permitindo mais de uma rolagem correlacionada ao mesmo `pedido_evento_id` a partir do mesmo card.

**Non-Goals:**
- Expandir `catalogoRolagem`/`sugerirEntradaDoPedido` para reconhecer novos padrões de texto (ex.: entrada de "dano" por arma) — o fallback livre já resolve esses casos sem precisar de heurística de texto mais esperta.
- Mudar o comportamento de `RolagemLivreForm` (a rolagem livre "solta" da tela, sem pedido associado) — continua existindo e sem `pedido_evento_id`, para rolagens espontâneas do jogador.
- Mudar qualquer contrato do `dungeons-api` — o backend já aceita `pedido_evento_id` em qualquer rolagem.

## Decisions

1. **Novo controle constrói uma `CatalogoRolagemEntry` do tipo `livre` e reaproveita o `onRolar` já existente**, em vez de introduzir um novo prop/callback em `EventosMesaPanel`/`CharacterSheetPage`. `{ tipo: 'livre', rotulo: 'Rolagem livre', notacao }` percorre exatamente o mesmo caminho que a sugestão automática já usa (`rolarEntradaCatalogo` → `entrada.tipo === 'livre'` → `emitirRolagem({ notacao: entrada.notacao }, pedidoEventoId)`).
   Alternativa considerada: novo prop `onRolarLivre(notacao, pedidoEventoId)` dedicado — rejeitada por duplicar um caminho que já existe e funciona, só porque falta UI para alimentá-lo.

2. **Validação de notação reaproveita `isNotacaoDadosValida` de `./notacao`**, a mesma usada por `RolagemLivreForm`, para manter mensagem de erro e formato aceito (`2d6+3`) consistentes em toda a tela.
   Alternativa considerada: duplicar/relaxar a validação no novo controle — rejeitada, sem motivo para divergir do formato já validado pelo backend.

3. **Visibilidade do fallback usa a mesma checagem de destinatário de `sugestaoParaPedido`, mas não exige `catalogoRolagem`** — só `evento.tipo === 'pedido_rolagem'`, `onRolar` presente, e (`destinatarioContaId === null` ou igual à conta atual). Diferente da sugestão automática (que precisa do catálogo para tentar casar o texto), o fallback livre não depende de nenhum dado da ficha, então pode aparecer mesmo em telas que eventualmente não passem `catalogoRolagem`.
   Alternativa considerada: exigir `catalogoRolagem` também no fallback, por simetria com a sugestão — rejeitada, é uma restrição desnecessária que reduziria onde o fallback pode ajudar.

4. **O fallback livre NÃO é desabilitado por `pedidosRespondidos`/`jaRolado`** (o mecanismo que hoje desabilita a sugestão automática depois do primeiro clique). Ele fica disponível para o mesmo card indefinidamente, para suportar pedidos compostos (ex.: ataque e, depois, dano) — cada envio é uma rolagem independente, correlacionada ao mesmo `pedido_evento_id`, exatamente como o backend já suporta (`pedido-rolagem-reacao-imediata`, decisão "sem guarda de duplicidade").
   Alternativa considerada: desabilitar após o primeiro envio, igual à sugestão — rejeitada, quebraria justamente o caso que motivou esta change (pedido composto).

5. **UI compacta, sempre visível junto ao card**, em vez de um modal ou de exigir uma ação extra (ex.: "responder de outra forma") para revelar o campo. Mantém o padrão de "chat" do painel de eventos e evita mais um clique para o caso mais comum de hoje (sem correspondência automática).
   Alternativa considerada: só mostrar o fallback quando a sugestão automática NÃO encontrar nada — rejeitada porque impediria o caso de pedido composto (a sugestão encontra a entrada de ataque, mas não existe entrada de dano — o fallback precisa estar visível também quando a sugestão aparece).

## Risks / Trade-offs

- [Risco] Um jogador pode digitar uma notação que não corresponde ao que a IA realmente pediu (ex.: engana-se e rola `1d20` para um pedido de dano `1d12`) → Mitigação: nenhuma validação semântica é possível no cliente (o pedido é texto livre da IA); o mesmo risco já existe hoje em `RolagemLivreForm` e é aceito pelo produto.
- [Risco] Mostrar sugestão automática E fallback livre lado a lado pode poluir visualmente o card → Mitigação: fallback compacto (um input pequeno + botão), reaproveitando a mesma classe `roll-btn`/padrão visual já usado nos demais controles de rolagem do painel.

## Migration Plan

Aditivo e local à UI; nenhuma migração de dados. Nenhuma dependência de deploy no `dungeons-api` (o backend já aceita `pedido_evento_id` em qualquer rolagem desde `pedido-rolagem-reacao-imediata`).
