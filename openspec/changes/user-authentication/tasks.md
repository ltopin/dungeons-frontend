## 1. Tipos e API client

- [x] 1.1 Atualizar `src/api/types.ts`: tipo `Conta` perde `identificador_autenticacao`, ganha `email`
- [x] 1.2 Reescrever `src/api/accounts.ts`: remover `criarOuObterConta`; adicionar `cadastrar(nome, email, senha)` (`POST /auth/cadastro`), `login(email, senha)` (`POST /auth/login`), e `obterContaAtual()` (`GET /contas/me`)
- [x] 1.3 Atualizar `src/api/client.ts`: enviar `Authorization: Bearer <token>` a partir do token da sessão, em vez de `X-Conta-Id`

## 2. Sessão

- [x] 2.1 Reescrever `src/auth/session.ts`: persistir `{ token, conta }` em `localStorage` (não mais `sessionStorage`); expor `cadastrar(nome, email, senha)` e `entrar(email, senha)` que chamam a API e salvam o resultado
- [x] 2.2 Implementar reidratação: ao carregar o módulo, se existe token salvo, chamar `obterContaAtual()`; se a chamada falhar (401), limpar a sessão salva
- [x] 2.3 Expor um estado de "carregando sessão" (pendente da chamada de reidratação) consumível pelo restante do app
- [x] 2.4 Atualizar `sairDaConta()` para limpar o token de `localStorage`
- [x] 2.5 Atualizar `src/auth/SessionContext.tsx` se a forma do estado exposto mudar (token + conta em vez de `{id, nome}` cru)

## 3. Telas

- [x] 3.1 Criar tela de cadastro (nome, e-mail, senha) reaproveitando a estrutura de `src/routes/LoginPage.tsx`; em sucesso, navega para `/campanhas`
- [x] 3.2 Reescrever `src/routes/LoginPage.tsx` para pedir e-mail e senha (não mais nome), com link para a tela de cadastro
- [x] 3.3 Exibir mensagem de erro genérica em login malsucedido e mensagem específica de e-mail duplicado em cadastro malsucedido
- [x] 3.4 Adicionar ação de logout (usa `sairDaConta()`) em algum ponto da navegação da área logada
- [x] 3.5 Atualizar `src/routes/RequireSession.tsx` para tratar o estado de "carregando sessão" (não redirecionar para login antes da reidratação terminar)
- [x] 3.6 Registrar a nova rota de cadastro em `src/App.tsx`

## 4. Testes

- [x] 4.1 Atualizar `src/test/fixtures.ts` se depender do formato antigo de conta/sessão (não depende — nada a mudar)
- [x] 4.2 Reescrever `src/routes/LoginPage.test.tsx` para o fluxo de e-mail/senha e cobrir o cenário de erro genérico
- [x] 4.3 Adicionar teste da nova tela de cadastro (sucesso e e-mail duplicado)
- [x] 4.4 Adicionar teste de reidratação de sessão (token válido mantém sessão; token inválido limpa e mostra login)
- [x] 4.5 Atualizar `src/routes/RoleRouting.test.tsx` e `src/routes/CampaignFlow.test.tsx` para o novo helper/formato de sessão nos testes (`src/routes/CharacterSheetPage.test.tsx` também usava o formato antigo e foi atualizado junto)

## 5. Validação final

- [x] 5.1 Rodar `npm test` e confirmar que toda a suíte passa com o novo fluxo de sessão
- [ ] 5.2 Testar manualmente no navegador: cadastro → recarregar página (sessão mantida) → logout → login → criar campanha → sair e entrar com outra conta via código de convite
