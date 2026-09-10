# ai-master-handoff Specification

## Purpose

Dá ao criador de uma campanha conduzida por IA a ação de assumir como mestre humano a qualquer momento, deixando claro que é uma decisão irreversível, e o orienta com o resumo de handoff antes de cair no dashboard de mestre.

## Requirements

### Requirement: Ação de assumir como mestre disponível a qualquer momento
O sistema SHALL exibir, para o criador de uma campanha ainda conduzida por IA, uma ação para assumir como mestre, visível a qualquer momento durante a campanha (não só logo após a geração do mundo).

#### Scenario: Criador vê a ação de assumir como mestre
- **WHEN** o criador de uma campanha conduzida por IA acessa a tela dessa campanha
- **THEN** o sistema exibe a ação de assumir como mestre, disponível para acionar

#### Scenario: Usuário que não é o criador não vê a ação
- **WHEN** um jogador que não criou a campanha acessa a tela dela
- **THEN** o sistema não exibe a ação de assumir como mestre para esse usuário

### Requirement: Confirmação explícita de irreversibilidade
Ao acionar a ação de assumir como mestre, o sistema SHALL exigir uma confirmação explícita informando que a IA será desativada permanentemente para aquela campanha, antes de prosseguir.

#### Scenario: Criador confirma a ação
- **WHEN** o criador confirma a ação de assumir como mestre na etapa de confirmação
- **THEN** o sistema dispara o handoff e exibe um estado de carregamento até o resumo ficar pronto

#### Scenario: Criador cancela a confirmação
- **WHEN** o criador fecha a etapa de confirmação sem confirmar
- **THEN** o sistema não altera nada e a campanha continua conduzida pela IA

### Requirement: Exibição do resumo de handoff antes do dashboard
Assim que o handoff é concluído, o sistema SHALL exibir ao novo mestre o resumo gerado pela IA (o que já aconteceu, ganchos em aberto, segredos não revelados) antes de levá-lo ao dashboard de mestre já existente, e SHALL manter esse resumo acessível a partir do dashboard depois disso.

#### Scenario: Resumo exibido ao concluir o handoff
- **WHEN** o handoff de uma campanha é concluído
- **THEN** o sistema exibe o resumo gerado pela IA para o novo mestre antes de navegar para o dashboard

#### Scenario: Resumo continua acessível depois
- **WHEN** o novo mestre já está no dashboard da campanha após o handoff
- **THEN** o sistema oferece uma forma de reabrir o resumo de handoff a qualquer momento
