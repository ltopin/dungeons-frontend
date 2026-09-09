## Why

O protótipo atual de sessão (`src/auth/session.ts`) é um placeholder documentado como "TEMPORÁRIO": qualquer nome vira uma conta via `POST /contas`, sem senha, guardado em `sessionStorage`. Isso foi deixado assim de propósito pelo change anterior (`character-sheet-persistence`), cujo `proposal.md` lista explicitamente "telas de login/cadastro e o mecanismo de autenticação em si" como fora de escopo. O repositório irmão `dungeons-api` define agora (change espelho `user-authentication` naquele repositório) cadastro/login reais por e-mail e senha com token JWT de 60 dias; este change adapta o frontend para esse contrato real.

## What Changes

- Substitui a tela de login atual (só pede "nome") por telas de **cadastro** (nome, e-mail, senha) e **login** (e-mail, senha) separadas.
- Substitui `src/auth/session.ts` (placeholder por nome) por uma sessão baseada em token: guarda o JWT retornado pelo cadastro/login, envia `Authorization: Bearer <token>` em toda chamada à API (em vez do header `X-Conta-Id`), e reidrata a sessão ao carregar o app perguntando à API "quem sou eu" com o token salvo.
- `src/api/client.ts` passa a montar o header `Authorization: Bearer` a partir do token da sessão, não mais `X-Conta-Id`. **BREAKING**
- `src/api/accounts.ts` ganha `cadastrar(nome, email, senha)` e `login(email, senha)`; remove `criarOuObterConta`. **BREAKING**
- Tela de login exibe uma mensagem de erro genérica para credenciais inválidas (sem indicar se o problema foi e-mail ou senha), refletindo o comportamento do backend.
- Logout limpa o token salvo e redireciona para a tela de login.
- Fica exatamente como está, sem mudança: a escolha entre "sou mestre" ou "sou jogador" não existe em nenhuma tela de cadastro/login — continua sendo decidida depois de logado, pela ação (criar campanha vs. entrar com código de convite), como já implementado em `CampaignsListPage`/`NewCampaignPage`/`JoinCampaignPage`.
- Fora de escopo: confirmação de e-mail, recuperação de senha esquecida, login social.

## Capabilities

### New Capabilities
- `user-auth`: telas de cadastro e login por e-mail/senha, sessão baseada em token JWT persistida no cliente, e logout.

### Modified Capabilities
(nenhuma — a capability `campaigns` já assume apenas "existe uma sessão"; este change troca como essa sessão é obtida e persistida, sem alterar os requirements de `campaigns`)

## Impact

- `src/auth/session.ts`, `src/auth/SessionContext.tsx`: reescritos para token JWT em vez de `{id, nome}` por header cru.
- `src/routes/LoginPage.tsx`: vira duas telas (ou uma tela com alternância) de cadastro e login; `src/routes/RequireSession.tsx` e o roteamento em `src/App.tsx` precisam da nova forma de sessão.
- `src/api/client.ts`, `src/api/accounts.ts`, `src/api/types.ts` (tipo `Conta` perde `identificador_autenticacao`, ganha `email`).
- Depende diretamente do contrato definido no change espelho `user-authentication` de `dungeons-api` (rotas de cadastro/login/"quem sou eu", formato do token, código de status de erro) — qualquer mudança de forma nesse contrato impacta este change.
- Implementação deste change (código React) é feita em uma sessão de trabalho própria deste repositório; os artefatos aqui descrevem o que precisa ser feito no frontend para casar com o contrato do backend.
