---
target: "Rolagem Livre e Eventos de mesa em /campanhas/:id/ficha"
total_score: 17
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CharacterSheetPage.tsx"
target_fingerprint: "sha256:61f13b096e4dac0d2915513b75795c88ac62e7d9282cdd8155746650d5d21c73"
target_path: "C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CharacterSheetPage.tsx"
timestamp: 2026-09-09T14-18-29Z
slug: src-routes-charactersheetpage-tsx
---
Method: dual-agent (A: design-review agent · B: detector+browser agent)

## Escopo desta rodada
Apenas dois blocos dentro de `/campanhas/:id/ficha` (`src/routes/CharacterSheetPage.tsx`): o painel **Eventos de mesa** (`src/realtime/EventosMesaPanel.tsx`, linha 244) e o formulário **Rolagem Livre** (`src/realtime/RolagemLivreForm.tsx`, linha 245).

## Health Score (Nielsen, escopado aos dois componentes)

| # | Heurística | Nota | Achado-chave |
|---|-----------|------|--------------|
| 1 | Visibilidade do status do sistema | 2 | Status de conexão (`role="status"`) não tem diferenciação visual; botão "Rolar" não muda de rótulo/estado durante envio |
| 2 | Compatibilidade com o mundo real | 2 | Notação de dados é natural para o público, mas todo evento de outro jogador vira "Um jogador" — apaga identidade em um grupo pequeno e fixo |
| 3 | Controle e liberdade do usuário | 2 | Sem cancelar rolagem em andamento, sem reconectar manualmente quando `indisponivel` — só reload resolve |
| 4 | Consistência e padrões | 1 | Botão de Rolagem Livre, `.roll-btn` das abas e `SaveStatusBadge` já existente são três tratamentos de "ação/erro" diferentes e nenhum reaproveita o outro |
| 5 | Prevenção de erros | 3 | `isNotacaoDadosValida` barra notação inválida antes do round-trip, com exemplo no texto |
| 6 | Reconhecimento em vez de memorização | 2 | Única dica de formato é o placeholder "ex.: 2d6+3", que some ao primeiro caractere digitado |
| 7 | Flexibilidade e eficiência de uso | 2 | Sem histórico de rolagens, sem repetir última, sem atalhos — jogador reduz tudo a retypar notação |
| 8 | Design estético e minimalista | 2 | Conteúdo é minimalista, mas a ausência de estilo (não a intenção) é o que produz o visual "cru" |
| 9 | Ajudar a reconhecer/diagnosticar/recuperar erros | 1 | Erro de envio de rolagem (local e da página) renderiza como texto simples, indistinguível de um texto neutro; sem ação de recuperação |
| 10 | Ajuda e documentação | n/a | Ferramenta pessoal sem sistema de ajuda em lugar nenhum — não é uma lacuna específica destes componentes |
| **Total** | | **17/36** | **Poor (47%)** |

## Veredito de especificidade de design

**Colado, não autoral.** Nenhuma regra `.rolagem-livre` ou `.eventos-mesa` existe em `styles.css`. `EventosMesaPanel` só "parece" do tema porque reaproveita a classe genérica `.panel` — acidente de reuso, não estilo dedicado. `RolagemLivreForm` não reaproveita nada: seu botão de envio (`RolagemLivreForm.tsx:46`) não tem `className`, renderiza como botão nativo cinza do browser, direto sobre o fundo de couro escuro, colado embaixo de um painel totalmente temático. O `<h2>Eventos de mesa</h2>` (linha 43) também ignora o componente `SectionTitle`/`.section-title` (serifa Cinzel, dourado, régua inferior) usado em todo o resto da ficha. E a ficha já tem um componente de status assíncrono colorido e com retry — `SaveStatusBadge` (`.save-status--erro` vermelho, `.save-status--salvo` verde, botão de retry) — que nenhum dos dois componentes reaproveita; ambos reinventam texto de erro sem cor e sem recuperação.

**Scan determinístico**: `impeccable detect --json` em `src/realtime` e em `CharacterSheetPage.tsx` voltou limpo nas duas vezes (exit 0, `[]`), inclusive rodado de novo com `--no-config` para descartar supressão por config. Isso não é o scanner falhando — a mesma injeção ao vivo do detector, na mesma página, encontrou 11 achados reais no cabeçalho/aba Geral (10× `undersized-ui-text`, 1× `border-accent-on-rounded`, este último já registrado como falso positivo intencional em `.impeccable/config.json` de 2026-09-07). **Zero desses 11 achados caíram sobre Eventos de mesa ou Rolagem Livre** — confirmando que o conjunto de regras atual não cobre botão nativo sem estilo, `<ul>` sem reset de `list-style`, ou texto colado sem espaçamento. É um ponto cego do detector para estes dois componentes, não um "está tudo bem".

**Evidência visual (Assessment B, sessão real logada, dado real trafegando por Socket.IO)**: confirmou ao vivo, via screenshot, que um evento renderiza como **"Você rolou 2d6+3Resultado: 10"** — título e detalhe (`EventosMesaPanel.tsx:59-61`, `<strong>{titulo}</strong><span>{detalhe}</span>`) sem espaço nem quebra entre eles — e que o item de lista mostra o **bullet nativo do browser**, porque `.eventos-mesa__list` não tem o reset `list-style:none` que toda outra lista da ficha tem (`.list-section`, `styles.css:941-958`).

## Cognitive load — falhas (checklist de 8 itens)

- **Agrupamento — FALHA**: `RolagemLivreForm` é o único bloco interativo da página sem `.panel`.
- **Hierarquia visual — FALHA**: `<h2>` de Eventos de mesa não usa `.section-title`, não "pesa" como os outros títulos de seção reais.
- **Memória de trabalho — FALHA**: dica de sintaxe some no primeiro caractere digitado.
- **Chunking ≤4 itens/grupo — EM RISCO**: lista de eventos sem paginação, sem agrupamento por sessão/data, sem timestamp — cresce sem limite dentro de uma campanha.
- Foco único, uma decisão por vez, ≤4 opções visíveis, disclosure progressiva — **OK** (cada componente tem uma tarefa genuinamente estreita).

## Jornada emocional

Rolar dado à mesa é um pico de excitação; a implementação atual é clínica — sem ícone de dado, sem destaque visual para "sua" rolagem além da palavra "Você" em texto simples, sem qualquer motion na chegada de um evento novo. Dois gatilhos de ansiedade concretos: (1) o envio é permitido durante `'conectando'`/`'reconectando'` (só `'indisponivel'` desabilita) e o botão trava sem rótulo diferente nem spinner — em combate, o jogador não distingue "na fila" de "travado"; (2) um envio que falha aparece como texto idêntico a uma dica neutra, então dá pra simplesmente não perceber que a rolagem nunca chegou à mesa.

## O que está funcionando

1. **Validação de notação no cliente antes do round-trip** (`notacao.ts`, espelha o parser do servidor) barra "2d6x" etc. e já sugere o formato certo na mensagem de erro.
2. **Atribuição personalizada no feed** — `descreverEvento` distingue "Você rolou…" de "Um jogador rolou…", um toque real de reconhecimento, mesmo que incompleto (ver Problema Prioritário abaixo).
3. **`EventosMesaPanel` herda o `.panel`** (cartão escuro, borda) e o `<input>` de `RolagemLivreForm` herda o estilo global de `.ficha-sheet input` — os dois únicos elementos que "ganham de graça" a aparência do tomo, mostrando que o problema é falta de classes dedicadas, não falta de tokens de tema disponíveis.

## Problemas prioritários

**[P1] Eventos renderizam como texto colado e ilegível, com bullet nativo do browser**
- Por que importa: confirmado ao vivo — "Você rolou 2d6+3Resultado: 10" é literalmente a função central do painel (ler o que aconteceu à mesa) falhando.
- Correção: em `EventosMesaPanel.tsx:59-61`, separar `titulo` e `detalhe` (quebra de linha ou `<br/>`/flex com gap); adicionar CSS para `.eventos-mesa__list` resetando `list-style: none` e dando a cada `<li>` o mesmo tratamento de cartão de `.list-section` (`styles.css:941-958`).
- Comando sugerido: `/impeccable polish`

**[P1] Botão "Rolar" e as mensagens de erro da Rolagem Livre são HTML puro, sem nenhum estilo**
- Por que importa: `RolagemLivreForm.tsx:46-48` não tem `className` — renderiza um botão cinza padrão do sistema operacional colado abaixo de um painel 100% temático; é a costura mais chocante visualmente da página, confirmada por screenshot. O mesmo vale para o erro `role="alert"` da linha 49 e o `erroRolagem` de página (`CharacterSheetPage.tsx:246`): ambos texto simples indistinguível de dica neutra, ao lado de um padrão já existente (`.autosave-alert`, cartão vermelho) usado a um componente de distância.
- Correção: estender `.roll-btn` (que também não tem nenhuma regra CSS em lugar nenhum — mesmo problema nas abas de Ataques/Perícias/Talentos) ou criar variante temática; encaminhar as duas strings de erro pelo padrão `.autosave-alert`/`SaveStatusBadge`.
- Comando sugerido: `/impeccable polish`

**[P1] `RolagemLivreForm` não tem contêiner visual — flutua direto sobre o fundo**
- Por que importa: é o único bloco interativo da ficha sem `.panel`; fica sem borda logo abaixo do painel de Eventos de mesa, que tem borda.
- Correção: envolver em `<section className="panel rolagem-livre">` com um `.section-title` de verdade (o `<h2>` de Eventos de mesa tem a mesma lacuna e leva a mesma correção).
- Comando sugerido: `/impeccable layout`

**[P2] Dois mecanismos de erro diferentes para "a rolagem falhou ao enviar", e status de conexão sem cor**
- Por que importa: `RolagemLivreForm` mantém seu próprio `erro` local exibido inline; separadamente, `rolarItem()` (linhas 122-125 de `CharacterSheetPage.tsx`, usado pelos botões "Rolar" das abas Talentos/Ataques/Perícias) seta `erroRolagem` de página, renderizado uma única vez no fim da página — potencialmente longe do botão que o jogador realmente clicou. O texto de status de conexão (`role="status"`) não diferencia visualmente "conectando" (benigno) de "indisponível" (quebrado).
- Correção: unificar num único mecanismo, ancorado perto do controle que disparou a ação; dar cor ao span de status usando os tokens `--blood-bright`/`--gold-bright` já existentes.
- Comando sugerido: `/impeccable clarify`

**[P2] Sem forma de recuperação quando o socket cai; sem feedback de "enviando" distinto de "travado"**
- Por que importa: quando `status === 'indisponivel'`, só um reload de página resolve — não existe botão de reconectar, embora a ficha já tenha esse padrão em outro lugar (`.save-status__retry`). Enviar durante `'conectando'`/`'reconectando'` é permitido (só `'indisponivel'` desabilita) e o rótulo do botão nunca muda para "Enviando…" nem mostra spinner.
- Correção: adicionar reconexão manual espelhando `.save-status__retry`; mudar rótulo/estado do botão enquanto `enviando` for verdadeiro.
- Comando sugerido: `/impeccable harden`

## Red flags de persona

**Alex (power user rolando rápido em combate)**: não dá pra distinguir "na fila" de "travado" ao enviar durante reconexão; sem histórico nem repetir-última-rolagem — cada nova rolagem é reescrever a notação do zero.

**Jordan (jogador de primeira viagem)**: nada perto de "Rolagem livre" avisa que o que ele digitar é transmitido ao vivo para a mesa inteira — a única pista (placeholder "ex.: 2d6+3") some no primeiro caractere digitado; sem o feed adjacente mostrando "Você rolou…", ele poderia achar que é uma calculadora privada.

## Observações menores

- `EventoMesa.criadoEm` existe no modelo de dados (`types.ts:29`) mas nunca é renderizado — sem timestamp, impossível saber se um evento é de 10 segundos ou 90 minutos atrás.
- Os dois componentes renderizam incondicionalmente abaixo de todas as abas (fora dos blocos `{aba === ...}`), então a posição vertical deles na tela varia conforme a aba atual for longa (Magias/Inventário) ou curta (Notas).
- Achado incidental fora do escopo pedido, mas real: erro de console do React (`value` prop não deveria ser `null`) em `Field`/`GeralTab` — a API grava `null` para um campo `idade` vazio enquanto o input é controlado; é uma lacuna de contrato API↔frontend, vale um olhar separado.
- **Nota operacional**: para validar ao vivo, a Avaliação B criou uma conta de mestre, uma conta de jogador e uma campanha de teste ("Campanha Teste Impeccable ...") no banco real (MongoDB Atlas, `dungeons_api`, conforme `.env`). Esses dados de teste não foram apagados.
