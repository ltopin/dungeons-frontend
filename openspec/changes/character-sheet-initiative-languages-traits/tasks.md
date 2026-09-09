## 1. Regras

- [x] 1.1 `src/rules/combat.ts` — nova função `initiative({ destrezaMod, outros })` retornando `destrezaMod + outros`
- [x] 1.2 Teste da nova função em `combat.test.ts` (ou arquivo de teste equivalente já existente para `combat.ts`)

## 2. Tipos e dependência do backend

- [x] 2.1 `src/api/types.ts` — `FichaCombate` ganha `iniciativaTotal: number`; `FichaGeral` ganha `idiomas: string`
- [x] 2.2 `src/test/fixtures.ts` — atualizar `criarFichaFake` com os novos campos
- [x] 2.3 Registrar como pendência externa: `dungeons-api` precisa de `iniciativa_total` em `ficha_combate` e `idiomas` em `ficha_geral` antes deste código rodar contra a API real (ver proposal.md - Impact)

## 3. Iniciativa na ficha

- [x] 3.1 `src/sheet/tabs/CombateTab.tsx` — calcular `iniciativaTotal` com `initiative()`, exibir como campo derivado somente-leitura ao lado de `iniciativaOutros`, e incluir no payload de autosave da seção Combate
- [x] 3.2 `src/sheet/readonly/CombateReadOnly.tsx` — exibir `combate.iniciativaTotal` ao lado de `iniciativaOutros`
- [x] 3.3 Atualizar testes existentes de `CombateTab`/`CombateReadOnly` (se houver) para cobrir o novo campo

## 4. Idiomas na seção Geral

- [x] 4.1 `src/sheet/tabs/GeralTab.tsx` — novo campo de texto "Idiomas" na lista de campos de identidade, com autosave
- [x] 4.2 `src/sheet/readonly/GeralReadOnly.tsx` — exibir o campo de Idiomas
- [x] 4.3 Atualizar testes existentes de `GeralTab`/`GeralReadOnly` (se houver) para cobrir o novo campo

## 5. Qualidades especiais automáticas no assistente

- [x] 5.1 `src/wizard/steps/RacaClasseStep.tsx` — ao confirmar a etapa com raça e classe escolhidas, gravar via `useListSection('talentos', ...)` uma linha `qualidade_especial` para cada item de `raca.tracos` e cada `classe.caracteristicas` com `nivel === 1`, pulando nomes já existentes em `ficha.talentos`
- [x] 5.2 Teste em `CharacterWizardPage.test.tsx` (ou teste dedicado de `RacaClasseStep`) cobrindo: confirmação grava as qualidades especiais; confirmar de novo sem mudanças não duplica; trocar de raça/classe e confirmar novamente soma as novas sem remover as antigas

## 6. Validação final

- [x] 6.1 `tsc -b` e `npm run build` limpos
- [x] 6.2 Suíte de testes completa passando
- [x] 6.3 `openspec validate character-sheet-initiative-languages-traits --strict` sem erros
