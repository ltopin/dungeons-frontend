## Purpose

Define as telas e o comportamento de sessão no cliente para que uma pessoa se cadastre, faça login, permaneça autenticada entre recarregamentos, e saia, sem que nenhuma dessas telas pergunte ou decida papel de mestre/jogador.

## Requirements

### Requirement: Tela de cadastro
O sistema SHALL oferecer uma tela de cadastro que colete nome, e-mail e senha, e que leve a pessoa para a área logada imediatamente após um cadastro bem-sucedido.

#### Scenario: Cadastro bem-sucedido leva à área logada
- **WHEN** a pessoa preenche nome, e-mail e senha na tela de cadastro e a API confirma a criação da conta
- **THEN** a sessão é estabelecida com o token retornado e a pessoa é redirecionada para a lista de campanhas

#### Scenario: Cadastro rejeitado exibe erro sem perder os dados digitados
- **WHEN** a API rejeita o cadastro (por exemplo, e-mail já usado)
- **THEN** a tela exibe uma mensagem de erro e mantém nome e e-mail já digitados, sem navegar para outra tela

### Requirement: Tela de login
O sistema SHALL oferecer uma tela de login separada da tela de cadastro, que colete e-mail e senha.

#### Scenario: Login bem-sucedido leva à área logada
- **WHEN** a pessoa preenche e-mail e senha corretos na tela de login
- **THEN** a sessão é estabelecida com o token retornado e a pessoa é redirecionada para a lista de campanhas

#### Scenario: Login rejeitado exibe erro genérico
- **WHEN** a API rejeita o login por e-mail ou senha incorretos
- **THEN** a tela exibe uma única mensagem de erro genérica, sem indicar se o problema foi o e-mail ou a senha

### Requirement: Nenhuma tela de cadastro ou login pergunta papel
As telas de cadastro e login SHALL não oferecer nenhuma escolha de papel (mestre/jogador); esse papel continua sendo decidido depois de logado, pela ação de criar campanha ou entrar com código de convite.

#### Scenario: Formulário de cadastro não tem campo de papel
- **WHEN** a pessoa visualiza a tela de cadastro
- **THEN** não existe nenhum campo, botão ou opção para escolher "mestre" ou "jogador"

### Requirement: Sessão persistida entre recarregamentos
O sistema SHALL manter a pessoa autenticada entre recarregamentos da página enquanto o token salvo continuar válido, sem exigir login novamente.

#### Scenario: Recarregar a página mantém a sessão
- **WHEN** a pessoa recarrega a página com um token de sessão válido salvo de um login ou cadastro anterior
- **THEN** o sistema reidrata a sessão automaticamente e não exibe a tela de login

#### Scenario: Token expirado ou inválido exige novo login
- **WHEN** a pessoa recarrega a página e o token salvo foi rejeitado pela API por estar expirado ou inválido
- **THEN** o sistema limpa a sessão salva e exibe a tela de login

### Requirement: Logout
O sistema SHALL permitir encerrar a sessão atual, descartando o token salvo e retornando à tela de login.

#### Scenario: Logout limpa a sessão
- **WHEN** a pessoa aciona a opção de sair
- **THEN** o token salvo é descartado e a pessoa é redirecionada para a tela de login, sem conseguir acessar telas que exigem sessão até logar novamente
