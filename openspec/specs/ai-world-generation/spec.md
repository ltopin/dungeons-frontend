# ai-world-generation Specification

## Purpose

Guia o usuário na criação de uma campanha conduzida inteiramente por IA: um wizard coleta o contexto do mundo desejado, acompanha a geração assíncrona no backend, e leva à escolha de papel do criador assim que o mundo fica pronto.

## Requirements

### Requirement: Wizard de criação de mundo segue o mesmo padrão visual do assistente de personagem
O wizard de criação de mundo por IA SHALL seguir o mesmo padrão de navegação já usado no `character-creation-wizard`: uma barra lateral listando cada etapa com seu estado (pendente, concluída, ou não aplicável), navegação livre entre etapas a qualquer momento, gravação do progresso por etapa, e feedback visual distinto no botão de confirmação quando a etapa está incompleta ou quando o envio está em andamento.

#### Scenario: Usuário navega livremente entre etapas do wizard de mundo
- **WHEN** o usuário seleciona, na barra lateral do wizard de criação de mundo, uma etapa diferente da atual
- **THEN** o sistema exibe o conteúdo daquela etapa imediatamente, preservando o que já foi preenchido em qualquer etapa

#### Scenario: Etapa incompleta do wizard de mundo
- **WHEN** a etapa atual do wizard de criação de mundo não tem os campos obrigatórios preenchidos
- **THEN** o botão de confirmação exibe o estado visual de desabilitado, e o usuário não consegue avançar

### Requirement: Etapas do wizard coletam o contexto do mundo
O wizard SHALL coletar, em etapas separadas, os campos obrigatórios (gênero/tom, nível de poder inicial, restrições de conteúdo, tamanho do grupo) e os campos opcionais (inspirações, idioma/nome do mundo), e SHALL impedir avançar de uma etapa com campo obrigatório vazio.

#### Scenario: Preenchimento dos campos obrigatórios
- **WHEN** o usuário preenche todos os campos obrigatórios de uma etapa do wizard
- **THEN** o sistema libera o avanço para a próxima etapa

#### Scenario: Campo obrigatório vazio
- **WHEN** o usuário tenta avançar de uma etapa do wizard com um campo obrigatório vazio
- **THEN** o sistema impede o avanço e indica o campo pendente

### Requirement: Disparo da geração ao concluir o wizard
Ao concluir a última etapa do wizard, o sistema SHALL enviar o contexto coletado para iniciar a geração do mundo, e SHALL exibir uma tela de acompanhamento enquanto a geração está em andamento no backend.

#### Scenario: Usuário conclui o wizard
- **WHEN** o usuário confirma a última etapa do wizard de criação de mundo
- **THEN** o sistema envia o contexto coletado e exibe a tela de acompanhamento da geração

#### Scenario: Geração em andamento
- **WHEN** a geração do mundo ainda não terminou
- **THEN** a tela de acompanhamento exibe um estado de carregamento, sem navegar para a campanha ainda

#### Scenario: Falha na geração
- **WHEN** a geração do mundo falha no backend
- **THEN** o sistema exibe uma mensagem de erro na tela de acompanhamento, sem navegar para a campanha

### Requirement: Escolha de papel do criador ao final da geração
Assim que a geração é concluída, o sistema SHALL apresentar ao criador a escolha entre entrar como jogador ou assumir como mestre imediatamente, deixando claro que a IA continuará conduzindo a campanha caso ele opte por jogador (ou não escolha nada agora).

#### Scenario: Criador escolhe entrar como jogador
- **WHEN** o criador, na tela pós-geração, escolhe entrar como jogador
- **THEN** o sistema o leva ao editor da própria ficha nessa campanha, com a IA seguindo como mestre

#### Scenario: Criador escolhe assumir como mestre
- **WHEN** o criador, na tela pós-geração, escolhe assumir como mestre
- **THEN** o sistema segue o fluxo de assumir como mestre (`ai-master-handoff`)

#### Scenario: Criador fecha a tela sem escolher
- **WHEN** o criador sai da tela pós-geração sem escolher jogador nem mestre
- **THEN** a campanha permanece disponível na lista de campanhas do criador, jogável com a IA como mestre, e ele pode voltar a escolher depois
