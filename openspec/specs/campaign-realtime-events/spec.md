# campaign-realtime-events Specification

## Purpose

Dá a mestre e jogadores um painel, dentro da tela da campanha, para ver e disparar rolagens de dados e pedidos de rolagem em tempo real, com o resultado sempre vindo do servidor.

## Requirements

### Requirement: Painel de eventos de mesa
Ao acessar a tela de uma campanha (dashboard do mestre ou ficha do jogador), o usuário SHALL ver um painel com os eventos de mesa daquela campanha (rolagens de dados e pedidos de rolagem), em ordem cronológica, incluindo os eventos recentes já ocorridos antes de ele entrar na tela.

#### Scenario: Usuário entra na tela da campanha
- **WHEN** o usuário acessa a tela de uma campanha em que é membro
- **THEN** o painel de eventos exibe os eventos recentes já ocorridos naquela campanha, em ordem cronológica

#### Scenario: Novo evento ocorre enquanto o usuário está na tela
- **WHEN** qualquer membro da campanha emite uma rolagem de dados ou um pedido de rolagem enquanto o usuário está na tela da campanha
- **THEN** o painel de eventos do usuário atualiza para mostrar esse evento, sem precisar recarregar a página

### Requirement: Rolar dados vinculado a um item da ficha
O jogador SHALL poder disparar uma rolagem a partir de um item da própria ficha (ataque, perícia ou talento), e a UI SHALL exibir como resultado o valor devolvido pelo servidor — nunca um valor calculado localmente.

#### Scenario: Jogador rola a partir de um item da ficha
- **WHEN** o jogador aciona a rolagem em um item da própria ficha (ex.: uma perícia)
- **THEN** a UI envia o pedido de rolagem para aquele item e, ao receber a resposta do servidor, exibe o resultado recebido no painel de eventos

### Requirement: Rolagem livre
O jogador SHALL poder disparar uma rolagem livre informando uma notação de dados (ex.: `2d6+3`), com o resultado exibido sendo o devolvido pelo servidor.

#### Scenario: Jogador faz uma rolagem livre
- **WHEN** o jogador informa uma notação de dados válida e confirma a rolagem
- **THEN** a UI envia a rolagem livre e exibe, no painel de eventos, o resultado recebido do servidor

#### Scenario: Notação de dados inválida
- **WHEN** o jogador tenta confirmar uma rolagem livre com uma notação inválida
- **THEN** a UI impede o envio e indica que a notação é inválida, sem chegar a contatar o servidor

### Requirement: Mestre pede uma rolagem
O mestre SHALL poder pedir que um jogador específico da campanha, ou todos os jogadores, façam uma rolagem determinada.

#### Scenario: Mestre pede rolagem a um jogador específico
- **WHEN** o mestre escolhe um jogador da campanha e confirma um pedido de rolagem para ele
- **THEN** a UI envia o pedido e ele passa a aparecer no painel de eventos de todos os membros da mesa, identificando o jogador solicitado

#### Scenario: Mestre pede rolagem a toda a mesa
- **WHEN** o mestre confirma um pedido de rolagem sem selecionar um jogador específico
- **THEN** a UI envia o pedido como direcionado a todos, e ele aparece no painel de eventos de todos os membros da mesa

#### Scenario: Jogador não vê o controle de pedido de rolagem
- **WHEN** um jogador (não mestre) acessa a tela da campanha
- **THEN** a UI não exibe o controle de pedido de rolagem para esse usuário
