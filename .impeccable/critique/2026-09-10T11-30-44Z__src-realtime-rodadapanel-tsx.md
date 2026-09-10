---
target: componente de interação com o mestre de IA na ficha (resumo da rodada / quem já respondeu / enviar resumo)
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\realtime\\RodadaPanel.tsx"
target_fingerprint: "sha256:a6a7ca3325cf79fb90ae80ba50f5e7578ffa221e3167243f0e39f3704477cf4c"
target_path: "C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\realtime\\RodadaPanel.tsx"
timestamp: 2026-09-10T11-30-44Z
slug: src-realtime-rodadapanel-tsx
closed: true
---
# Design Health Score

| # | Heurística | Nota | Problema-chave |
|---|---|---|---|
| 1 | Visibilidade do status do sistema | 3 | "É a sua vez de agir." existe, mas usa a classe `.hint` (13px, cor apagada) — o mesmo peso visual de uma legenda descartável |
| 2 | Correspondência sistema ↔ mundo real | 3 | Vocabulário de D&D forte, PT-BR natural |
| 3 | Controle e liberdade do usuário | 2 | Sem confirmação ao fechar a rodada; reenviar o resumo começa do textarea vazio |
| 4 | Consistência e padrões | 2 | `.add-btn` (afordance de baixo risco, "adicionar item") reaproveitado em "Fechar rodada"; `.roll-btn` reaproveitado para envio de texto que não é rolagem |
| 5 | Prevenção de erros | 1 | Zero confirmação para fechar a rodada com jogadores pendentes, mesmo essa sendo uma ação que afeta a mesa inteira |
| 6 | Reconhecimento em vez de memorização | 2 | O resumo já enviado não é reexibido; "Você" não se destaca na lista de participantes |
| 7 | Flexibilidade e eficiência | 2 | Nenhum atalho, nenhuma lembrança da própria resposta, caminho único e rígido |
| 8 | Estética e minimalismo | 3 | Conteúdo enxuto, mas "quem já respondeu" é mostrado duas vezes (lista + frase) |
| 9 | Recuperação de erros | 2 | `role="alert"` existe, mas sem botão de retry (compare com `.save-status__retry` do `EventosMesaPanel`, logo abaixo na mesma tela) |
| 10 | Ajuda e documentação | 2 | Nenhuma explicação do que "fechar mesmo assim" significa para quem ainda não respondeu |
| **Total** | | **22/40** | **Aceitável — mas no limite inferior da faixa** |

# Verdito de Especificidade de Design

**Avaliação (revisão de design):** o acabamento visual é genuinamente autoral — títulos em Cinzel, selos dourados, botões tracejados cor de pergaminho, vocabulário próprio ("rodada", "iniciativa", "mestre"). Isso não é um painel CRUD genérico. Mas os *momentos* que realmente importam — "em quem eu ainda estou esperando", "agora é minha vez" — usam classes utilitárias indiferenciadas (`.hint`, `.add-btn`) compartilhadas com as partes mais banais da ficha (adicionar item de inventário, legenda de campo desabilitado). A pele é sob medida; a tensão dramática do momento, não.

**Varredura determinística:** `impeccable detect --json src/realtime/RodadaPanel.tsx` → `[]`, exit code 0. Zero achados — nenhum anti-padrão de detector aqui. Nenhum falso positivo a relatar (nada foi sinalizado).

**Evidência visual:** duas subagentes isoladas (revisão de design e evidência determinística/navegador) capturaram screenshots reais do componente renderizado com CSS real, fontes reais e dados simulados realistas (não havia como alcançar um estado autenticado com rodada de IA ativa no backend real dentro desta critique, então foi montado um harness temporário — já removido — que monta o componente de produção de verdade dentro de `.ficha-sheet`). As duas capturas mais relevantes já foram enviadas a você acima. Como a varredura determinística voltou limpa, não havia achados de detector para sobrepor visualmente — a evidência de navegador foi usada diretamente para a comparação estrutural abaixo.

# Impressão Geral

O visual "Livro de Ligações" está presente e bonito. O problema não é estilo, é **hierarquia**: o dado mais importante da tela inteira nesse momento — quem ainda não respondeu — está com o menor peso visual de todo o painel, enquanto o botão que fecha a rodada para a mesa toda tem a mesma aparência tímida e tracejada usada para "adicionar um item de inventário". A maior oportunidade é simples: dar a esse painel uma linguagem visual de "isto é importante e afeta todo mundo", que já existe em outras partes do mesmo arquivo (o painel de combate) e do mesmo produto (`AssumirMestreConfirm`), mas não chegou até aqui.

# O Que Está Funcionando

- **Destaque de turno no combate**: a linha do combatente atual ganha borda e fundo dourados via `aria-current` (`styles.css:1895-1899`) — sinal inequívoco e no tom da marca. É o melhor momento visual do componente.
- **Formulário de ação só aparece pra quem joga**: `CombateTurnoPanel` só renderiza o campo de ação para `contaId === turnoAtualContaId` (`RodadaPanel.tsx:197`) — respeita o contexto multiplayer em vez de poluir a tela de todo mundo.
- **Feedback de estado no botão de envio**: "Enviar resumo" → "Atualizar resumo" → "Enviando…" dá um retorno barato e suficiente sobre o que está acontecendo.

# Problemas Prioritários

**[P0] "Fechar rodada" tem peso visual incompatível com sua gravidade**
- **Por que importa**: usa `.add-btn` — tracejado, transparente, a mesma classe usada para "adicionar item de inventário" em outras abas. É o único botão do painel que afeta todos os jogadores da mesa, de forma irreversível, sem nenhuma confirmação — e é o elemento visualmente menos assertivo da tela.
- **Fix**: tratamento visual de alta ênfase, mais um passo de confirmação quando `pendentes.length > 0` (ex.: "3 jogadores não responderam — fechar mesmo assim?"), no mesmo espírito do `AssumirMestreConfirm` que já existe no código para outra ação irreversível.
- **Comando sugerido**: `/impeccable harden`

**[P1] "Quem já respondeu" é a informação mais importante da tela e a menos tratada visualmente**
- **Por que importa**: confirmado por pixel e por CSS: a lista de participantes (`rodada-panel__participantes`) é texto corrido sem cartão, borda ou fundo — enquanto a lista de iniciativa do combate (mesmo arquivo) e a lista do `EventosMesaPanel` (painel vizinho, mesma tela) usam o mesmo tratamento de cartão (`background: var(--panel-2); border: 1px solid var(--line); border-radius: 5px`). Além disso, a mesma informação aparece duas vezes: na lista e de novo como frase corrida ("Ainda faltam responder: ...").
- **Fix**: aplicar o mesmo tratamento de cartão da lista de iniciativa/eventos; separar visualmente "responderam" de "aguardando" (ou ordenar pendentes primeiro); remover a frase duplicada.
- **Comando sugerido**: `/impeccable clarify`

**[P2] O momento de maior tensão do combate é estilizado como legenda de campo desabilitado**
- **Por que importa**: "É a sua vez de agir." usa `.hint` (13px, `var(--text-dim)`) — a mesma classe usada para textos de apoio irrelevantes. É exatamente o momento que o jogador está esperando ansiosamente.
- **Fix**: um destaque dedicado e proeminente, na linha do selo "IA" (`.eventos-mesa__origem-ia`) só que em escala maior.
- **Comando sugerido**: `/impeccable bolder`

**[P3] O resumo já enviado não fica visível depois**
- **Por que importa**: o textarea volta a ficar vazio após o envio mesmo quando `jaEnviei` é verdadeiro — o jogador precisa guardar de memória o que escreveu até o fim da rodada.
- **Fix**: preencher o campo com o resumo salvo (ou mostrar uma prévia somente-leitura) quando `jaEnviei`.
- **Comando sugerido**: `/impeccable clarify`

# Red Flags por Persona

**Alex (usuário experiente, sem paciência)**: precisa ler a lista corrida de participantes e depois a frase repetida "Ainda faltam responder" só para saber quem está travando a rodada; o estilo de `.add-btn` em "Fechar rodada" faz o botão passar batido numa varredura rápida.

**Sam (depende de acessibilidade)**: o `aria-current` na linha do turno atual não tem texto visualmente equivalente reforçado — para quem enxerga pouco, o sinal visual do turno atual é só o `.hint` de baixo contraste relativo (texto pequeno, cor apagada), não um destaque forte.

**Riley (testador implacável, casos-limite)**: com `ordemIniciativa` vazio, o `<ol>` simplesmente não renderiza nada — nenhum estado vazio explicativo.

# Observações Menores

- `.roll-btn` reaproveitado em "Enviar resumo"/"Agir" sugere visualmente uma rolagem de dados que não existe ali.
- "Você" aparece sem nenhum destaque na lista de participantes, apesar de ser a linha mais relevante para quem está lendo.
- NPCs (ex. "Goblin batedor") e PCs têm exatamente o mesmo estilo na lista de iniciativa — nenhum diferenciador rápido pro mestre/jogadores.
- Nenhum aviso de sucesso ao fechar a rodada — a única confirmação é o número da rodada mudar no título.
- (Fora do escopo deste componente, mas observado na mesma tela em 390px: a barra de abas da ficha transborda a viewport em mobile — vale um `/impeccable adapt` separado na ficha como um todo, não é um problema do `RodadaPanel`.)

# Perguntas Provocativas

1. Se "em quem eu ainda estou esperando" é o dado mais importante da tela, por que ele é renderizado com o mesmo peso de uma legenda de campo desabilitado?
2. Este código já tem `AssumirMestreConfirm` para uma ação irreversível — por que "Fechar rodada" não ganha o mesmo tratamento?
3. Reaproveitar `.roll-btn`/`.add-btn` em ações sem relação nenhuma é uma escolha deliberada de vocabulário visual enxuto (ferramenta pessoal, poucos componentes) ou só falta de atenção?
