## Context

Ver `proposal.md` para a motivação. Este design detalha a organização do motor de regras (`src/rules/`), como ele se conecta ao autosave por seção já existente (`useSectionAutosave`, `useListSection`, `useMagiaNiveis` — ver `character-sheet-persistence`), e as decisões de fidelidade à planilha de origem vs. correções conscientes que vão além dela.

## Goals / Non-Goals

**Goals:**
- Motor de regras como funções puras, sem estado e sem dependência de React, testáveis isoladamente (`src/rules/*.ts` + testes ao lado, seguindo o padrão já usado em `useListSection.test.ts`/`wireFormat.test.ts`).
- Cada campo derivado recalcula na tela imediatamente (não espera o debounce do autosave) — o debounce continua controlando só quando a rede é chamada, igual à decisão 3 de `character-sheet-persistence`.
- Fidelidade às fórmulas verificadas na planilha de origem onde elas existem; onde a planilha deixava um cálculo manual (carga leve/média/pesada), decisão consciente de automatizar com a tabela oficial em vez de replicar a lacuna manual.

**Non-Goals:**
- Validação de regra no backend — decisão do usuário (opção B simplificada): o front é a única fonte da regra nesta fase, o backend só persiste (ver design.md da mudança irmã em `dungeons-api`).
- Cobrir progressão de classe (tabelas de BAB/testes de resistência base por nível/classe, magias conhecidas por classe) — esses valores continuam sendo inputs diretos (`bab`, `fortitude_base`, etc.), como já é hoje; só a composição final (base + modificadores) é automatizada.
- Seção "Seguidores de Liderança" — fora de escopo, mesma decisão da mudança irmã.

## Decisions

### 1. `src/rules/` como funções puras por domínio, não um único "calculator"
Um arquivo por família de cálculo, espelhando os requisitos da spec `character-sheet-ruleset`:
- `src/rules/attributeMods.ts` — modificador de atributo e a tabela de modificador de tamanho (compartilhada por CA e CMB/CMD).
- `src/rules/combat.ts` — CA (total/toque/surpreendido), testes de resistência, bônus de ataque corpo a corpo/distância, CMB, CMD.
- `src/rules/skills.ts` — total de perícia.
- `src/rules/spells.ts` — CD de magia por nível.
- `src/rules/carryingCapacity.ts` — tabela oficial de carga por força (leve/média/pesada) e os múltiplos da carga pesada.

Alternativa considerada: um único módulo `src/rules/pathfinder.ts` com tudo. Rejeitada porque a spec já separa por domínio (um requisito por família de cálculo) e arquivos menores facilitam achar/testar uma fórmula específica sem carregar contexto das outras.

Cada função recebe os inputs primitivos necessários (números/strings) e retorna o valor calculado — sem ler `FichaGeral`/`FichaCombate` diretamente. Quem monta os inputs a partir do estado da ficha são os componentes de aba (decisão 2), o que mantém `src/rules/` sem dependência de `src/api/types.ts` e reutilizável tanto na visão de edição quanto na somente-leitura do mestre.

### 2. Onde o cálculo entra no fluxo de cada aba
Cada `*Tab.tsx` que tem campo derivado passa a computar esse valor a cada render (via `useMemo` sobre os inputs relevantes do estado local já existente), exibindo o resultado num campo somente-leitura (reaproveitando o padrão visual de campo desabilitado já usado pra ids/timestamps, se existir, ou um novo estilo mínimo). Quando o autosave da seção dispara (debounce existente de `useSectionAutosave`/`useListSection`), o valor calculado mais recente entra no payload junto com os campos digitados — não é preciso um estado separado "valor calculado pendente", porque o cálculo é determinístico a partir do estado que já vai ser enviado.

Caso especial: CA/CMB/CMD (seção Combate) dependem de atributos que vivem na seção Geral (outra aba). A tela de edição já carrega a ficha inteira de uma vez (`GET /fichas/:id`, decisão 1 de `character-sheet-persistence`), então o estado de Geral está disponível para a aba de Combate calcular — a dependência é resolvida no componente pai que hoje já mantém o estado completo da ficha carregada, passando os atributos como prop para `CombateTab`, sem precisar de um store global novo.

Alternativa considerada: mover o cálculo para o momento do autosave (calcular só na hora de montar o payload de rede, não a cada render). Rejeitada porque a spec exige que o campo derivado seja visível e atualize na tela imediatamente (requisito "Recalculo imediato entre seções"), não só no que é enviado.

### 3. Fidelidade à planilha vs. automação nova: capacidade de carga
A planilha de origem só automatiza os múltiplos da carga pesada (`C117=C108`, `C130=C108*2`, `C143=C108*5`); carga leve/média/pesada eram preenchidas manualmente pelo jogador a partir da tabela impressa no livro. Decisão: `carryingCapacity.ts` implementa a tabela oficial completa de Pathfinder 1ª edição (capacidade por força de 1 a 20, e a extrapolação ×4 a cada +10 força acima disso, com ajuste por tamanho), calculando as três faixas automaticamente. Alternativa considerada — manter os três campos como entrada manual, igual à planilha. Rejeitada porque a tabela é uma regra oficial fechada (não uma house rule ambígua), e automatizá-la é exatamente o tipo de ganho que motivou este change inteiro (ver proposal.md); manter uma lacuna manual que dá pra fechar seria inconsistente com o objetivo.

### 4. CMB/CMD reaproveita o modificador de tamanho de CA (não a tabela oficial invertida)
Verificado formula a formula: a planilha de origem usa a mesma célula de modificador de tamanho de CA (`DA34`) tanto para CA quanto para CMB/CMD (`BJ111=DA34`, `BJ117=DA34`) — a regra oficial de Pathfinder usa uma tabela com sinais invertidos para manobra de combate (criaturas grandes ganham bônus em CMB/CMD, não penalidade). Decisão: reproduzir o comportamento da planilha (reaproveitar o modificador de CA) em vez de "corrigir" para a tabela oficial, porque a ficha de origem é a fonte da verdade que o usuário pediu para automatizar, e divergir silenciosamente da regra que a campanha já usa há mais risco (personagens grandes/pequenos com CMB/CMD sutilmente diferente do que o grupo está acostumado) do que manter a fórmula como está. Registrado explicitamente na spec (`character-sheet-ruleset`) para não ser lido como bug depois.

### 5. Tipos e wire format
`src/api/types.ts` ganha os campos novos nas interfaces existentes (`FichaCombate.cmbTotal/cmbOutros/cmdTotal/cmdOutros`, `FichaPericia.total`, etc.) e uma nova interface `FichaFamiliar` + campo opcional `familiar?: FichaFamiliar` em `Ficha`. `src/api/wireFormat.ts` ganha o mapeamento camelCase↔snake_case dos novos campos, seguindo exatamente o padrão dos campos existentes (ex: `caTotal` ↔ `ca_total`).

## Risks / Trade-offs

- [Decisão 4 (reaproveitar tamanho de CA em CMB/CMD) pode surpreender alguém que conhece a regra oficial de Pathfinder] → mitigado por documentar explicitamente na spec e aqui; se o usuário decidir mais tarde que quer a tabela oficial invertida, é uma mudança isolada em `combat.ts` + um novo requisito MODIFIED, não um redesenho.
- [Cálculo espalhado por múltiplas abas que dependem do estado carregado da ficha inteira pode ficar difícil de rastrear conforme mais campos derivados forem adicionados] → mitigado por manter toda fórmula em `src/rules/` (puro, testável) e os componentes de aba só chamando essas funções, nunca reimplementando a conta inline.
- [Tabela de capacidade de carga (decisão 3) tem breakpoints específicos por faixa de força — fácil errar um valor da tabela] → mitigado por testes unitários de `carryingCapacity.ts` cobrindo os breakpoints (força 10, força 20, força 21+) explicitamente nas tasks.

## Migration Plan

Sem dado de usuário em produção (mesma situação de `character-sheet-persistence`). Depende do deploy do change irmão em `dungeons-api` estar disponível (schema com os campos novos) antes deste change poder enviar os payloads ampliados — ordem de deploy: `dungeons-api` primeiro.

## Open Questions

- Se o cálculo de CA/CMB/CMD que depende de atributos de outra aba deve, no futuro, virar um estado compartilhado (ex: context/store) em vez de prop drilling a partir do componente pai — não muda o comportamento especificado, é refactor de implementação a avaliar quando (se) mais campos cross-aba aparecerem.
