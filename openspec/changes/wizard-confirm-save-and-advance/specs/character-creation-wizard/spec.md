## MODIFIED Requirements

### Requirement: Cada etapa grava progresso imediatamente

O sistema SHALL persistir a escolha de cada etapa do assistente na ficha, através dos mesmos endpoints de seção usados pela edição manual, e SHALL permitir que o jogador saia do assistente a qualquer momento e retorne depois, recarregando o estado inicial de cada etapa a partir da ficha já salva. Ao clicar no botão de confirmação de uma etapa, o sistema SHALL forçar o envio imediato de qualquer alteração pendente daquela etapa (sem esperar o debounce do autosave) e SHALL só avançar para a próxima etapa depois que esse envio for confirmado pela API.

#### Scenario: Saída no meio do assistente
- **WHEN** o jogador completa uma ou mais etapas, sai do assistente, e retorna mais tarde (inclusive após recarregar a página)
- **THEN** o sistema recarrega a ficha e reflete, em cada etapa correspondente, os valores já salvos anteriormente

#### Scenario: Confirmar logo após uma alteração ainda não salva
- **WHEN** o jogador altera um campo da etapa atual e clica no botão de confirmação antes do autosave debounced disparar sozinho
- **THEN** o sistema envia a alteração pendente imediatamente e só avança para a próxima etapa depois que o envio for confirmado

#### Scenario: Falha ao confirmar
- **WHEN** o envio forçado pelo clique de confirmação falha
- **THEN** o sistema permanece na etapa atual, mantém os dados preenchidos e sinaliza o erro de salvamento em vez de avançar

## ADDED Requirements

### Requirement: Feedback visual de botão de confirmação desabilitado

O sistema SHALL exibir um estado visual distinto (opacidade reduzida e cursor de "não permitido") no botão de confirmação de cada etapa sempre que a etapa não satisfizer as condições para avançar, e SHALL exibir um estado de carregamento no botão enquanto o envio forçado pelo clique de confirmação está em andamento, desabilitando-o para evitar duplo envio.

#### Scenario: Etapa incompleta
- **WHEN** a etapa atual não satisfaz as condições para avançar (ex.: campo obrigatório vazio, escolha pendente)
- **THEN** o botão de confirmação exibe o estado visual de desabilitado, distinto do estado habilitado

#### Scenario: Confirmação em andamento
- **WHEN** o jogador clica no botão de confirmação e o envio forçado ainda não terminou
- **THEN** o botão exibe um estado de carregamento e não aceita novos cliques até o envio terminar
