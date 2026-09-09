## 1. Regras

- [x] 1.1 Novo módulo (ex: `src/rules/srd/rollAttributes.ts`) com a rolagem 4d6 descarta-menor × 6 e a faixa 3–18 usada pelos modos Sortear/Manual (mantendo `PONTUACAO_MINIMA`/`PONTUACAO_MAXIMA` de `pointBuy.ts` isoladas para o modo Compra de pontos)
- [x] 1.2 Testes do novo módulo (distribuição estatística básica do 4d6 descarta-menor, faixa de valores possível, validação da faixa 3–18)
- [x] 1.3 `graduacoesMaximasNivel1` em `src/rules/classProgression.ts` passa a retornar 4 sempre, independente de `deClasse`
- [x] 1.4 Atualizar `classProgression.test.ts` para o novo valor uniforme

## 2. Atributos — seletor de modo

- [x] 2.1 Seletor de modo (Sortear / Compra de pontos / Manual) em `AtributosStep.tsx`, com estado independente por modo (trocar de modo não converte valores)
- [x] 2.2 UI do modo Sortear: pool de 6 valores brutos, distribuição por clique (valor → atributo), botão "Rolar novamente" sem limite de uso descartando distribuição atual
- [x] 2.3 UI do modo Manual: seis campos numéricos livres, faixa 3–18, sem cálculo de custo
- [x] 2.4 Ajustar condição de habilitação de "Confirmar atributos" por modo: Sortear exige os 6 valores distribuídos; Manual exige todos os campos dentro de 3–18; Compra de pontos mantém a checagem de pool atual
- [x] 2.5 Bônus racial "+2 à escolha" e ajuste fixo de raça continuam aplicados por cima da base nos três modos (reaproveitar `ajuste()` existente sem mudança de comportamento)
- [x] 2.6 Testes de `AtributosStep.test.tsx` cobrindo os três modos (distribuição e reroll no Sortear, faixa no Manual, regressão do fluxo de Compra de pontos existente)

## 3. Perícias — teto uniforme e campo Outros

- [x] 3.1 Ajustar textos/tooltips de "máx" em `PericiasStep.tsx` para refletir o teto uniforme de 4 (via `graduacoesMaximasNivel1` já atualizado na tarefa 1.3)
- [x] 3.2 Adicionar campo numérico "Outros" por linha de perícia em `PericiasStep.tsx`, replicando o padrão existente em `PericiasTab.tsx` (`Field label="Outros"`), gravando em `FichaPericia.outros` em vez do `outros: 0` fixo atual
- [x] 3.3 Confirmar que o campo "Outros" não entra no cálculo de `gasto`/`restante` do pool de pontos de perícia (já é assim em `skillTotal`, só validar que a alteração não introduz regressão)
- [x] 3.4 Testes de `PericiasStep.test.tsx` cobrindo o teto uniforme de 4 graduações e a edição do campo "Outros" refletindo no total exibido

## 4. Validação final

- [x] 4.1 `tsc -b` e `npm run build` limpos
- [x] 4.2 Suíte de testes completa passando
- [x] 4.3 `openspec validate wizard-attribute-methods-and-skill-caps --strict` sem erros
