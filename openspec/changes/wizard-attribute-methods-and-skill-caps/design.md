## Context

`AtributosStep` (`src/wizard/steps/AtributosStep.tsx`) hoje só implementa compra de pontos, com `PONTUACAO_MINIMA`/`PONTUACAO_MAXIMA` (7–18) definidos em `src/rules/srd/pointBuy.ts` especificamente para a tabela de custo daquele modo. `PericiasStep` (`src/wizard/steps/PericiasStep.tsx`) usa `graduacoesMaximasNivel1` de `src/rules/classProgression.ts`, hoje `deClasse ? 4 : 2`, e nunca expõe o campo `outros` de `FichaPericia` — que já existe no modelo de dados e já é usado no cálculo de `skillTotal`, inclusive na ficha manual (`src/sheet/tabs/PericiasTab.tsx:91-97`), que tem o padrão de UI a ser reaproveitado aqui. Ver proposal.md para a motivação.

## Goals / Non-Goals

**Goals:**
- Três modos de definição de atributos com estado independente, sem tentar converter valores entre eles.
- Uniformizar o teto de graduações de perícia em 4, mantendo o custo diferenciado (1 vs 2 pontos).
- Expor "Outros" por perícia no wizard, reaproveitando o padrão já existente em `PericiasTab.tsx`.

**Non-Goals:**
- Não inferir automaticamente o valor de "Outros" a partir do texto de `tracos`/`caracteristicas` do compêndio (diferente das heurísticas de `wizardValidation.ts` para talentos e pool de perícia) — o jogador digita o valor combinado.
- Não alterar a regra de custo por graduação de perícia (1 de classe, 2 fora de classe) nem o cálculo do pool total (`pontosDePericiaNivel1`).
- Não alterar `pathfinder-character-builder` nem seus artefatos — esta change revisa os requirements já sincronizados em `openspec/specs/character-creation-wizard/spec.md` de forma independente.

## Decisions

**Sortear: distribuição manual de um pool de 6 valores, não atribuição automática em ordem fixa.** Alternativa considerada: sortear direto em Força/Destreza/... na ordem. Rejeitada porque tira do jogador a decisão de onde colocar o melhor valor — a mesa física sempre distribui depois de rolar.

**Reroll do conjunto inteiro, não por atributo individual.** Rerolar atributo a atributo permitiria "cherry-picking" (reroll só o valor ruim, manter os bons), o que na prática se aproxima de compra de pontos sem custo. Rerolar o conjunto inteiro preserva a aleatoriedade real da regra clássica.

**Faixa 3–18 para Sortear/Manual, mantendo 7–18 isolado em Compra de pontos.** `PONTUACAO_MINIMA`/`PONTUACAO_MAXIMA` de `pointBuy.ts` ficam como estão (usadas só pela tabela de custo); a nova faixa 3–18 vive no módulo novo de rolagem/validação de atributo, não substitui as constantes existentes.

**Modos não convertem valores entre si ao trocar.** Alternativa considerada: pré-preencher o modo novo com os valores do modo anterior. Rejeitada porque as semânticas são diferentes (base pré-ajuste em compra de pontos vs. valor bruto sorteado vs. número livre em manual) — converter geraria números sem relação com a regra do modo de destino.

**Teto de perícia uniforme em 4, sem tocar no custo por graduação.** Simplificação de mesa pedida explicitamente: remove a divisão de teto por metade (regra oficial do SRD), mas mantém o custo diferenciado (1 ponto de classe, 2 fora de classe), que é o mecanismo que já desincentiva perícia fora de classe.

**"Outros" como campo numérico livre, sem tentar decompor por origem (raça/classe/magia).** Alternativa considerada: heurística por regex sobre `tracos`/`caracteristicas`, no padrão de `talentosDisponiveisNivel1`/`bonusPericiaNivel1`. Rejeitada porque extrair *nome da perícia + valor do bônus* de texto livre é bem mais arriscado que extrair um booleano (talento disponível) ou um valor fixo conhecido (bônus racial de perícia do Humano) — maior chance de aplicar o bônus na perícia errada ou de interpretar mal o texto. Um campo editável, somado direto ao total, é o mesmo padrão já em produção em `PericiasTab.tsx`.

## Risks / Trade-offs

[Rolagem gera personagens desbalanceados entre jogadores da mesma mesa] → aceito deliberadamente: é o comportamento esperado do modo Sortear, mesa que não quiser essa variância usa Compra de pontos ou Manual.

[Modo Manual permite digitar 18 em todos os atributos, sem nenhum controle] → aceito deliberadamente: é a mesma filosofia de "não bloquear o que não é automaticamente verificável" já usada para pré-requisito de talento; cabe ao mestre policiar fora do sistema.

[Campo "Outros" pode ser preenchido com qualquer número, sem validação contra o compêndio] → aceito deliberadamente, mesma razão do Non-Goal acima; é o mesmo nível de confiança que já existe na ficha manual hoje.
