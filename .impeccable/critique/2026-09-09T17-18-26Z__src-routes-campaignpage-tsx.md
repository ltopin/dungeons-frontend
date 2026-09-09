---
target: "/campanhas/:id (visao do mestre)"
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CampaignPage.tsx"
target_fingerprint: "sha256:0ef72670d61ccceb012fcf5798080d753c9c80dc28052ad96f82e32d50fafa93"
target_path: "C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CampaignPage.tsx"
timestamp: 2026-09-09T17-18-26Z
slug: src-routes-campaignpage-tsx
---
Method: dual-agent (A: general-purpose agent a73d9d5d9be4b7f6a · B: general-purpose agent af51c8d94ccaa21a1)

# Crítica de Design — /campanhas/:id (visão do Mestre)

## Nota de escopo
Confirmado no código: `CampaignPage.tsx` só permanece nesta rota quando `campanha.role !== 'jogador'`; jogadores são redirecionados para `/campanhas/:id/ficha`. Ou seja, tudo aqui é literalmente a experiência do Mestre: `MasterDashboard.tsx` + o painel de eventos de mesa (`EventosMesaPanel`) + o formulário de pedir rolagem (`PedirRolagemForm`).

## Placar de Saúde de Design (heurísticas de Nielsen)

| # | Heurística | Nota | Problema principal |
|---|---|---|---|
| 1 | Visibilidade do status do sistema | 2 | Sem label de "enviando" no botão de pedir rolagem; o status mais crítico (indisponível) não tem ação de recuperação nesta tela |
| 2 | Compatibilidade com o mundo real | 3 | Vocabulário natural em pt-BR; mas botão de "Vincular mundo" usa a cor de erro/perigo |
| 3 | Controle e liberdade do usuário | 2 | Sem retomada quando a conexão em tempo real cai; troca de mundo sem confirmação |
| 4 | Consistência e padrões | 1 | Duas das quatro seções do dashboard não têm CSS correspondente e caem no estilo padrão do navegador |
| 5 | Prevenção de erros | 2 | Campo de descrição da rolagem é validado; troca de mundo vinculado não pede confirmação |
| 6 | Reconhecimento em vez de memorização | 3 | Nomes de jogadores/personagens visíveis; formulário desabilitado não explica o motivo |
| 7 | Flexibilidade e eficiência de uso | 1 | Nenhum atalho, preset ou repetição de pedido de rolagem — cada pedido é digitado do zero |
| 8 | Estética e design minimalista | 2 | Metade de cima é limpa e coerente; metade de baixo parece um protótipo não finalizado |
| 9 | Recuperação de erros | 1 | Falha de conexão permanente não oferece nenhuma ação de recuperação nem explicação |
| 10 | Ajuda e documentação | 1 | Nenhuma ajuda contextual em lugar nenhum da tela |
| **Total** | | **18/40** | **Faixa: Fraco (Poor)** |

Todas as 10 heurísticas foram avaliadas de fato (superfície "Operate" — nenhuma marcada n/a por conveniência).

## Veredito de especificidade de design

**Veredito dividido — e a divisão corta a tela exatamente no meio.** A metade de cima (cabeçalho, painel Mundo, painel Fichas) é genuinamente autoral: cards com borda dourada, `Cinzel` nos títulos, paleta `--gold`/`--parchment`/`--blood`, vocabulário próprio de D&D em pt-BR. Ninguém confundiria isso com um painel admin genérico.

A metade de baixo — o feed de eventos de mesa e o formulário de pedir rolagem, exatamente o que faz esta tela ser "rodar uma sessão ao vivo" e não só "uma tela de configuração" — **não tem estilo nenhum**. Confirmado rastreando cada className usada em `EventosMesaPanel.tsx` e `PedirRolagemForm.tsx` contra as 1637 linhas de `styles.css`:
- `.panel`, `.eventos-mesa__*`, `.hint` → só existem como `.ficha-sheet .panel` / `.ficha-sheet .eventos-mesa__*`, e o dashboard do mestre está dentro de `.campaigns-screen`, não `.ficha-sheet`. A regra nunca se aplica aqui.
- `.pedir-rolagem` → **zero ocorrências em todo o arquivo.** Nunca foi definida.

Resultado prático: a lista de eventos vira um `<ul>` com bullet padrão, e o formulário de pedir rolagem (label, select, input, botão) renderiza com a aparência padrão do navegador — bem no meio de dois cards dourados cuidadosamente estilizados. Isso contradiz diretamente a afirmação do PRODUCT.md de que "lista de campanhas e dashboard do mestre já têm o tratamento visual de tomo de couro aplicado" — é verdade para 2 das 4 seções do dashboard do mestre, não para as 4.

**Varredura determinística (Assessment B):** o detector automático do impeccable rodou contra os 4 arquivos-alvo (`CampaignPage.tsx`, `MasterDashboard.tsx`, `EventosMesaPanel.tsx`, `PedirRolagemForm.tsx`) e retornou **0 findings** (exit code 0). Isso não contradiz o achado acima — o detector procura padrões (templates genéricos, anti-patterns conhecidos), não incompatibilidade de escopo de CSS entre arquivos. O problema real só aparece ao rastrear className → seletor CSS → ancestral no DOM, trabalho que foi feito pelo Assessment A.

**Evidência visual:** não disponível nesta sessão — não há ferramenta de automação de navegador (Playwright/Puppeteer/Chrome DevTools) exposta e nenhum servidor de dev rodando. O Assessment B confirmou isso explicitamente (com busca própria de ferramentas) antes de pular a etapa de screenshot/overlay. Nenhuma captura de tela foi inferida ou inventada — toda a análise acima vem da leitura direta do componente + da folha de estilos.

## Impressão geral
A metade de cima da tela do Mestre já tem identidade e cuidado reais. A metade de baixo — exatamente a parte usada durante a sessão de jogo, não só na preparação — parece pertencer a outro produto: sem card, sem tipografia, sem cor de marca. E o maior risco não é estético: se a conexão em tempo real cai durante uma sessão, o Mestre não tem nenhum botão nesta tela para se recuperar — só um recarregar de página que ninguém disse a ele para fazer.

## Pontos fortes
1. Os painéis Mundo/Fichas são craft real e alinhado à marca: cards com borda superior dourada, textos de estado vazio calorosos e específicos, retry em erro, `focus-visible` dourado consistente.
2. Disciplina de acessibilidade na marcação: `role="alert"`/`role="status"`, `label htmlFor` corretamente pareado, foco programático no texto de erro (`erroRef.current?.focus()`) — acima da média para um projeto pessoal.
3. Textos de erro em linguagem simples e específica ("Não foi possível vincular o mundo agora. Tente novamente em instantes."), não genéricos.

## Problemas prioritários

**[P0] A única forma de recuperação da conexão em tempo real está quebrada nesta tela.**
- Por quê importa: `useCampaignEvents.ts` para de tentar reconectar automaticamente após `reconnect_failed`; `reconectar()` é a única saída documentada sem recarregar a página inteira. `MasterDashboard.tsx` nunca extrai `reconectar` do hook e nunca passa `onReconectar` para `<EventosMesaPanel>`. No meio de uma sessão, se o socket cai, o Mestre vê "Conexão em tempo real indisponível", o formulário de pedir rolagem desabilita silenciosamente, e não existe nenhum botão na página para resolver isso.
- Correção: extrair `reconectar` em `MasterDashboard.tsx` e passar como `onReconectar` para `<EventosMesaPanel>` — o componente já sabe renderizar o botão "Tentar reconectar" quando recebe esse callback.
- Comando sugerido: `/impeccable harden`

**[P1] Duas das quatro seções do dashboard não têm escopo de CSS correspondente e caem no estilo padrão do navegador.**
- Por quê importa: `.panel`/`.eventos-mesa__*`/`.pedir-rolagem` nunca se aplicam dentro de `.campaigns-screen`. Isso quebra visivelmente a identidade "Livro de Ligações" bem na parte mais usada durante o jogo.
- Correção: adicionar regras `.campaigns-screen`-scoped para essas classes (ou trocá-las pelas primitivas `.campaigns-screen__*` já existentes) para que o feed e o formulário herdem o mesmo tratamento visual dos painéis Mundo/Fichas.
- Comando sugerido: `/impeccable polish` (ou `/impeccable document` antes, se quiser registrar o padrão pretendido primeiro)

**[P1] "Vincular mundo"/"Trocar mundo" reaproveita o estilo de botão de erro/retry.**
- Por quê importa: esse botão usa `className="campaigns-screen__retry"`, que é `border/color: var(--danger)` (vermelho) — a mesma classe usada em "Tentar novamente" após uma falha. Vincular um mundo é a primeira ação construtiva do Mestre nessa tela, e ela aparece com a cor de "algo quebrou". Isso vai contra a heurística de compatibilidade com o mundo real (vermelho = perigo) e contra o tom calmo do resto do painel.
- Correção: dar à ação de vincular mundo uma classe neutra/dourada (ex.: no estilo de `.campaigns-screen__primary-action`), em vez de reaproveitar o vermelho de retry.
- Comando sugerido: `/impeccable clarify` ou `/impeccable colorize`

**[P2] O formulário de pedir rolagem não dá feedback durante o envio e desabilita sem explicar o motivo.**
- Por quê importa: o botão continua dizendo "Pedir rolagem" mesmo durante o envio (`enviando`), diferente do botão do painel Mundo, que muda para "Vinculando…" — inconsistência dentro da mesma tela. Quando o formulário desabilita por `status === 'indisponivel'`, nada ao lado dele explica por quê; a explicação está em outro painel, acima.
- Correção: espelhar o padrão "Vinculando…" com um "Enviando…" durante o submit, e adicionar uma nota inline perto do formulário desabilitado explicando a causa.
- Comando sugerido: `/impeccable clarify`

**[P3] Sem repetição rápida ou presets para pedidos de rolagem comuns.**
- Por quê importa: um Mestre em combate normalmente pede os mesmos tipos de rolagem repetidamente (Reflexos CD X, iniciativa, ataque de oportunidade). Hoje cada pedido começa do zero, sem histórico nem preset — atrito real acumulado ao longo de uma sessão, mesmo que nenhuma instância isolada seja grave.
- Correção: adicionar "repetir último pedido" ou uma lista curta de presets de CD/perícia.
- Comando sugerido: `/impeccable optimize` (ou `/impeccable shape` se precisar desenhar a UX primeiro)

## Red flags de personas

**Alex (usuário avançado, espera eficiência durante a sessão)**
- Cada pedido de rolagem é digitado do zero — sem histórico, sem repetir-último, sem presets.
- Sem atalho de teclado para focar o campo de descrição a partir de qualquer lugar da página.
- O seletor de destinatário só permite "um jogador" ou "toda a mesa" — não dá para pedir de "os três personagens em combate corpo a corpo" sem 3 envios separados.

**Sam (depende de acessibilidade — leitor de tela / navegação por teclado)**
- A metade de cima da tela é sólida para Sam (labels, `role="alert"`/`role="status"`, foco no erro). Na metade de baixo, a lista de eventos não tem separação visual entre itens — um usuário com baixa visão vê uma sequência de texto padrão sem agrupamento.
- O formulário desabilitado (`indisponivel`) não tem `aria-describedby` explicando por quê — quem navega por teclado tabula até um controle desabilitado sem anúncio do motivo, que está em outra seção da página.

**Mestre à mesa (persona específica do produto, derivada do PRODUCT.md — alguém rodando D&D 3.5 para o próprio grupo, celular ou notebook ao lado dos dados e livros, precisando de um olhar rápido no meio da sessão)**
- Exatamente no momento em que essa pessoa mais precisa da ferramenta — no meio do combate, o socket cai, precisa pedir um teste de Reflexos agora — é o momento em que a ferramenta não oferece nenhuma saída além de um recarregamento de página que nada explica (ver P0).
- Por estar sem estilo, o formulário de pedir rolagem não se anuncia visualmente como "a ferramenta do Mestre" num olhar rápido, do jeito que os cards dourados acima se anunciam.
- Não há confirmação persistente de "pedido enviado para o Jogador X" além do formulário limpar — o Mestre teria que olhar o feed de eventos separadamente para confirmar que o pedido realmente chegou.

## Observações menores
- `<h1 id="campanha-heading">` nunca é referenciado por nenhum `aria-labelledby` (diferente de `CampaignsListPage.tsx`, que faz isso corretamente) — id órfão, inofensivo mas descuidado.
- `mundoAtual?.nome ?? mundoIdAtual` cai para mostrar o ID bruto do mundo se a busca falhar silenciosamente — um vazamento técnico visível para um usuário não técnico.
- O `<select>` "Escolher mundo", dentro do painel Mundo (a parte "boa" da tela), também não tem estilo `.campaigns-screen`-scoped — uma instância menor do mesmo problema de escopo, só que menos grave.
- `erroPedido` renderiza sem nenhuma classe — texto puro, mais uma instância do mesmo padrão.
- Toda essa infraestrutura de tempo real contradiz o Princípio de Produto nº 4 do PRODUCT.md ("Tempo real é não-objetivo do MVP... não introduzir infraestrutura de websocket/live antes de decisão explícita do usuário"). Consistente com o código: a feature parece ter sido construída depois do PRODUCT.md, sem um passe correspondente para trazê-la ao sistema visual `.campaigns-screen` que o resto do dashboard já tinha. A lacuna de CSS é, provavelmente, o registro fóssil de uma decisão de escopo revertida no código mas nunca refletida no PRODUCT.md nem na folha de estilos.

## Perguntas provocativas
- Se o feed de eventos e o formulário de pedir rolagem fossem desenhados hoje com o mesmo cuidado dos painéis Mundo/Fichas, ainda seriam duas seções soltas no fim da página — ou pertenceriam a um único painel "Mesa em tempo real", como um `.campaigns-screen__panel` com divisão interna?
- O formulário trata "toda a mesa" e "um jogador" como as únicas opções. É assim que um Mestre pensa no meio do combate — ou ele pensa em "todo mundo nessa luta", o que hoje exigiria repetir o mesmo pedido N vezes?
- A lacuna de reconexão (P0) existe porque o hook retorna `reconectar` e o dashboard simplesmente não usa. Vale checar se a tela de ficha do jogador (que também usa `EventosMesaPanel`) faz esse encaixe corretamente — porque, se sim, é especificamente o Mestre que ficou sem saída.
- O PRODUCT.md afirma que o tratamento de tomo de couro já está aplicado ao dashboard do mestre. Agora que ficou claro que isso vale para 2 das 4 seções, vale corrigir o PRODUCT.md/criar um DESIGN.md preciso, para a próxima pessoa que estender essa tela não herdar a mesma suposição falsa?
