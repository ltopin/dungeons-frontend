## 1. Motor de regras (`src/rules/`)

- [x] 1.1 `src/rules/attributeMods.ts`: `attributeModifier(valor)` e `sizeModifier(tamanho)` (tabela Minúsculo..Colossal)
- [x] 1.2 `src/rules/combat.ts`: `armorClass({...})` (total/toque/surpreendido), `savingThrow({...})`, `meleeAttackBonus({...})`, `rangedAttackBonus({...})`, `cmb({...})`, `cmd({...})` — CMB/CMD reaproveitando `sizeModifier` (decisão 4 do design)
- [x] 1.3 `src/rules/skills.ts`: `skillTotal({ graduacoes, atributoMod, periciaDeClasse, outros })`
- [x] 1.4 `src/rules/spells.ts`: `spellDC({ nivel, atributoMod, outros })`
- [x] 1.5 `src/rules/carryingCapacity.ts`: tabela oficial de carga por força 1–20 + extrapolação ×4 a cada +10 força acima disso, ajuste por tamanho, e `heavyLoadMultiples(cargaPesada)` retornando erguer-sobre-cabeça/erguer-do-chão/empurrar-arrastar
- [x] 1.6 Testes unitários para cada função acima cobrindo os cenários da spec `character-sheet-ruleset` (incluindo os breakpoints de força da tarefa 1.5)

## 2. Tipos e wire format

- [x] 2.1 `src/api/types.ts`: adicionar `cmbTotal`, `cmbOutros`, `cmdTotal`, `cmdOutros` em `FichaCombate`; `total` em `FichaPericia`; `peso`, `tamanho`, `propriedadesEspeciais` em `FichaAtaque`; `escola`, `tempoFormulacao`, `componentes`, `alcance`, `alvoEfeito`, `duracao`, `testeResistencia`, `resistenciaMagia`, `descricao` em `FichaMagia`; `magiasAdicionais`, `magiasConhecidas` em `FichaMagiaNivel`; `categoria` em `FichaTalento`; `cargaLeve`, `cargaMedia`, `cargaPesada`, `pesoTotalCarregado` em `FichaMoedas` (ou renomear/estender conforme o nome que a seção `inventario-moedas` usa hoje)
- [x] 2.2 `src/api/types.ts`: nova interface `FichaFamiliar` e campo `familiar?: FichaFamiliar` em `Ficha`
- [x] 2.3 `src/api/wireFormat.ts`: mapear camelCase↔snake_case para todos os campos novos da tarefa 2.1/2.2, seguindo o padrão já usado nos campos existentes
- [x] 2.4 Atualizar `src/api/wireFormat.test.ts` cobrindo os novos campos

## 3. Wiring nas abas — campos derivados somente-leitura

- [x] 3.1 `CombateTab.tsx`: substituir os inputs de CA total/toque/surpreendido, testes de resistência total, bônus de ataque corpo a corpo/distância, CMB e CMD por campos somente-leitura calculados via `useMemo` a partir dos atributos (recebidos da ficha carregada, ver design.md decisão 2) e dos componentes já editáveis
- [x] 3.2 `PericiasTab.tsx`: total de cada linha vira somente-leitura, calculado via `skillTotal`; o total calculado entra no payload de criação/edição da linha (`useListSection`)
- [x] 3.3 `InventarioTab.tsx`: carga leve/média/pesada e os três múltiplos derivados viram somente-leitura via `carryingCapacity`; peso total carregado calculado a partir da soma dos itens (`FichaItem.peso * quantidade`)
- [x] 3.4 `MagiasTab.tsx`: exibir CD calculada (somente-leitura) por magia, usando o atributo/nível de conjurador de `magiasConfig` e o nível da magia

## 4. Novos campos de detalhamento nas abas existentes

- [x] 4.1 `MagiasTab.tsx`: adicionar campos editáveis de escola, tempo de formulação, componentes, alcance, alvo/efeito, duração, teste de resistência, resistência à magia, descrição
- [x] 4.2 `AtaquesTab.tsx`: adicionar campos editáveis de peso, tamanho, propriedades especiais
- [x] 4.3 `TalentosTab.tsx`: adicionar seletor de categoria (talento/qualidade especial) e renderizar as duas categorias em listas separadas dentro da mesma aba

## 5. Nova seção: Familiar

- [x] 5.1 Criar `src/sheet/tabs/FamiliarTab.tsx` com os campos definidos em `FichaFamiliar` (nome, tipo, DV, iniciativa, deslocamento, CA, ataques, AE, QE, tendência, testes de resistência, os 6 atributos, CMB, CMD, face), tratando a ausência da seção como "vazio", não erro
- [x] 5.2 Registrar a aba de Familiar na navegação do editor de ficha, junto das demais abas
- [x] 5.3 Autosave da seção `familiar`: primeiro save cria (a API faz upsert — ver mudança irmã em `dungeons-api`), saves seguintes atualizam; nenhuma lógica especial de "criar vs atualizar" precisa existir no front além de sempre chamar o mesmo endpoint

## 6. Visão somente-leitura do mestre

- [x] 6.1 `CombateReadOnly.tsx`, `PericiasReadOnly.tsx`, `InventarioReadOnly.tsx`, `MagiasReadOnly.tsx`, `AtaquesReadOnly.tsx`, `TalentosReadOnly.tsx`: exibir os campos novos (já persistidos como calculados, então aqui é só leitura direta do valor vindo da API, sem recalcular)
- [x] 6.2 Criar `src/sheet/readonly/FamiliarReadOnly.tsx`, exibindo "sem familiar" quando a seção estiver ausente

## 7. Lista padrão de perícias (dev/fixtures)

- [x] 7.1 Se houver alguma lista local de perícias padrão usada em fixture/teste/storybook do frontend, atualizar para a lista de Pathfinder 1ª edição, consistente com o `DEFAULT_SKILLS` do backend (ver mudança irmã em `dungeons-api`) — nenhuma lista local encontrada (grep por `DEFAULT_SKILLS`/`periciasPadrao` sem resultados); `src/test/fixtures.ts` usa uma única perícia de exemplo, não uma lista padrão completa. Nada a fazer.

## 8. Testes de integração das abas

- [x] 8.1 Teste de `CombateTab`: alterar força/destreza na Geral reflete CA/CMB/CMD recalculados na tela antes do autosave confirmar
- [x] 8.2 Teste de `PericiasTab`: editar graduações envia o total calculado no payload da linha
- [x] 8.3 Teste de `InventarioTab`: alterar força recalcula as três faixas de carga e os três múltiplos
- [x] 8.4 Teste de `FamiliarTab`: ficha sem familiar não gera erro; primeiro salvamento e salvamentos seguintes funcionam
