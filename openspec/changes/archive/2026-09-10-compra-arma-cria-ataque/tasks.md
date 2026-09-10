## 1. Catálogo de equipamento

- [x] 1.1 Em `src/rules/srd/equipment.ts`, adicionar `combate?: { dano; critico; tipo; alcance?; tamanho; propriedadesEspeciais? }` a `ItemEquipamentoSrd`
- [x] 1.2 Preencher `combate` para Adaga, Espada longa, Machado grande, Arco curto e Cajado, com dados coerentes com Pathfinder 1e/SRD
- [x] 1.3 Adicionar nova entrada `machado_guerra` ("Machado de guerra", categoria arma, 10 po, 3kg, dano 1d8, crítico x3, tipo Corte)

## 2. Wizard cria/remove o Ataque junto com a compra

- [x] 2.1 Em `CharacterWizardPage.tsx`, repassar `ataques={ficha.ataques}` e `onAtaquesChange={atualizarSecaoLocal('ataques')}` para `EquipamentoStep`
- [x] 2.2 Em `EquipamentoStep.tsx`, aceitar essas novas props e criar um segundo `useListSection<FichaAtaque>(fichaId, 'ataques', ...)`
- [x] 2.3 Extrair `comprarItem`/`aplicarPacoteInicial` para uma função compartilhada `adquirirItem(itemId)` que sempre adiciona ao inventário e, quando `item.combate` existe, também cria a linha de Ataque (`bonus: ''`, demais campos de `item.combate`)
- [x] 2.4 Em `removerItemComprado`, além de devolver o ouro e remover o item, localizar por nome (`arma === item.nome`) e remover a linha de Ataque correspondente, se existir

## 3. Testes

- [x] 3.1 Teste: comprar individualmente uma arma com dados de combate cria a linha de Ataque com os dados do catálogo, além do item de inventário
- [x] 3.2 Teste: aplicar o pacote inicial de uma classe cria os Ataques correspondentes às armas do pacote
- [x] 3.3 Teste: comprar um item sem dados de combate (armadura, item geral) não cria nenhuma linha de Ataque
- [x] 3.4 Teste: remover uma arma comprada remove também o Ataque correspondente e devolve o ouro
- [x] 3.5 Confirmar que nenhum teste existente de `EquipamentoStep`/`CharacterWizardPage`/`AtaquesTab` quebra com as mudanças

## 4. Validação

- [x] 4.1 `tsc -b` limpo
- [x] 4.2 `npm run build` limpo
- [x] 4.3 `vitest run` completo, sem novas regressões (306/306 nesta rodada — o teste pré-existente de `MasterDashboard.test.tsx` instável não recorreu)
- [x] 4.4 `openspec validate compra-arma-cria-ataque --strict`
