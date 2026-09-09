## Why

O jogador pediu a parte da ficha que mostra CA, ataques, testes de resistência, iniciativa, PV, idiomas, habilidades especiais de raça e classe, notas e CD de magias. Uma auditoria da ficha mostrou que CA, ataques, testes de resistência, PV, notas e CD de magias já estão implementados (edição e leitura) — mas três peças específicas ainda faltam de verdade: (1) a ficha nunca calcula um total de Iniciativa (só existe o campo solto `iniciativaOutros`, sem somar o modificador de Destreza); (2) não existe nenhum campo de Idiomas em lugar nenhum do modelo de dados; (3) o assistente de criação mostra os traços raciais e as características de classe de nível 1 apenas como texto informativo durante a escolha de Raça/Classe, mas nunca grava isso na ficha — a aba "Qualidades Especiais" (que já existe e já suporta essa categoria) fica vazia depois que o jogador termina o assistente, a menos que ele redigite manualmente cada traço.

## What Changes

- **Iniciativa**: novo cálculo `iniciativa total = modificador de Destreza + outros`, exibido como campo derivado somente-leitura ao lado do já existente `iniciativaOutros`, tanto na aba de edição (Combate) quanto na leitura do mestre — mesmo padrão dos demais totais de combate (CA, CMB, CMD).
- **Idiomas**: novo campo de texto livre "Idiomas" na seção Geral (junto aos demais campos de identidade — alinhamento, divindade, tamanho etc.), editável pelo jogador e visível na leitura do mestre. Texto livre (não uma lista estruturada) para não exigir uma seção/tabela nova no backend — mesmo espírito do campo de Notas.
- **Habilidades especiais de raça e classe**: ao confirmar a etapa Raça e Classe do assistente com ambos escolhidos, o sistema grava automaticamente os traços da raça (`raca.tracos`) e as características de classe de nível 1 (`classe.caracteristicas` filtradas por `nivel === 1`) como linhas de `ficha.talentos` com categoria `qualidade_especial` (nome + descrição vindos do compêndio), evitando duplicar uma linha já existente com o mesmo nome. Não remove nem sincroniza automaticamente se o jogador trocar de raça/classe depois (ver design.md) — comportamento aditivo, não destrutivo.

## Capabilities

### New Capabilities

(nenhuma — todas as mudanças estendem capacidades já existentes)

### Modified Capabilities

- `character-sheet-ruleset`: nova fórmula de Iniciativa total (Destreza + outros).
- `character-sheets`: estende o requisito de campos derivados somente-leitura para incluir Iniciativa total; novo requisito de campo de Idiomas na seção Geral (edição e leitura do mestre).
- `character-creation-wizard`: novo requisito de gravação automática de qualidades especiais de raça/classe ao confirmar a etapa Raça e Classe.

## Impact

- `src/rules/combat.ts` — nova função `initiative({ destrezaMod, outros })`.
- `src/api/types.ts` — `FichaCombate` ganha `iniciativaTotal: number`; `FichaGeral` ganha `idiomas: string`.
- `src/sheet/tabs/CombateTab.tsx`, `src/sheet/readonly/CombateReadOnly.tsx` — exibem o total de Iniciativa ao lado de `iniciativaOutros`.
- `src/sheet/tabs/GeralTab.tsx`, `src/sheet/readonly/GeralReadOnly.tsx` — novo campo de texto "Idiomas".
- `src/wizard/steps/RacaClasseStep.tsx` — grava `qualidade_especial` em `ficha.talentos` ao confirmar raça e classe, usando `useListSection`/o mesmo endpoint de lista já usado por `TalentosStep.tsx`.
- **Depende do `dungeons-api`** (fora deste repositório, tratado como specs-only aqui): a seção `combate` precisa de uma coluna `iniciativa_total` e a seção `geral` precisa de uma coluna `idiomas` — mesmo padrão de dependência cruzada já usado em `pathfinder-character-builder` (mudança irmã no outro repositório). A gravação automática de qualidades especiais não exige nenhuma mudança de schema (reaproveita `ficha_talentos`, que já tem a coluna de categoria).
- Fora de escopo desta leva: distinguir na UI se uma qualidade especial veio da raça ou da classe (o nome/descrição do compêndio já deixa isso implícito); re-sincronizar qualidades especiais automaticamente se o jogador trocar de raça/classe após já ter confirmado a etapa; modelar idiomas como lista estruturada com fonte (racial/bônus de Inteligência) em vez de texto livre.
