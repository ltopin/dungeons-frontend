## Why

As abas da ficha (`src/sheet/tabs/*Tab.tsx`) hoje são formulários de entrada crua — nenhum campo é calculado, o usuário digita CA total, bônus de perícia, CD de magia etc. de cabeça, exatamente como fazia na planilha Excel que originou o protótipo. Foi decidido (exploração com o usuário) que o `dungeons-frontend` assume o motor de regras de Pathfinder 1ª edição e envia os valores já calculados para a API — o `dungeons-api` só ganha campo pra guardar (ver mudança irmã de mesmo nome naquele repositório). Hoje não existe nenhuma lógica de cálculo no frontend nem tipos para os campos calculados/ricos que a planilha de origem tem (CMB/CMD, total de perícia, detalhamento de magia, capacidade de carga, familiar).

## What Changes

- Novo módulo `src/rules/` com funções puras que implementam as fórmulas de Pathfinder 1ª edição extraídas da ficha de origem: modificador de atributo, componentes e total de CA (normal/toque/surpreendido), testes de resistência, BAB e bônus de ataque (corpo a corpo/distância), CMB/CMD, total de perícia (graduações + mod. atributo + bônus de classe + outros), CD de magia por nível, e capacidade de carga (leve/média/pesada) a partir de FOR e tamanho.
- `CombateTab`, `PericiasTab`, `MagiasTab`, `InventarioTab` passam a exibir os campos calculados como somente-leitura (derivados ao vivo dos inputs), em vez de inputs livres — e o autosave da seção passa a incluir esses valores calculados no payload enviado à API.
- Nova aba `FamiliarTab` (+ `FamiliarReadOnly` na visão do mestre) para a seção opcional de familiar/companheiro animal, hoje sem nenhuma representação no protótipo.
- `MagiasTab` ganha os campos de detalhamento do grimório (escola, componentes, alcance, alvo/efeito, duração, teste de resistência, resistência à magia, descrição) e `FichaMagiaNivel` ganha magias adicionais/conhecidas.
- `AtaquesTab` ganha peso, tamanho e propriedades especiais por arma.
- `TalentosTab` passa a distinguir talento de qualidade especial (mesmo formulário, campo de categoria).
- `src/api/types.ts` e `src/api/wireFormat.ts` ganham os campos novos (espelhando 1:1 os campos definidos na mudança irmã de `dungeons-api`).
- A lista padrão de perícias usada por qualquer fixture/dado local de desenvolvimento passa a ser a lista de Pathfinder 1ª edição, consistente com o novo `DEFAULT_SKILLS` do backend.
- **BREAKING** (interno, sem usuários em produção): os campos hoje editáveis de CA total, testes de resistência total, bônus de ataque total e total de perícia deixam de ser inputs — quem tentar digitar neles diretamente não vai mais conseguir, o valor passa a vir do cálculo.

## Capabilities

### New Capabilities
- `character-sheet-ruleset`: as fórmulas de Pathfinder 1ª edição em si (modificador de atributo, CA, testes de resistência, ataque, CMB/CMD, perícia, CD de magia, capacidade de carga) como requisitos testáveis, independentes de onde são exibidas na UI.

### Modified Capabilities
- `character-sheets`: os campos derivados da ficha passam a ser calculados e somente-leitura na UI, o payload de autosave passa a incluir os valores calculados, e novas seções/campos (familiar, detalhamento de magia, peso/tamanho/propriedades de ataque, categoria de talento) entram no fluxo de edição e autosave já existente.

## Impact

- Novo: `src/rules/attributeMods.ts`, `src/rules/combat.ts` (CA/testes/ataque/CMB-CMD), `src/rules/skills.ts`, `src/rules/spells.ts` (CD por nível), `src/rules/carryingCapacity.ts` (tabela de carga por FOR/tamanho) — nomes de arquivo indicativos, a organização exata fica em design.md.
- Novo: `src/sheet/tabs/FamiliarTab.tsx`, `src/sheet/readonly/FamiliarReadOnly.tsx`.
- Alterados: `src/sheet/tabs/{Combate,Pericias,Magias,Ataques,Talentos,Inventario}Tab.tsx`, `src/sheet/readonly/*ReadOnly.tsx` correspondentes, `src/api/types.ts`, `src/api/wireFormat.ts`.
- Depende do contrato ampliado de `dungeons-api` (mudança irmã `character-sheet-computed-fields` naquele repositório) — os nomes de campo devem bater exatamente com o schema definido lá.
