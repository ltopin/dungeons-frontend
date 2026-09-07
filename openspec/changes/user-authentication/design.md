## Context

Ver `proposal.md` para a motivação. O placeholder atual (`src/auth/session.ts`) guarda `{id, nome}` em `sessionStorage` e `src/api/client.ts` envia `X-Conta-Id` a cada chamada. O contrato novo, definido no change espelho `user-authentication` de `dungeons-api`, expõe `POST /auth/cadastro`, `POST /auth/login` (ambos retornando `{ conta, token }`) e `GET /contas/me` (retorna a conta a partir do `Authorization: Bearer <token>`).

## Goals / Non-Goals

**Goals:**
- Sessão baseada no token JWT retornado pela API, persistida no cliente e enviada como `Authorization: Bearer <token>` em toda chamada.
- Reidratação de sessão ao carregar o app: se existe um token salvo, validar contra `GET /contas/me` antes de considerar a pessoa logada.
- Duas telas separadas (cadastro e login), já que os campos e o endpoint de destino são diferentes.

**Non-Goals:**
- Qualquer UI de escolha de papel mestre/jogador — não existe e não deve ser adicionada (ver `specs/user-auth/spec.md`).
- Lembrar sessão entre dispositivos ou navegadores diferentes — cada navegador tem sua própria sessão local.
- Refresh automático de token antes da expiração — quando o token de 60 dias expirar, a próxima chamada autenticada falha e a pessoa é levada de volta ao login (ver spec: "Token expirado ou inválido exige novo login").

## Decisions

### 1. Onde persistir o token: `localStorage`, não `sessionStorage`
O placeholder atual usa `sessionStorage` (perde a sessão ao fechar a aba). Com um token de 60 dias, o comportamento esperado é permanecer logado entre sessões do navegador — `sessionStorage` contradiria a expiração de 60 dias combinada no backend. Trade-off aceito: `localStorage` é acessível a qualquer script na mesma origem (risco XSS), mas não há uma alternativa mais segura disponível sem introduzir cookie httpOnly e, com isso, uma dependência de o backend suportar CORS com credenciais — fora de escopo deste change.

### 2. Reidratação via `GET /contas/me`, não decodificar o JWT no cliente
Ao carregar o app com um token salvo, o cliente chama `GET /contas/me` em vez de decodificar o payload do JWT localmente. Isso garante que um token expirado ou uma conta que deixou de existir sejam detectados pelo mesmo caminho usado no resto do app (uma resposta 401 da API), em vez de duplicar a lógica de expiração no frontend.

### 3. Cadastro e login como telas separadas, não uma alternância no mesmo formulário
Os campos diferem (cadastro pede nome; login não) e as mensagens de erro são semanticamente diferentes (409 e-mail duplicado vs. 401 credenciais inválidas). Duas rotas (`/cadastro` e `/login`) com um link cruzado entre elas mantém cada tela e seu tratamento de erro simples, seguindo o padrão já usado no repositório de uma página por fluxo (`NewCampaignPage`, `JoinCampaignPage`).

### 4. `SessionContext`/`useContaAtual` mantêm a mesma interface pública onde possível
`src/auth/SessionContext.tsx` e o padrão `useSyncExternalStore` são reaproveitados; só o formato armazenado muda (token + dados da conta, em vez de `{id, nome}` cru), para minimizar o raio de mudança em `RequireSession.tsx` e nas páginas que já consomem `useContaAtual()`.

## Risks / Trade-offs

- [Token em `localStorage` é acessível via XSS] → aceito conscientemente (ver Decisão 1); mitigação real seria cookie httpOnly, fora de escopo.
- [Reidratação depende de uma chamada de rede (`GET /contas/me`) antes de renderizar a área logada] → introduz um estado de "carregando sessão" no boot do app, que hoje não existe (a sessão placeholder é síncrona a partir do `sessionStorage`); telas que usam `RequireSession` precisam tratar esse estado intermediário.

## Migration Plan

Não há sessão real de usuário a preservar — o placeholder nunca teve senha nem foi usado em produção. Ao publicar este change, qualquer sessão antiga no `sessionStorage` do formato `{id, nome}` simplesmente para de ser lida pelo novo código; não é necessário migrar ou converter dados salvos no navegador.
