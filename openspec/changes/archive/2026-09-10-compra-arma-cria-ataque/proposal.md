## Why

Nenhum personagem sai da Trilha de Criação com um `Ataque` cadastrado, mesmo comprando uma arma na etapa de Equipamento. A compra grava a arma só como um item genérico de inventário (`itens`), nunca como uma linha em `ataques` (que tem os dados mecânicos — dano, crítico, tipo — necessários para rolar e para o catálogo de sugestão de rolagem). O jogador precisa lembrar de, depois, ir manualmente até a aba Ataques e preencher tudo de novo do zero, sem nenhum aviso disso durante a criação. Além disso, "Machado de guerra" — uma arma comum de Pathfinder 1e — nem está no catálogo curado de compra, então mesmo um jogador atento não teria como escolhê-la nessa etapa.

## What Changes

- O catálogo de equipamento (`src/rules/srd/equipment.ts`) ganha dados de combate (`dano`, `crítico`, `tipo`, `alcance`, `tamanho`, `propriedades especiais`) para as armas já existentes (Adaga, Espada longa, Machado grande, Arco curto, Cajado), e uma nova arma: Machado de guerra.
- Ao comprar uma arma na etapa de Equipamento (compra individual ou pacote inicial da classe), o sistema passa a criar também a linha correspondente em `Ataques`, pré-preenchida com os dados de combate do catálogo (bônus de ataque fica em branco, como em qualquer ataque adicionado manualmente — depende de escolhas ainda não finais como itens mágicos e iterativos).
- Remover um item de equipamento comprado que seja uma arma remove também o `Ataque` correspondente (por nome), para as duas seções não ficarem dessincronizadas.
- Itens que não são armas (armadura, escudo, geral) continuam se comportando exatamente como hoje — só viram item de inventário.
- **BREAKING**: nenhuma — comportamento aditivo; fichas já criadas não são retroativamente alteradas.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `character-creation-wizard`: a etapa de Equipamento passa a também criar o `Ataque` correspondente quando o item comprado é uma arma com dados de combate no catálogo, e a removê-lo quando o item é removido.

## Impact

- `src/rules/srd/equipment.ts`: `ItemEquipamentoSrd` ganha um campo opcional `combate` (dano/crítico/tipo/alcance/tamanho/propriedades especiais); armas existentes ganham esses dados; nova entrada `machado_guerra`.
- `src/wizard/steps/EquipamentoStep.tsx`: passa a receber `ataques`/`onAtaquesChange`, usa um segundo `useListSection` para a seção `ataques`, e cria/remove a linha de Ataque junto com a compra/remoção do item de inventário quando aplicável.
- `src/wizard/CharacterWizardPage.tsx`: repassa `ficha.ataques` e o callback de sincronização local para `EquipamentoStep`, no mesmo padrão já usado para `itens`/`talentos`.
- Nenhuma mudança em `dungeons-api` — a seção `ataques` já aceita criação/remoção de linhas normalmente.
