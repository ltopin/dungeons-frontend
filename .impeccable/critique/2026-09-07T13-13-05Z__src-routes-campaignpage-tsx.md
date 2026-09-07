---
target: "/campanhas/:id"
total_score: 8
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CampaignPage.tsx"
target_fingerprint: "sha256:05c546df024c080fcd9f5e3e4ebedcb0b9ec1cb13dcf9b21236761a1ace083ca"
target_path: "C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CampaignPage.tsx"
timestamp: 2026-09-07T13-13-05Z
slug: src-routes-campaignpage-tsx
closed: true
---
Method: dual-agent (A: a286972d9d61d33ae · B: a06d9cc00920ee4f6)

# Design Health Score

| # | Heurística | Nota | Achado principal |
|---|---|---|---|
| 1 | Visibilidade do status do sistema | 1 | Três telas de "Carregando…" empilhadas e diferentes entre si (sessão, campanha, fichas), sem identidade visual compartilhada. |
| 2 | Compatibilidade sistema/mundo real | 1 | A "casa" da campanha do mestre não carrega nenhuma metáfora de mesa/tomo, apesar do resto do produto já ter comprometido essa identidade. |
| 3 | Controle e liberdade do usuário | 0 | Não existe link de volta para `/campanhas`; a tela irmã (`NewCampaignPage`) já tem esse padrão e esta não o reaproveita. |
| 4 | Consistência e padrões | 1 | `CampaignsListPage` já resolve erro de fetch com painel + botão "Tentar novamente"; `CampaignPage`/`MasterDashboard` reimplementam a mesma falha como `<p role="alert">` nu. |
| 5 | Prevenção de erros | 2 | Não há ações destrutivas nesta tela; neutro por ausência de funcionalidade. |
| 6 | Reconhecimento em vez de memorização | 1 | O código de convite — mecanismo central do produto — não é exibido em lugar nenhum do app. |
| 7 | Flexibilidade e eficiência de uso | 0 | Zero atalhos, zero ação em lote, nenhum link da lista de fichas para o detalhe do jogador (mesmo com `id` disponível). |
| 8 | Design estético e minimalista | 1 | Minimalismo por ausência de decisão de design, não por curadoria — é o HTML semântico "cru". |
| 9 | Ajuda a reconhecer/diagnosticar/recuperar de erros | 1 | `role="alert"` correto para leitor de tela, mas sem retry ou próximo passo — regressão frente ao padrão já existente em `CampaignsListPage`. |
| 10 | Ajuda e documentação | 0 | Estado vazio ("Nenhum jogador entrou nesta campanha ainda.") não orienta o mestre sobre o que fazer — nem poderia, já que o código de convite não existe na tela. |
| **Total** | | **8/40** | **Crítico** |

# Veredito de Especificidade de Design

**LLM (Assessment A)**: Veredito **genérico / protótipo CRUD intercambiável**. [MasterDashboard.tsx:22-46](src/routes/MasterDashboard.tsx#L22-L46) renderiza `<main>`, `<h1>`, `<section>`, `<h2>`, `<ul>`, `<li>` sem nenhum `className` além de `"welcome-banner"`. Cruzando com [styles.css](src/styles.css), nenhuma dessas tags cai dentro dos três "mundos" temáticos já existentes (`.ficha-sheet`, `.campaigns-screen`, `.auth-screen`) — só herda os globais de topo (`body`/`main`). O único toque de cor, `.welcome-banner` (styles.css:42-50), é um alerta verde genérico que nem usa a paleta ouro/pergaminho já estabelecida a um clique de distância em `CampaignsListPage`.

**Varredura determinística (Assessment B)**: `impeccable detect --json` em [CampaignPage.tsx](src/routes/CampaignPage.tsx) e [MasterDashboard.tsx](src/routes/MasterDashboard.tsx) retornou exit code 0, zero achados. Importante: o mesmo comando rodado contra `CampaignsListPage.tsx` (que É estilizada) também retornou zero — confirmando que o detector usa regex para anti-padrões específicos (cores hardcoded, `!important`, easing banido etc.), não uma checagem de "cobertura de estilo". Como os dois arquivos-alvo não têm nenhum CSS-like content (sem `style=`, sem hex, sem CSS-in-JS), não há o que o regex capture — o "zero achados" deve ser lido como "nenhum anti-padrão detectado", não como "estilo adequado". Nenhum falso positivo a reportar, mas o próprio resultado zero é enganoso se lido sem esse contexto.

**Overlays visuais**: não disponíveis nesta sessão — nenhuma ferramenta de automação de navegador (Playwright/Puppeteer/canvas nativo) está exposta. Nenhum servidor dev foi iniciado (a rota exige sessão autenticada e API real, indisponíveis aqui). Sinal de fallback registrado por ambas as avaliações; nenhuma alegação de overlay visível foi feita.

# Impressão Geral

A rota `/campanhas/:id` é, na prática, duas telas: para jogador, um redirecionamento instantâneo para a ficha temática; para mestre, o `MasterDashboard` — que é HTML semântico cru, sem nenhuma herança da identidade "tomo de couro / selos dourados" que o resto do produto já provou em duas outras telas (login/cadastro e lista de campanhas). O maior problema não é só estético: o mecanismo central do produto — o código de convite que o mestre gera — não aparece em lugar nenhum da interface, então mesmo um mestre motivado pelo banner de "Campanha criada!" não consegue de fato convidar ninguém a partir desta tela.

# O Que Está Funcionando

1. Uso correto de `role="alert"` e `role="status"` nas mensagens de erro/sucesso ([CampaignPage.tsx:30](src/routes/CampaignPage.tsx#L30), [MasterDashboard.tsx:24](src/routes/MasterDashboard.tsx#L24)) — leitores de tela anunciam corretamente mesmo sem qualquer tratamento visual.
2. Fetch seguro contra race condition: a flag `cancelado` no cleanup do `useEffect` ([CampaignPage.tsx:16-27](src/routes/CampaignPage.tsx#L16-L27)) evita `setState` após unmount.
3. A separação de rotas por papel (mestre vs. jogador) no nível do router ([CampaignPage.tsx:32-34](src/routes/CampaignPage.tsx#L32-L34)) é uma decisão arquitetural sólida — o conserto visual do `MasterDashboard` é aditivo, não exige reestruturação.

# Problemas Prioritários

**[P0] Código de convite não existe em nenhum lugar da interface**
- **Por que importa**: o PRODUCT.md declara que o fluxo central é "mestre cria campanha e gera código de convite". O tipo `Campanha` ([types.ts:10-16](src/api/types.ts#L10-L16)) não tem campo de código, e nenhuma tela — `MasterDashboard`, `CampaignPage`, `NewCampaignPage` — exibe ou gera um. Isso bloqueia o caso de uso primário do produto, exatamente no momento emocionalmente mais propício (logo após o banner de celebração).
- **Fix**: adicionar o código de convite ao payload/tipo de `Campanha` e exibi-lo com destaque no `MasterDashboard`, idealmente como um "pill" copiável dentro do masthead temático, ao lado do banner de boas-vindas.
- **Comando sugerido**: `/impeccable shape`

**[P0] `MasterDashboard` sem nenhuma estilização — quebra de continuidade de marca**
- **Por que importa**: o mestre chega aqui vindo direto do `CampaignsListPage`, já totalmente temático (ouro/pergaminho/Cinzel), clicando num card estilizado — e aterrissa no que parece uma página quebrada ou inacabada. É o maior momento de "isso ainda é o mesmo produto?" do app inteiro.
- **Fix**: os tokens (`--gold`, `--panel`, `--line` etc.) já existem e foram provados duas vezes; extrair o padrão de masthead/painel já construído em `.campaigns-screen` para reuso e aplicá-lo aqui é trabalho de classe CSS + atributo JSX, não de novo design visual.
- **Comando sugerido**: `/impeccable extract`

**[P1] Estado de erro sem retry, diferente da tela irmã**
- **Por que importa**: [CampaignPage.tsx:30](src/routes/CampaignPage.tsx#L30) renderiza `<p role="alert">` nu; `CampaignsListPage.tsx:94-101` já resolve o mesmo tipo de falha com painel estilizado + botão "Tentar novamente". UX de recuperação inconsistente para a mesma classe de erro dentro do mesmo fluxo.
- **Fix**: reaproveitar o padrão `.campaigns-screen__error` + botão de retry (ou equivalente escopado ao dashboard) e adicionar callback de retry ao efeito de fetch.
- **Comando sugerido**: `/impeccable harden`

**[P1] Itens da lista de fichas são becos sem saída**
- **Por que importa**: [MasterDashboard.tsx:37-41](src/routes/MasterDashboard.tsx#L37-L41) renderiza texto puro; `f.id` existe ([types.ts:26](src/api/types.ts#L26)) mas só é usado como `key` do React, nunca como link — não existe rota para ver a ficha de um jogador como mestre. Para o mestre rodando uma sessão ao vivo, essa lista é só informativa, sem consulta rápida de HP/CA/magias.
- **Fix**: no mínimo, envolver cada `<li>` num `<Link>` mesmo que aponte para uma tela ainda não construída (sinaliza affordance); idealmente construir uma visão de leitura da `Ficha` do jogador para o mestre.
- **Comando sugerido**: `/impeccable shape`

**[P2] Sem navegação de volta a partir do dashboard**
- **Por que importa**: nem `CampaignPage.tsx` nem `MasterDashboard.tsx` oferecem link de volta a `/campanhas`, enquanto `NewCampaignPage.tsx:43` já tem esse padrão. Força dependência do botão "voltar" do navegador.
- **Fix**: adicionar affordance de volta/breadcrumb consistente, reaproveitando o estilo de `.campaigns-screen__logout`.
- **Comando sugerido**: `/impeccable layout`

**[P3] Textos de carregamento inconsistentes e sem estilo, empilhados três vezes**
- **Por que importa**: `RequireSession.tsx:8` "Carregando sessão…", `CampaignPage.tsx:31` "Carregando…", `MasterDashboard.tsx:33` "Carregando…" de novo (fichas). Soma pouco isoladamente, mas reforça a sensação de "inacabado" logo no carregamento inicial.
- **Fix**: diferenciar os textos e aplicar um tratamento mínimo compartilhado (skeleton/spinner) consistente com o tema alvo.
- **Comando sugerido**: `/impeccable clarify`

# Red Flags de Persona

**Alex (usuário avançado impaciente, mestre rodando sessão ao vivo)**:
- Não encontra o código de convite para mandar a um jogador novo no meio da sessão — a ação mais urgente que esta tela deveria suportar simplesmente não existe (ver P0 acima).
- Clicar no nome de um jogador na lista de fichas não faz nada — sem consulta rápida de stats durante o jogo.
- Sem botão de voltar — depende do navegador para retornar à lista de campanhas, quebrando o fluxo ao alternar entre campanhas.
- O estado de erro não oferece retry — precisa recarregar a página inteira numa conexão instável em vez de um clique.

**Sam (dependente de acessibilidade — leitor de tela/teclado)**:
- Os dois `role="alert"`/`role="status"` anunciam corretamente, mas não há mais nada na página para construir um modelo mental — só o `aria-label="Fichas da campanha"` no `<section>` ([MasterDashboard.tsx:30](src/routes/MasterDashboard.tsx#L30)), sem nenhum `:focus-visible` definido neste arquivo (ao contrário de `.campaigns-screen__logout:focus-visible` etc. em styles.css, que não se aplicam aqui).
- Não há nenhum elemento interativo na página — "passa" trivialmente num teste de tab, mas só porque a funcionalidade (copiar código, links de ficha, botão de voltar) simplesmente não existe.
- O banner de boas-vindas é anunciado, mas não diz o que fazer a seguir (nem poderia, já que não há código de convite a compartilhar).

# Observações Menores

- `.welcome-banner` (styles.css:42-50) é uma classe global não escopada a nenhum "mundo" temático, e usa verde em vez da paleta ouro/pergaminho do resto do produto — consistente consigo mesma (compartilhada com `CampaignsListPage`), mas fora da marca.
- O redirect `campanha.role === 'jogador'` ([CampaignPage.tsx:32](src/routes/CampaignPage.tsx#L32)) é um `<Navigate>` client-side — o jogador vê um flash de "Carregando…" antes de ser redirecionado.
- `aria-label="Fichas da campanha"` no `<section>` ([MasterDashboard.tsx:30](src/routes/MasterDashboard.tsx#L30)) é redundante com o `<h2>Fichas</h2>` logo dentro — poderia ser `aria-labelledby` apontando para o h2.
- O texto do estado vazio ("Nenhum jogador entrou nesta campanha ainda.") é passivo e não aproveita o momento para direcionar o mestre à ação de convite (que hoje nem existe).

# Perguntas Provocativas

1. Se o código de convite não existe em nenhum lugar do app rodando, como o loop central "mestre cria → jogador entra com código" tem sido usado na prática — está sendo compartilhado por fora (Discord, verbalmente) como gambiarra?
2. `CampaignsListPage` já prova um padrão completo de painel ouro/pergaminho/Cinzel com erro+retry e estados de foco — por que `MasterDashboard`, um clique adiante na mesma jornada, não simplesmente estende esse padrão em vez de ficar como uma quarta identidade não tratada?
3. A lista de fichas carrega `f.id` mas não tem destino — foi uma decisão deliberada de adiar a visão de detalhe da ficha pelo mestre, ou um esquecimento? Se "central de comando do mestre" é a ambição desta tela, uma visão de leitura de HP/CA/magias durante a sessão não é um extra, é quase o ponto todo da tela existir.
