## MODIFIED Requirements

### Requirement: Painel de eventos de mesa
Ao acessar a tela de uma campanha (dashboard do mestre ou ficha do jogador), o usuário SHALL ver um painel com os eventos de mesa daquela campanha (rolagens de dados, pedidos de rolagem, resumos de rodada e ações de turno), em ordem cronológica e agrupados visualmente por rodada, incluindo os eventos recentes já ocorridos antes de ele entrar na tela.

#### Scenario: Usuário entra na tela da campanha
- **WHEN** o usuário acessa a tela de uma campanha em que é membro
- **THEN** o painel de eventos exibe os eventos recentes já ocorridos naquela campanha, em ordem cronológica e agrupados por rodada

#### Scenario: Novo evento ocorre enquanto o usuário está na tela
- **WHEN** qualquer membro da campanha emite uma rolagem de dados, um pedido de rolagem, um resumo de rodada ou uma ação de turno enquanto o usuário está na tela da campanha
- **THEN** o painel de eventos do usuário atualiza para mostrar esse evento, sem precisar recarregar a página

## ADDED Requirements

### Requirement: Resumo de rodada visível em tempo real
Enquanto uma rodada de exploração está aberta, o sistema SHALL exibir a todos os membros da campanha o texto atual do resumo que cada jogador já enviou para aquela rodada, atualizado em tempo real a cada novo envio.

#### Scenario: Jogador envia o resumo da rodada
- **WHEN** um jogador envia o resumo da própria rodada
- **THEN** todos os membros conectados veem o texto daquele resumo aparecer no painel de rodada, sem precisar recarregar a página

#### Scenario: Jogador reenvia o resumo antes de a rodada fechar
- **WHEN** um jogador reenvia (edita) o resumo antes do fechamento da rodada
- **THEN** o texto exibido para os demais membros é substituído pelo novo texto, sem indicação de que foi editado

### Requirement: Resumo de rodada permanece no histórico após o fechamento
Ao fechar uma rodada de exploração, o resumo final de cada jogador que respondeu SHALL permanecer visível no painel de eventos de mesa como um evento permanente daquela rodada, junto com a narração da IA gerada a partir dele.

#### Scenario: Rodada fecha com jogadores que responderam
- **WHEN** a rodada fecha e a narração da IA chega
- **THEN** o painel de eventos passa a mostrar, para aquela rodada, o resumo final de cada jogador que respondeu seguido da narração da IA

### Requirement: Fronteira visual entre rodadas no painel de eventos
O painel de eventos de mesa SHALL indicar visualmente onde uma rodada termina e a próxima começa, tanto para eventos gerados durante rodadas de exploração quanto durante turnos de combate.

#### Scenario: Usuário revisa o histórico de eventos
- **WHEN** o usuário visualiza eventos de mais de uma rodada no painel
- **THEN** o painel exibe uma marcação clara indicando a transição de uma rodada para a próxima

### Requirement: Ação de turno de combate visível para todos
Durante o modo combate, ao um jogador enviar a ação do próprio turno, o sistema SHALL exibir essa ação a todos os membros da campanha como um evento permanente no painel de eventos, assim que enviada.

#### Scenario: Jogador envia a ação do próprio turno
- **WHEN** é o turno do jogador e ele envia sua ação
- **THEN** a ação aparece no painel de eventos de todos os membros conectados, associada àquele turno/rodada
