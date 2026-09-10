## Why

Hoje a etapa de Atributos da Trilha de Criação de Personagem só permite compra de pontos, forçando todo jogador a pensar em orçamento mesmo quando a mesa prefere rolar dados ou simplesmente digitar as pontuações que já definiu. Na etapa de Perícias, o teto de graduações no 1º nível penaliza perícia fora de classe reduzindo-o pela metade (regra que essa mesa não quer manter) e o campo `outros` — que já existe no modelo de dados e já é usado no total da perícia, inclusive na ficha manual (`PericiasTab.tsx`) — nunca é exposto no assistente, então bônus de raça, classe ou magia não têm onde entrar durante a criação.

## What Changes

- **Atributos** ganha um seletor de modo com três opções, cada uma com estado independente (trocar de modo não tenta traduzir valores de um modo para outro):
  - **Sortear**: rola 4d6 descartando o menor, seis vezes, gerando um pool de valores brutos que o jogador distribui manualmente entre os seis atributos; botão "Rolar novamente" descarta o pool inteiro e sorteia de novo, sem limite de uso; concluir a etapa exige que os seis valores tenham sido atribuídos.
  - **Compra de pontos**: comportamento atual, sem mudança (pools 10/15/20/25, tabela de custo 7–18).
  - **Manual**: seis campos numéricos livres, faixa 3–18, sem cálculo de custo.
  - Em todos os três modos, o bônus racial "+2 à escolha" e o ajuste fixo de raça continuam aplicados por cima da pontuação base, como já funciona hoje.
- **Perícias**: o máximo de graduações no 1º nível passa a ser 4 tanto para perícia de classe quanto fora de classe (elimina a redução pela metade); o custo em pontos por graduação continua diferente (1 de classe, 2 fora de classe).
- **Perícias**: adiciona um campo numérico "Outros" editável por linha de perícia, replicando o padrão já existente em `PericiasTab.tsx` — o jogador digita o bônus combinado (raça, classe, magia, item, o que for), sem tentar decompor por origem nem inferir automaticamente do texto do compêndio. Não consome o pool de pontos de perícia (já é somado separadamente em `skillTotal`).

## Capabilities

### New Capabilities

(nenhuma — todas as mudanças são revisões de requirements existentes)

### Modified Capabilities

- `character-creation-wizard`: reescreve o requirement de Atributos (hoje só compra de pontos) para descrever os três modos; atualiza o requirement de Perícias para o teto uniforme de 4 graduações e acrescenta um requirement para o campo "Outros".

## Impact

- `src/rules/srd/pointBuy.ts` — constantes `PONTUACAO_MINIMA`/`PONTUACAO_MAXIMA` passam a ser específicas do modo compra de pontos; novo módulo de rolagem (ex: `src/rules/srd/rollAttributes.ts`) com a lógica de 4d6 descarta-menor e faixa 3–18 para manual/sortear.
- `src/wizard/steps/AtributosStep.tsx` — seletor de modo e UI de Sortear/Manual.
- `src/rules/classProgression.ts` — `graduacoesMaximasNivel1` passa a retornar 4 sempre, independente de `deClasse`.
- `src/wizard/steps/PericiasStep.tsx` — campo "Outros" por linha, reaproveitando o padrão de `PericiasTab.tsx`.
- Specs e change já existente `pathfinder-character-builder` não são tocados; esta change revisa os requirements já sincronizados em `openspec/specs/character-creation-wizard/spec.md` por conta própria.
