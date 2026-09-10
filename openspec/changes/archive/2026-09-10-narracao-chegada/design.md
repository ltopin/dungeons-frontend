## Context

Ver proposal.md - Why. O painel de rodada (`RodadaPanel.tsx`) hoje renderiza `ResumoRodadaPanel` assim que `rodada` existe no estado, sem checar se já houve qualquer narração para aquele personagem — não existe hoje o conceito de "chegada" no modelo de eventos (`EventoMesa`/`ai-session-narration`), só narração de rodada (campanha inteira, disparada ao fechar uma rodada).

Esta change depende de um contrato novo em `dungeons-api` (change irmã de mesmo nome nesse repo, ainda não implementada) para o endpoint de geração/persistência da narração de chegada. Este design assume esse contrato conforme descrito abaixo; ajustar se o contrato real do backend divergir.

## Goals / Non-Goals

**Goals:**
- Definir como o frontend detecta "esta é a primeira vez que este personagem acessa a rodada" sem depender de estado local (precisa sobreviver a reload de página, troca de aba, etc.).
- Definir o formato do novo evento de chegada e como ele se encaixa no painel de eventos existente.
- Definir o estado de carregamento exibido enquanto a narração de chegada ainda não existe.

**Non-Goals:**
- Qualquer lógica de geração de texto pela IA — decisão do backend.
- Fundir ou sincronizar narrações de chegada de personagens diferentes numa cena única de grupo — cada uma é independente (ver proposal.md).

## Decisions

### Detecção de "primeira vez" é derivada dos eventos já carregados, não de estado novo na ficha
Ao montar a tela de rodada, o frontend já recebe o histórico de eventos da campanha (`evento:historico`, via `useCampaignEvents`). Em vez de introduzir um campo novo tipo `chegadaNarrada` na ficha só para essa checagem, o frontend verifica se `eventos` já contém um `narracao_chegada` cujo `personagemId` é o do personagem atual; se não, dispara a chamada de geração.

**Alternativa considerada:** expor um booleano na ficha ou no retorno de `obterCampanha`. Descartada porque duplicaria uma informação que o canal de eventos já carrega, e criaria dois lugares para checar a mesma coisa.

**Risco aceito:** a fonte de verdade real de idempotência é o backend (ver Impact em proposal.md) — o frontend só evita a chamada supérflua no caso comum; se dois dispositivos do mesmo jogador abrirem a tela simultaneamente antes do primeiro evento chegar, ambos podem chamar o endpoint. O backend precisa ser idempotente de verdade (checar/gerar sob a mesma trava lógica), não só confiar no frontend chamar uma vez.

### Evento de chegada não carrega `rodada` no payload
`rodada-resumo-chat` introduz agrupamento visual por número de rodada no painel de eventos, usando o campo `rodada` do payload como gatilho de divisor — e explicitamente trata eventos sem esse campo (rolagem, pedido) como não disparando divisor. A narração de chegada é conceitualmente anterior à mecânica de rodadas (é uma cena de entrada, não parte da Rodada 1 em si), então segue o mesmo padrão: payload `{ texto, personagemId, personagemNome }`, sem `rodada`. Ela aparece no painel de eventos na posição cronológica correta, mas não interfere no agrupamento por rodada.

### Estado de carregamento substitui o painel de resumo, não convive com ele
Enquanto a narração de chegada do personagem atual ainda não chegou, a tela mostra um estado de carregamento (ex.: "A cena está sendo narrada…") no lugar de `ResumoRodadaPanel`, em vez de mostrar os dois simultaneamente. Evita que o jogador comece a escrever uma ação para uma cena que ainda não viu.

**Alternativa considerada:** mostrar o campo de resumo desabilitado com um aviso. Descartada porque ainda exporia a pergunta "o que você faz?" antes da resposta à pergunta mais básica "onde eu estou?", que é exatamente o problema que esta change resolve.

## Risks / Trade-offs

- [O modelo de ficha hoje não tem campo de história/antecedente livre (`FichaGeral` só tem raça, classe, nível, alinhamento, divindade, atributos, dados físicos) — a narração de chegada pode ficar genérica, limitada a esses campos estruturais] → Fora do controle desta change (contrato de geração é do backend); se o resultado ficar raso demais na prática, um campo de antecedente/história livre na ficha é uma change futura separada, não pré-requisito bloqueante desta aqui.
- [Chamada de geração da narração de chegada tem latência (fala com IA) bem diferente de qualquer outra ação hoje disparada só ao montar uma tela] → Estado de carregamento dedicado (ver Decisions) deixa isso explícito ao jogador, em vez de a tela parecer travada.
- [Dependência de contrato ainda não implementado em `dungeons-api`] → Ver Sequenciamento em proposal.md; esta change não deve ser implementada antes que o endpoint exista e esteja documentado (change irmã nesse repo).
