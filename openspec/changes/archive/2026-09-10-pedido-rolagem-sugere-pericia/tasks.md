## 1. Catálogo de rolagem

- [x] 1.1 Criar `src/realtime/catalogoRolagem.ts` com o tipo `CatalogoRolagemEntry` (`{ rotulo: string } & ({ tipo: 'item'; tipoItem: TipoItemFicha; itemId: string } | { tipo: 'livre'; notacao: string })`)
- [x] 1.2 Implementar `montarCatalogoRolagem(ficha: Ficha): CatalogoRolagemEntry[]`:
  - entradas `tipo: 'item'` a partir de `ficha.pericias` (rótulo = `nome`), `ficha.ataques` (rótulo = `arma`), `ficha.talentos` (rótulo = `nome`)
  - entradas `tipo: 'livre'` para Fortitude/Reflexos/Vontade (`savingThrow` de `rules/combat.ts` com os campos de `ficha.combate`/`ficha.geral`), Iniciativa (`initiative`), e cada atributo de `ABILIDADES` (`attributeModifier(ficha.geral[key])`), todas como notação `1d20+N` (ou `1d20N` quando `N` é negativo/zero, seguindo o formato já validado por `isNotacaoDadosValida`)
- [x] 1.3 Testes de `catalogoRolagem.ts`: catálogo inclui todas as perícias/ataques/talentos da ficha com o `itemId` certo; inclui as três resistências, iniciativa e os seis atributos com a notação certa; ficha sem perícias/ataques/talentos ainda produz as entradas derivadas

## 2. Casamento texto → catálogo

- [x] 2.1 Criar `src/realtime/sugestaoRolagem.ts` com `sugerirEntradaDoPedido(descricao: string, catalogo: CatalogoRolagemEntry[]): CatalogoRolagemEntry | null`
- [x] 2.2 Casamento direto (substring normalizada por acento/caixa) para entradas `tipo: 'item'`, na ordem perícia → ataque → talento
- [x] 2.3 Casamento ancorado para entradas `tipo: 'livre'`: nome do atributo/resistência precedido por "teste de", "resistência de" ou "salvamento de"; "iniciativa" como termo autônomo — sem essas âncoras, não conta como correspondência
- [x] 2.4 Testes de `sugestaoRolagem.ts`: correspondência de perícia/ataque/talento (com acento/caixa diferente); correspondência de resistência/atributo só quando ancorada, e ausência de correspondência para menção solta da mesma palavra (ex.: "Vontade" sem "teste de"/"resistência de"); descrição sem nenhuma correspondência retorna `null`; descrição com múltiplas entradas retorna a primeira pela ordem de prioridade (item antes de derivado)

## 3. `EventosMesaPanel` exibe a sugestão

- [x] 3.1 `EventosMesaPanel` passa a aceitar `catalogoRolagem?: CatalogoRolagemEntry[]` e `onRolar?: (entrada: CatalogoRolagemEntry) => void`
- [x] 3.2 No card de `pedido_rolagem`, quando as props estão presentes e `destinatarioContaId` é a conta atual (ou `null`/todos), calcular a sugestão com `sugerirEntradaDoPedido` e, se houver correspondência, exibir o rótulo + valor/notação e um botão "Rolar" que chama `onRolar(entrada)`
- [x] 3.3 Quando `destinatarioContaId` aponta para outra conta, ou não há correspondência, ou as props não foram passadas (caso do `MasterDashboard`), o card renderiza exatamente como hoje (só a descrição)
- [x] 3.4 Testes de `EventosMesaPanel`: card com sugestão de item exibe rótulo/total e botão; card com sugestão derivada exibe rótulo/notação e botão; clicar no botão chama `onRolar` com a entrada certa; card sem correspondência não exibe botão; pedido direcionado a outro jogador não exibe sugestão mesmo com correspondência; painel sem as novas props (uso atual no `MasterDashboard`) continua funcionando sem erro

## 4. Fiação em `CharacterSheetPage`

- [x] 4.1 `CharacterSheetPage.tsx` monta o catálogo com `montarCatalogoRolagem(ficha)` e passa para `EventosMesaPanel` como `catalogoRolagem`
- [x] 4.2 `onRolar` passado a `EventosMesaPanel` despacha por tipo de entrada: `tipo: 'item'` chama `rolarItem(tipoItem, itemId)` (já existente); `tipo: 'livre'` chama `emitirRolagem({ notacao })` (mesmo caminho da Rolagem Livre)
- [x] 4.3 Teste em `CharacterSheetPage.test.tsx`: acionar a sugestão de uma perícia dispara a mesma rolagem que o botão da aba Perícias; acionar a sugestão de um teste de resistência/atributo dispara `emitirRolagem` com a notação calculada correta

## 5. Verificação manual

- [ ] 5.1 Ponta a ponta: pedir rolagem de uma perícia, um ataque e um talento existentes na ficha e confirmar que o card mostra o valor e rola corretamente ao clicar
- [ ] 5.2 Ponta a ponta: pedir "Teste de Resistência de Vontade", "role Iniciativa" e "Teste de Força" e confirmar que o card mostra a notação certa e rola corretamente ao clicar
- [ ] 5.3 Confirmar que uma menção solta de "Força" ou "Vontade" sem padrão de teste (narração comum) não gera sugestão indevida
- [ ] 5.4 Confirmar que o `MasterDashboard` continua exibindo o card de `pedido_rolagem` sem sugestão (sem quebrar layout)
