## Context

Ver proposal.md - Why. `EquipamentoStep.tsx` já usa `useListSection<FichaItem>(fichaId, 'itens', ...)` para CRUD imediato de itens comprados. `useListSection` é genérico e já é usado para a seção `ataques` em `AtaquesTab.tsx` (`useListSection<FichaAtaque>(fichaId, 'ataques', ...)`), então o mesmo hook resolve a nova seção sem nada novo no backend. `CharacterWizardPage.tsx` já repassa `ficha.itens`/`ficha.talentos` e o respectivo `onItensChange`/`onItemsChange` para sincronizar o estado local da ficha após cada seção do assistente — o mesmo padrão se aplica a `ficha.ataques`.

## Goals / Non-Goals

**Goals:**
- Toda arma comprada na etapa de Equipamento (individual ou via pacote) vira, automaticamente, uma linha usável em Ataques — sem passo manual extra do jogador.
- Manter os dois lados (item de inventário e linha de Ataque) razoavelmente sincronizados: remover o item remove o Ataque que ele gerou.
- Adicionar "Machado de guerra" ao catálogo, já que foi o caso concreto que expôs a lacuna.

**Non-Goals:**
- Calcular `bonus` (bônus de ataque) automaticamente a partir de BAB/atributos — fica em branco, como em qualquer Ataque adicionado manualmente hoje (`AtaquesTab`); calcular isso corretamente exigiria BAB por nível da classe, modificador de Força/Destreza, tamanho e ainda mudaria com magia/iterativos — fora de escopo desta change.
- Expandir o catálogo para o SRD completo de armas — só as 5 armas já existentes ganham dados de combate, mais Machado de guerra.
- Vincular armadura/escudo a `FichaCombate` (CA) — mesma lacuna existe para armaduras, mas é um cálculo de outra natureza (modificador de CA, não uma linha de lista) e não foi o que motivou esta change.

## Decisions

1. **Dados de combate vivem no próprio catálogo de equipamento (`ItemEquipamentoSrd.combate`, opcional)**, em vez de uma tabela separada. Só itens de `categoria: 'arma'` que tiverem esse campo preenchido disparam a criação do Ataque; os demais (armadura/escudo/geral, ou uma arma sem dados de combate cadastrados) continuam só como item de inventário, como hoje.
   Alternativa considerada: um catálogo de armas totalmente separado do catálogo de compra — rejeitada, duplicaria nome/custo/peso sem necessidade; o catálogo de compra já é o dado curado do frontend (ver comentário existente em `equipment.ts`).

2. **`EquipamentoStep` ganha um segundo `useListSection` para `ataques`**, reaproveitando o hook já usado em `AtaquesTab`. `comprarItem`/`aplicarPacoteInicial` passam a chamar uma função compartilhada (`adquirirItem`) que sempre adiciona o item ao inventário e, quando o item tem `combate`, também chama `ataquesLista.addItem({ arma: item.nome, bonus: '', ...item.combate })`.
   Alternativa considerada: criar o Ataque só na compra individual, não no pacote — rejeitada, o pacote é só um atalho para as mesmas compras; tratá-lo diferente seria inconsistente e surpreenderia o jogador que usa o pacote.

3. **Remoção por nome, sem id de correlação persistido.** `removerItemComprado` já sabe o `item.nome`; ao remover, procura em `ataquesLista.items` uma linha com `arma === item.nome` e remove a primeira encontrada, se houver. Não introduz nenhum campo novo de correlação em `FichaItem`/`FichaAtaque`.
   Alternativa considerada: guardar o id do Ataque criado num campo extra do item comprado — rejeitada como complexidade desnecessária; correlação por nome é suficiente neste fluxo (a etapa de Equipamento é sequencial e o jogador normalmente não terá duas armas de mesmo nome nem editará o nome do Ataque antes de remover o item).
   Trade-off aceito: se o jogador editar o nome do Ataque criado (na aba Ataques, fora do assistente) antes de remover o item na etapa de Equipamento, a remoção por nome não encontra mais o Ataque e ele fica órfão — comportamento aceitável, não pior que o estado atual (nenhuma sincronização).

4. **Dados de combate das armas existentes seguem o SRD/Pathfinder 1e**, coerentes com o restante do catálogo (que já é uma curadoria, não o SRD completo): Adaga (1d4, 19-20/x2, Perfuração/Corte), Espada longa (1d8, 19-20/x2, Corte), Machado grande (1d12, x3, Corte), Arco curto (1d6, x3, Perfuração), Cajado (1d6, x2, Concussão), e a nova Machado de guerra (1d8, x3, Corte, 10 po, 3kg — martelo marcial comum, coerente com o pedido que expôs a lacuna).

## Risks / Trade-offs

- [Risco] Ataque órfão se o jogador editar o nome da arma na aba Ataques antes de remover o item na etapa de Equipamento (ver decisão 3) → Mitigação: aceito; pior caso é igual ao comportamento anterior (nenhuma sincronização), não uma regressão.
- [Risco] Jogador que já tinha uma ficha em andamento antes desta change não ganha os Ataques retroativamente para itens já comprados → Mitigação: aceito, aditivo; o jogador pode adicionar manualmente ou recomprar removendo e comprando de novo.

## Migration Plan

Aditivo, sem mudança de schema nem dado a migrar. Nenhuma dependência de deploy no `dungeons-api`.
