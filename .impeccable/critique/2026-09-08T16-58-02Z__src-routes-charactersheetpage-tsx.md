---
target: "/campanhas/:id/ficha (aba Ataques e demais abas em lista)"
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CharacterSheetPage.tsx"
target_fingerprint: "sha256:2cc2a1aaea254cdbd84cafd42f579c8000ad0d266e5d898478a0861dc8ab8a45"
target_path: "C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CharacterSheetPage.tsx"
timestamp: 2026-09-08T16-58-02Z
slug: src-routes-charactersheetpage-tsx
---
Method: dual-agent (A: a950121c26a82f3d8 · B: a2b69608dd5021f4f)

## Design Health Score

| # | Heurística | Nota | Problema-chave |
|---|---|---|---|
| 1 | Visibilidade do status do sistema | 2 | `SaveStatusBadge` some/aparece e reflui o layout durante a digitação; falha de save ao trocar de aba é engolida silenciosamente |
| 2 | Compatibilidade com o mundo real | 4 | Terminologia D&D 3.5 em PT-BR precisa em toda a ficha |
| 3 | Controle e liberdade do usuário | 2 | Só `window.confirm()` nativo antes de excluir; sem desfazer, sem reordenar |
| 4 | Consistência e padrões | 1 | A mesma página usa dois sistemas de label diferentes para o mesmo padrão `<label><span/><input/></label>` |
| 5 | Prevenção de erros | 2 | Campos `type="number"` (Peso, PV, Bônus) sem `min`/`step` — permitem valores negativos |
| 6 | Reconhecimento em vez de memorização | 2 | Labels sempre visíveis (acerto), mas o espaçamento colado prejudica a leitura rápida |
| 7 | Flexibilidade e eficiência de uso | 2 | Sem atalho de duplicar linha, sem alinhamento em coluna para criar memória muscular de leitura |
| 8 | Design estético e minimalista | 2 | Selos e mostradores de Combate têm um nível de acabamento; as abas em lista (Ataques, Perícias, Inventário) têm outro |
| 9 | Ajuda a reconhecer/diagnosticar/recuperar de erros | 3 | Erros com `role="alert"` e botão "Tentar novamente" — bom, exceto a falha silenciosa ao desmontar |
| 10 | Ajuda e documentação | 2 | Nenhuma ajuda inline para campos calculados (CMB/CMD, capacidade de carga) |
| **Total** | | **22/40** | **Aceitável** |

## Veredito de Especificidade do Design

**Avaliação (design review):** A ficha tem dois níveis de acabamento coexistindo na mesma tela. O cabeçalho, as abas, os selos hexagonais dourados e os mostradores (`Dial`) de Combate são genuinamente autorais e reforçam a identidade "Livro de Ligações" — não são um formulário genérico com verniz por cima. Mas as abas baseadas em lista (Ataques, Perícias, Inventário, Talentos, Magias) regridem para HTML puro sem estilo: labels grudados nos inputs, larguras arbitrárias, colunas que não alinham entre os cards. É exatamente a aba mais usada durante uma sessão ao vivo (Ataques, consultada no meio de um combate) que quebra o clima construído pelo resto da tela.

**Varredura determinística:** O detector (`impeccable detect --json`) retornou `0` achados nos arquivos-alvo (`CharacterSheetPage.tsx`, `src/sheet/tabs/`, `src/sheet/readonly/`, `theme.tsx`). O Assessment B confirmou que o detector funciona (pegou problemas em arquivos sintéticos de teste), mas seu conjunto de regras para `.tsx` é regex-based e estreito — o resultado vazio significa "nada que essas regras conseguem pegar em TSX", não "está tudo limpo". A evidência real veio de rastreamento manual de CSS/JSX, e ela é conclusiva:

- `src/styles.css:652-658` — a única regra que empilha `<span>` sobre `<input>` com `gap:3px` é `.ficha-sheet .field-grid label, .ficha-sheet form label`. Ela só se aplica dentro de `.field-grid` ou `<form>`.
- `src/sheet/tabs/AtaquesTab.tsx:58-70` renderiza os labels dentro de `<ul className="list-section"><li>`, que não é nem `.field-grid` nem `<form>` — o label cai no `display:inline` padrão do navegador, span e input ficam colados, sem gap controlado. É exatamente o defeito da captura de tela.
- O mesmo bug se repete em `PericiasTab.tsx` (labels em 54, 62, 76, 84, 92), `TalentosTab.tsx` (33, 41, 49), `InventarioTab.tsx` (101, 105, 113, 121), `MagiasTab.tsx` (134, 143, 152, 161), e um label solto isolado em `CombateTab.tsx:176-183` ("Dados de vida"). `GeralTab.tsx:72-83` e `InventarioTab.tsx:77-82`/`FamiliarTab.tsx`/`MagiasTab.tsx:67` acertam porque envolvem os campos em `.field-grid`.
- Não existe um componente `Field`/`FieldRow` compartilhado em `theme.tsx` — cada aba reimplementa o próprio JSX de label, o que explica por que o padrão diverge silenciosamente entre abas.
- O botão de remover (`IconButton`) não tem `margin-left:auto` nem posicionamento fixo — é só o último item de um `flex-wrap`, por isso "flutua" de forma inconsistente entre as linhas.
- Bônus: o mesmo bug de escopo existe na visão somente-leitura, via `RoField` (`src/sheet/readonly/RoFields.tsx`), cuja regra CSS (`styles.css:1014-1019`) também está presa a `.field-grid`.

Nenhum falso positivo relevante do detector em si (retornou vazio). Um achado do modo URL do detector (`border-accent-on-rounded` na tela de login não autenticada, `styles.css:353-358`) é muito provavelmente um eco intencional do masthead da ficha, já registrado como decisão aceita em `.impeccable/config.json` — não é um problema novo.

**Overlays visuais:** Inspeção de navegador ao vivo na rota autenticada `/campanhas/:id/ficha` não foi viável nesta sessão (nenhuma ferramenta de automação de navegador exposta, sem credenciais de teste para autenticar). Não há overlay visível na aba **[Human]** para consultar. A evidência da captura de tela enviada pelo usuário foi usada como verdade de campo e confirmada de forma independente pelo rastreamento estático de CSS/JSX acima, que explica o sintoma sem depender do screenshot.

## Impressão Geral

A ficha tem uma identidade visual real e bem construída (masthead, abas, selos, mostradores), mas ela só aparece pela metade: as abas em lista — que são exatamente as mais consultadas durante uma sessão — caem para fora do sistema de estilo por um bug de escopo de CSS bem específico e rastreável. A maior oportunidade não é "redesenhar" nada; é aplicar de forma consistente um padrão que a própria equipe já implementou corretamente em `GeralTab` e em `CombateTab.tsx`'s `saveRow`/`derivedRow`.

## O Que Está Funcionando

1. **`theme.tsx` tem primitivas de design system reais** — `SectionTitle`, `NumBox`, `Seal`, `Dial`, `IconButton` não são genéricos; o hexágono via `clip-path` do `Seal` e o tratamento de card do `Dial` dão às seções de PV/CA/Testes de Resistência em Combate um acabamento condizente com o tema de tomo.
2. **`CombateTab.tsx`'s `saveRow`/`derivedRow` já resolvem exatamente o problema de alinhamento que falta em Ataques** — label, total calculado, "=", e inputs em estilo chip (`NumBox`) numa linha controlada. A equipe já tem o padrão certo no próprio código; só não foi reaproveitado.
3. **Copy em PT-BR precisa e com voz cuidada**, inclusive em estados vazios — ex. `AtaquesTab.tsx:55`: "Nenhum ataque cadastrado ainda — adicione sua arma para registrar seus ataques." — consistente com a metáfora do tomo, não é texto de boilerplate.

## Problemas Prioritários

**[P0] Espaçamento e alinhamento de label/input quebrados nas abas em lista**
- **O quê**: `AtaquesTab.tsx:58-70`, `PericiasTab.tsx:54-99`, `TalentosTab.tsx:27-49`, `InventarioTab.tsx:98-121`, `MagiasTab.tsx` (linhas de magia), e um label solto em `CombateTab.tsx:176-183` renderizam `<label>` fora de `.field-grid`/`<form>`, então não recebem a regra `gap:3px` de `styles.css:652-658`.
- **Por que importa**: É exatamente a reclamação literal do usuário, reproduzível direto no código-fonte, inconsistente com o próprio uso correto em `GeralTab.tsx:72-83`, e é a aba mais consultada durante uma sessão ao vivo.
- **Fix**: Envolver os campos de cada linha em `.field-grid` (ou, melhor, extrair um componente `<FieldRow>`/`<Field>` compartilhado em `theme.tsx` usado por todas as abas, para o padrão não poder mais divergir silenciosamente). Aplicar `width` consistente aos inputs e `margin-left:auto` (ou coluna de ação fixa) ao botão de remover. Fazer o mesmo ajuste em `RoField`/`styles.css:1014-1019` no lado somente-leitura.
- **Comando sugerido**: `/impeccable layout`

**[P1] Falha silenciosa de autosave ao trocar de aba**
- **O quê**: `src/sheet/useSectionAutosave.ts:85-94` dispara o save pendente ao desmontar, mas o `setStatus('erro')` resultante (linha 51) acontece num componente já desmontado e nunca é exibido — sem toast, sem indicador persistente.
- **Por que importa**: Um mestre edita PV, troca de aba no meio de um combate, e um save que falhou desaparece sem nenhum feedback — o pior modo de falha possível para uma ferramenta usada ao vivo: perda de dado invisível.
- **Fix**: Elevar o status de save/erro para um indicador no nível da página (ex. no masthead de `CharacterSheetPage.tsx`) que persista entre trocas de aba.
- **Comando sugerido**: `/impeccable harden`

**[P2] Linha de 9 campos sem hierarquia sobrecarrega a carga cognitiva**
- **O quê**: `AtaquesTab.tsx:6-15` (`FIELDS`) renderiza 8 campos de texto + Peso como uma única linha sem diferenciação entre campos primários (Arma, Dano) e secundários (Propriedades especiais). 7 dos 8 itens do checklist de carga cognitiva falham nessa aba (foco único, chunking, agrupamento, hierarquia visual, um passo por vez, escolhas mínimas, memória de trabalho).
- **Por que importa**: Custa segundos reais para um mestre varrendo várias fichas no meio de um combate.
- **Fix**: Agrupar visualmente em clusters (identidade / matemática de combate / logística); considerar um "mais detalhes" recolhível para Propriedades especiais.
- **Comando sugerido**: `/impeccable layout`

**[P3] `window.confirm()` nativo quebra a imersão num momento de alto risco**
- **O quê**: `AtaquesTab.tsx:84`, `InventarioTab.tsx:130`, `PericiasTab.tsx:115` usam o diálogo nativo do sistema operacional para confirmar exclusão.
- **Por que importa**: Rompe a estética de tomo de couro cuidadosamente construída exatamente numa ação irreversível.
- **Fix**: Substituir por uma confirmação inline ou modal dentro do tema (dourado/couro), consistente com o resto da ficha.
- **Comando sugerido**: `/impeccable polish`

**[P3] Botão de excluir depende de dica só-no-hover e nome acessível só via tooltip**
- **O quê**: `theme.tsx:69-85` (`IconButton`); o tom de perigo (vermelho) só aparece em `:hover` (`styles.css:898-902`); o nome acessível vem só do atributo `title`; alvo de toque de 26×26px (`styles.css:887-896`).
- **Por que importa**: Risco de descoberta e de acessibilidade motora num tablet, e nome inconsistente entre leitores de tela que dependem só de `title`.
- **Fix**: Adicionar `aria-label`, manter uma tonalidade de perigo visível (com opacidade reduzida) em repouso, aumentar o alvo para pelo menos 40-44px em telas de toque.
- **Comando sugerido**: `/impeccable audit`

## Alertas de Persona

**Alex (usuário avançado, quer velocidade)**: Todo ataque novo nasce com placeholder "Nova arma" (`AtaquesTab.tsx:38`), exigindo redigitação manual em 9 campos desalinhados, sem atalho de duplicar linha e sem coluna fixa para criar memória muscular de leitura (`.list-section li` usa `flex-wrap`, não `grid-template-columns`). Contradiz diretamente a heurística 7 (nota 2).

**Sam (dependente de acessibilidade)**: A associação label→input é estruturalmente correta (o `<label>` envolvente sobrevive para tecnologia assistiva mesmo quando a estilização visual quebra) — um acerto real —, mas o alvo pequeno do botão de excluir, o indício visual só-no-hover, o comportamento inconsistente de retorno de foco do `window.confirm()` com leitores de tela, e os labels em 10px maiúsculo (`--text-dim` #9a8c72 sobre `--panel` #211a14`, `styles.css:662-666`) ficam perto do limite de contraste AA para texto pequeno e merecem auditoria.

**Mestre conduzindo uma sessão ao vivo, pouca paciência**: Ataques é justamente a aba aberta no meio de um combate para ler Dano/Bônus rápido. O espaçamento colado e a falta de alinhamento em coluna entre os três cards de ataque força leitura serial em vez da leitura em coluna que uma ficha de papel permite. O `SaveStatusBadge` aparecendo/desaparecendo durante a digitação (sem largura reservada) causa tremulação de layout exatamente enquanto o mestre está editando — corrosivo para a confiança sob pressão de tempo.

## Observações Menores

- `.list-section li { align-items: flex-end }` (`styles.css:867`) alinha itens de altura desigual pela base, somando desalinhamento vertical ao horizontal.
- Campos `type="number"` (Peso, PV, Bônus) não têm `min`/`step` — nada impede peso ou PV negativo.
- Estados vazios têm um toque bacana, mas a única diferenciação entre abas quando a lista está vazia é o texto da copy.
- O padrão `saveRow`/`derivedRow` de `CombateTab.tsx` já é o padrão "certo" no próprio código — deveria ser estendido, não reinventado.

## Perguntas para Refletir

- Se `GeralTab` já prova que a equipe conhece o padrão correto `.field-grid`, por que três outras abas em lista o ignoram — foi um corte de prazo, copy-paste de um protótipo antigo, ou falta um componente compartilhado/lint que evite essa divergência daqui para frente?
- Dado que essa ferramenta é usada ao vivo na mesa sob pressão de tempo, Ataques/Perícias/Inventário deveriam continuar como formulários de card empilhado (label sobre input), ou a metáfora "Livro de Ligações" aponta para uma tabela de colunas fixas, mais densa, no estilo ficha de papel?
- `window.confirm()` para exclusão foi um corte de escopo deliberado, ou toda ação destrutiva num produto tematizado deveria passar por uma confirmação dentro do próprio tema?
