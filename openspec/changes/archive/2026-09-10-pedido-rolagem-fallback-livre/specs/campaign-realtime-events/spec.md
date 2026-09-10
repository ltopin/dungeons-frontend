## ADDED Requirements

### Requirement: Fallback de rolagem livre vinculada a um pedido de rolagem
Todo card de `pedido_rolagem` visível para o destinatário do pedido (o jogador específico, ou qualquer jogador quando o pedido é para a mesa toda) SHALL oferecer um controle de rolagem livre — independente de a sugestão automática ter encontrado ou não uma correspondência no catálogo da ficha — cuja rolagem é enviada vinculada àquele `pedido_evento_id` específico.

#### Scenario: Pedido sem correspondência no catálogo ainda pode ser respondido
- **WHEN** um jogador destinatário de um `pedido_rolagem` visualiza o card desse pedido e o texto do pedido não casa com nenhuma entrada do catálogo de rolagem da própria ficha
- **THEN** o card ainda exibe um controle de rolagem livre que, ao ser usado, envia a rolagem vinculada ao `pedido_evento_id` daquele card

#### Scenario: Pedido com correspondência automática continua oferecendo o fallback
- **WHEN** um jogador destinatário de um `pedido_rolagem` visualiza um card cujo texto casou com uma entrada do catálogo (exibindo a sugestão automática)
- **THEN** o card exibe tanto a sugestão automática quanto o controle de rolagem livre, e qualquer um dos dois, quando usado, envia a rolagem vinculada ao `pedido_evento_id` daquele card

#### Scenario: Pedido composto respondido em duas rolagens
- **WHEN** um jogador usa o controle de rolagem livre de um card de pedido para enviar uma primeira rolagem (ex.: ataque) e, em seguida, usa o mesmo controle do mesmo card para enviar uma segunda rolagem (ex.: dano)
- **THEN** ambas as rolagens são enviadas vinculadas ao mesmo `pedido_evento_id`, sem que o envio da primeira desabilite ou oculte o controle para a segunda

#### Scenario: Jogador que não é destinatário do pedido
- **WHEN** um jogador que não é o destinatário do pedido (nem é um caso de pedido para a mesa toda) visualiza a lista de eventos
- **THEN** o card desse `pedido_rolagem` não exibe nenhum controle de rolagem, nem automático nem livre, para esse jogador
