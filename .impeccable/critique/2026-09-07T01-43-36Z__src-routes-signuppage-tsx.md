---
target: /cadastro (src/routes/SignupPage.tsx)
total_score: 15
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\SignupPage.tsx"
target_fingerprint: "sha256:188c62bef288466f483b890bc0419fa1b66aeca93e17fc91a38af60857b2b7b2"
target_path: "C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\SignupPage.tsx"
timestamp: 2026-09-07T01-43-36Z
slug: src-routes-signuppage-tsx
closed: true
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | Botão continua "Cadastrar" durante a chamada assíncrona (linha 50); só o `disabled` muda — sem spinner, sem "Cadastrando…", sem confirmação de sucesso antes do `navigate('/campanhas')` silencioso (linha 20). |
| 2 | Match System / Real World | 1 | O h1 diz "Livro de Ligações" (linha 34) — nome da funcionalidade de ficha de personagem — numa tela de criação de conta. Nada indica que essa é a tela de cadastro. |
| 3 | User Control and Freedom | 3 | Existe saída ("Já tem conta? Entrar", linha 54) e nada destrutivo está em jogo; only os campos continuam editáveis durante o envio sem cancelamento visível. |
| 4 | Consistency and Standards | 2 | Consistente com LoginPage (mesma estrutura, mesmo padrão de erro/disabled) — mas essa consistência inclui o mesmo h1 emprestado indevidamente, e o par é totalmente inconsistente com a única tela com tema da aplicação (a ficha). |
| 5 | Error Prevention | 1 | Nenhum dos três campos (linhas 38, 42, 46) tem `required`, `minLength` ou qualquer validação client-side; nenhuma regra de senha é mostrada. |
| 6 | Recognition Rather Than Recall | 2 | Campos têm label textual (bom), mas sem `autoComplete` e sem requisitos de senha visíveis — usuário precisa adivinhar. |
| 7 | Flexibility and Efficiency of Use | 2 | Enter funciona para submeter, mas sem `autoComplete` para acelerar autofill de gerenciador de senhas/navegador. |
| 8 | Aesthetic and Minimalist Design | 1 | Poucos campos (bom), mas hierarquia visual zero — h1, labels, inputs e botão no peso padrão do navegador, sobre fundo escuro (`body` em styles.css) com controles provavelmente claros por padrão. |
| 9 | Error Recovery | 2 | O caso 409 tem mensagem específica e bem escrita ("Este e-mail já está cadastrado.", linha 23) — mas qualquer outra falha vira um catch-all vago (linha 25), e o `role="alert"` (linha 48) não move o foco. |
| 10 | Help and Documentation | 0 | Nenhuma affordance de ajuda na tela — sem regras de senha, sem tooltip, sem link. Tela de tarefa (Operate) onde isso seria razoável ter. |
| **Total** | | **15/40** | **Poor** |

## Design Specificity Verdict

**Avaliação (revisão de design)**: Totalmente intercambiável com qualquer produto — nenhum `className` existe em `SignupPage.tsx`; só regras de tag pura (`body`, `main`) em `styles.css` alcançam essa tela. O único gesto de identidade — o h1 "Livro de Ligações" — é na verdade um empréstimo mal aplicado: essa é a marca da ficha de personagem (tema de tomo de couro escuro com selos dourados, totalmente implementado e escopado a `.ficha-sheet` em `styles.css`, linhas 48-549), e nenhum desses tokens (`--gold`, `--panel`, `--parchment`, `--line`) chega a esta tela. A identidade mais trabalhada do app fica a um arquivo de distância, sem uso aqui, enquanto a porta de entrada real do produto (criação de conta) fica nua.

**Varredura determinística**: `impeccable detect --json src/routes/SignupPage.tsx` rodou limpo — exit code 0, `[]` (zero findings). Nenhum falso positivo a reportar (não houve achado nenhum). Evidência manual complementar: nenhum `htmlFor`/`id` explícito nos três labels (linhas 36-47, associação só por wrapping); zero atributos `aria-*` no arquivo inteiro; `role="alert"` presente na linha 48 (ponto positivo, mas sem gerenciamento de foco); zero `className` em qualquer elemento — logo nenhuma regra de `.ficha-sheet`/`.section-header`/`.save-status*` alcança esta página, só `body`/`main` (fundo `#1c140f`, texto `#f3e6d0`, `main` com `max-width: 960px`). SignupPage e LoginPage compartilham padrão idêntico de markup para e-mail, senha e erro (evidência objetiva, não julgamento).

**Overlays visuais**: não disponíveis — nenhuma ferramenta de automação de navegador (Playwright/DevTools) está exposta nesta sessão, então a etapa de injeção/overlay no navegador foi pulada. Sinal de fallback explícito: nenhuma evidência visual renderizada foi capturada; toda leitura de aparência acima é inferida do código-fonte, não verificada em pixel.

## Overall Impression

A tela funciona mecanicamente, mas não parece pertencer ao mesmo produto que a ficha de personagem. É a porta de entrada do app e é também a tela menos trabalhada — zero estilo, zero prevenção de erro, zero confirmação de sucesso, e um título que na verdade pertence a outra funcionalidade. A maior oportunidade não é "deixar bonito": é fechar o buraco de confiança no momento mais delicado (criar uma conta nova) e resolver a incoerência de identidade antes de qualquer polimento visual.

## What's Working

1. **Mensagem de conflito (409) bem escrita**: "Este e-mail já está cadastrado." (linha 23) é específica, em linguagem simples, e trata corretamente o erro mais comum (re-cadastro) — melhor que a maioria dos formulários de signup.
2. **Paridade estrutural com LoginPage**: mesmo padrão de label/input, mesmo posicionamento de `role="alert"`, mesmo padrão de disabled durante envio — uma base limpa e aprendível para aplicar estilo e validação reais sem reestruturar.
3. **Minimalismo de campos**: exatamente três inputs, sem confirmação de senha redundante, sem fricção desnecessária (CAPTCHA etc.) — escopo adequado para uma ferramenta de uso pessoal.

## Priority Issues

**[P1] Nenhum estilo próprio — o único tema da aplicação nunca chega à porta de entrada**
- Por que importa: `SignupPage.tsx` não usa nenhum `className`; só as regras de tag pura em `styles.css` a tocam. O tema de tomo de couro escoado em `.ficha-sheet` (linhas 48-549) — o que dá identidade ao app — está totalmente ausente na primeira tela que qualquer usuário vê. O salto visual de "formulário genérico" para "tomo totalmente realizado" no primeiro login vai parecer quebrado ou inacabado.
- Fix: extrair os tokens centrais da ficha (`--bg`, `--panel`, `--gold`, `--gold-bright`, `--parchment`, `--line`) para um escopo compartilhado (não aninhado dentro de `.ficha-sheet`) e aplicar uma classe leve tipo `.auth-form` em Signup/Login usando esses tokens no fundo, nos inputs e no botão.
- Comando sugerido: `/impeccable adapt`

**[P1] Título incoerente: "Livro de Ligações" numa tela de criação de conta**
- Por que importa: o h1 da linha 34 empresta o nome da funcionalidade de ficha para uma tela sem relação funcional, idêntico ao h1 da LoginPage (linha 28). Não orienta a tarefa e arrisca confundir quem chega pela primeira vez sobre em que tela está.
- Fix: substituir por um título específico da tarefa ("Criar conta") e mover qualquer wordmark/branding do produto para um elemento persistente do shell, em vez de trocar por rota.
- Comando sugerido: `/impeccable clarify`

**[P1] Nenhuma prevenção de erro client-side em nenhum campo**
- Por que importa: nenhum dos três inputs (linhas 38, 42, 46) tem `required`, `minLength` ou `autoComplete`, e nenhuma regra de senha é exibida. O usuário só descobre que o input foi rejeitado pela mensagem genérica única da linha 25 ("Não foi possível cadastrar. Tente novamente."), que não nomeia campo nem motivo.
- Fix: adicionar `required` e valores de `autoComplete` apropriados (`name`, `email`, `new-password`), mostrar requisitos reais de senha inline, e diferenciar erros por campo em vez de uma mensagem genérica única.
- Comando sugerido: `/impeccable harden`

**[P2] Nenhum feedback de carregamento ou sucesso**
- Por que importa: durante o envio o botão continua "Cadastrar" (linha 50) — só o `disabled` muda, sem spinner ou mudança de texto. No sucesso, `navigate('/campanhas')` (linha 20) dispara sem nenhuma confirmação. A interação de maior risco percebido da tela (minha conta foi criada mesmo?) não recebe reconhecimento nenhum.
- Fix: trocar o texto do botão para um estado de carregamento ("Cadastrando…") e adicionar um breve reconhecimento de sucesso antes/durante o redirecionamento.
- Comando sugerido: `/impeccable delight`

**[P2] Tratamento de erro genérico mascara causas reais e não garante anúncio**
- Por que importa: o branch `else` (linha 25) trata falha de rede, erro de servidor e falha de validação de forma idêntica, sem detalhe distintivo. Combinado com a ausência de movimentação de foco para o `role="alert"` (linha 48), um usuário de teclado/leitor de tela não tem garantia de perceber o erro prontamente.
- Fix: diferenciar categorias de erro na mensagem, e mover o foco para o elemento de erro (ou forçar o anúncio) na falha.
- Comando sugerido: `/impeccable harden`

## Persona Red Flags

**Jordan (Iniciante)**
- Chega numa tela com título "Livro de Ligações" sem nenhuma indicação de que é criação de conta — vai hesitar, sem saber se é a tela certa (linha 34).
- Nenhum requisito de senha é mostrado; Jordan só descobre se a senha foi aceita pela mensagem vaga da linha 25, que não explica o motivo.
- O cadastro é bem-sucedido silenciosamente — direto para `/campanhas` (linha 20) sem nenhum momento de "conta criada" — Jordan pode genuinamente duvidar se funcionou.

**Sam (Dependente de acessibilidade)**
- O erro `<p role="alert">` (linha 48) só entra no DOM após a falha, sem gerenciamento de foco — não há garantia de que o leitor de tela vai capturar o anúncio.
- Nenhum `aria-invalid`/`aria-describedby` liga os inputs ao texto de erro — Sam recebe um alerta flutuante desconectado de qual campo falhou.
- Nenhum valor de `autoComplete` nos inputs remove a assistência do gerenciador de senhas, que importa mais para quem tem limitação motora.
- Comportamento de foco visível em inputs/botão é totalmente não verificado — nenhum estilo de `:focus-visible` existe tocando esta página.

**Casey (Mobile distraído)**
- Nenhuma regra responsiva específica além do `max-width`/padding do `main`; tamanho de área de toque dos inputs/botão não verificado.
- Falta de `autoComplete` força Casey a digitar nome/e-mail/senha manualmente no teclado do celular em vez de usar credenciais salvas.
- Estado vive só em `useState` local (linhas 7-10) sem nada persistido; se Casey for interrompido e a aba recarregar, tudo digitado se perde sem aviso.

## Minor Observations

- Campo de senha não tem botão de mostrar/ocultar — nenhuma forma de conferir o que foi digitado antes de enviar.
- O link "Já tem conta? Entrar" (linha 54) não tem estilo distinto do texto normal além da cor padrão de âncora — provavelmente baixa prioridade visual sobre fundo escuro (inferido).
- Inputs continuam habilitados durante o envio enquanto só o botão desabilita (linha 49) — estado de bloqueio inconsistente.
- Nenhum elemento de marca/logo além do h1 (incoerente) — nada estabelece "esta é a ferramenta do grupo" independente do nome errado da funcionalidade.

## Questions to Consider

- Se a ficha já tem uma identidade de tomo de couro totalmente realizada, por que a porta de entrada do app — o cadastro — parece um formulário de navegador sem estilo?
- "Livro de Ligações" deveria ser o nome do produto em toda parte, ou só da funcionalidade de ficha — e se for o primeiro, onde deveria viver de forma consistente em vez de ser trocado por tela?
- Qual é a reafirmação mínima que um usuário precisa no exato momento em que envia uma senha nova para uma ferramenta pessoal desconhecida?
- Sendo uma ferramenta de uso pessoal para um grupo pequeno e conhecido, o retorno de aplicar tema nas telas de autenticação vale mais agora do que endurecer validação/senha primeiro?
