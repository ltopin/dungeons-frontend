# campaign-realtime-events Specification

## Purpose

Dá a mestre e jogadores um painel, dentro da tela da campanha, para ver e disparar rolagens de dados e pedidos de rolagem em tempo real, com o resultado sempre vindo do servidor.

## Requirements

### Requirement: Painel de eventos de mesa
Ao acessar a tela de uma campanha (dashboard do mestre ou ficha do jogador), o usuário SHALL ver um painel com os eventos de mesa daquela campanha (rolagens de dados, pedidos de rolagem, resumos de rodada, ações de turno, narração da IA e mudança de modo exploração/combate), em ordem cronológica e agrupados visualmente por rodada, incluindo os eventos recentes já ocorridos antes de ele entrar na tela, e distinguindo visualmente a origem (IA ou uma conta humana específica) de cada evento.

#### Scenario: Usuário entra na tela da campanha
- **WHEN** o usuário acessa a tela de uma campanha em que é membro
- **THEN** o painel de eventos exibe os eventos recentes já ocorridos naquela campanha, em ordem cronológica e agrupados por rodada

#### Scenario: Novo evento ocorre enquanto o usuário está na tela
- **WHEN** qualquer membro da campanha emite uma rolagem de dados, um pedido de rolagem, um resumo de rodada ou uma ação de turno, ou a IA narra uma rodada ou muda o modo da campanha, enquanto o usuário está na tela da campanha
- **THEN** o painel de eventos do usuário atualiza para mostrar esse evento, sem precisar recarregar a página

#### Scenario: Evento de origem IA é distinguível
- **WHEN** o painel de eventos exibe um evento gerado pela IA (narração ou mudança de modo)
- **THEN** o sistema marca visualmente esse evento como originado pela IA, diferente de eventos originados por uma conta humana

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
- **THEN** a UI envia o pedido e ele passa a aparecer no painel de eventos de todos os membros da mesa, identificando o jogador solicitado pelo nome do personagem (ficha) dele

#### Scenario: Mestre pede rolagem a toda a mesa
- **WHEN** o mestre confirma um pedido de rolagem sem selecionar um jogador específico
- **THEN** a UI envia o pedido como direcionado a todos, e ele aparece no painel de eventos de todos os membros da mesa

#### Scenario: Jogador não vê o controle de pedido de rolagem
- **WHEN** um jogador (não mestre) acessa a tela da campanha
- **THEN** a UI não exibe o controle de pedido de rolagem para esse usuário

### Requirement: Atribuição do autor da rolagem por nome do personagem
Ao exibir um evento de rolagem de dados no painel de eventos, a UI SHALL identificar o personagem (ficha) que executou a rolagem pelo nome, exceto quando o evento for do próprio usuário vendo o painel, caso em que SHALL exibir "Você".

#### Scenario: Rolagem de outro jogador aparece com o nome do personagem
- **WHEN** um evento de rolagem de dados de outro membro da campanha chega ao painel de eventos
- **THEN** o painel exibe o nome do personagem (ficha) que executou aquela rolagem, em vez de um rótulo genérico como "Um jogador"

#### Scenario: Rolagem do próprio usuário continua identificada como "Você"
- **WHEN** o evento de rolagem de dados exibido no painel foi emitido pelo próprio usuário que está vendo o painel
- **THEN** o painel continua exibindo "Você" como autor, em vez do nome do personagem dele

### Requirement: Painel de eventos exibe reação pontual a pedido de rolagem respondido
Quando a IA transmite uma narração de reação pontual vinculada a um `pedido_rolagem`, o painel de eventos SHALL exibi-la assim que recebida, associada visualmente ao pedido e à rolagem que a originaram, sem que o membro precise fechar a rodada ou aguardar o avanço do turno.

#### Scenario: Reação chega para um pedido dirigido ao jogador atual
- **WHEN** o jogador atual responde, via rolagem, a um `pedido_rolagem` do qual é destinatário direto
- **THEN** o painel de eventos exibe a narração de reação assim que chega pelo socket, associada ao card do pedido/rolagem correspondente

#### Scenario: Reação chega para um pedido dirigido à mesa toda
- **WHEN** um `pedido_rolagem` dirigido à mesa toda é respondido por qualquer jogador presente
- **THEN** o painel de eventos de todos os membros conectados exibe a reação correspondente a essa resposta específica, assim que produzida, sem esperar outros jogadores responderem ao mesmo pedido

#### Scenario: Rolagem em resposta a um pedido informa a correlação
- **WHEN** o jogador dispara uma rolagem a partir do pedido de rolagem exibido no painel
- **THEN** o frontend envia o id desse pedido junto com a rolagem, permitindo ao servidor vincular a reação gerada a esse pedido

#### Scenario: Painel de rodada permanece inalterado
- **WHEN** uma reação pontual é exibida no painel de eventos
- **THEN** o estado de rodada/turno exibido em `RodadaPanel` (resumo, fechamento, ordem de turnos) não é afetado por essa reação

### Requirement: Pedido de rolagem sugere a entrada correspondente do catálogo de rolagem do jogador
Quando um evento `pedido_rolagem` é direcionado ao jogador atual (para ele especificamente ou para toda a mesa) e o texto do pedido corresponde a uma entrada do catálogo de rolagem da própria ficha desse jogador — perícia, ataque, talento, teste de resistência (Fortitude/Reflexos/Vontade), iniciativa ou teste de atributo puro (Força/Destreza/Constituição/Inteligência/Sabedoria/Carisma) — o painel de eventos SHALL exibir, junto ao card do pedido, o valor ou a notação calculada dessa entrada e um atalho para disparar a rolagem correspondente, sem que o jogador precise sair do painel de eventos para localizá-la manualmente.

#### Scenario: Pedido de rolagem corresponde a uma perícia, ataque ou talento da ficha
- **WHEN** o jogador atual recebe (ou é incluído em) um `pedido_rolagem` cuja descrição menciona o nome de uma perícia, ataque ou talento presente na sua própria ficha (ex.: "Teste de Percepção...", "role para atacar com sua Espada longa")
- **THEN** o painel de eventos exibe, no card desse pedido, o total calculado do item correspondente e um botão que dispara a mesma rolagem vinculada a esse item já disponível na aba correspondente da ficha

#### Scenario: Pedido de rolagem corresponde a um teste de resistência, iniciativa ou atributo puro
- **WHEN** o jogador atual recebe um `pedido_rolagem` cuja descrição contém um padrão reconhecível de teste de resistência, iniciativa ou atributo puro (ex.: "Teste de Resistência de Vontade CD 15", "role Iniciativa", "Teste de Força")
- **THEN** o painel de eventos exibe, no card desse pedido, a notação de dados calculada (1d20 + o valor total daquele teste, calculado a partir da própria ficha) e um botão que dispara essa rolagem

#### Scenario: Menção incidental a uma palavra de atributo/resistência não gera sugestão
- **WHEN** a descrição de um `pedido_rolagem` contém uma palavra igual ao nome de um atributo ou teste de resistência (ex.: "Vontade", "Força") mas não em um padrão reconhecível de pedido de teste (ex.: menção narrativa solta, sem "teste de"/"resistência de"/termo equivalente)
- **THEN** o painel de eventos não exibe sugestão para essa palavra, evitando falsos positivos a partir de palavras comuns do português

#### Scenario: Rolar a partir da sugestão produz o mesmo resultado que rolar pela aba correspondente
- **WHEN** o jogador aciona o botão de rolagem exibido na sugestão do card de `pedido_rolagem` para uma entrada vinculada a um item da ficha (perícia, ataque ou talento)
- **THEN** o sistema dispara a mesma rolagem vinculada a esse item (resultado sempre calculado pelo servidor) que seria disparada ao clicar em Rolar na aba correspondente

#### Scenario: Pedido de rolagem sem correspondência no catálogo
- **WHEN** o texto de um `pedido_rolagem` direcionado ao jogador atual não corresponde a nenhuma entrada do catálogo de rolagem da sua ficha (ex.: pedido descrito de forma não reconhecível, ou perícia/ataque/talento removido da ficha)
- **THEN** o painel de eventos exibe o card apenas com o texto da descrição, sem sugestão nem atalho de rolagem

#### Scenario: Pedido de rolagem direcionado a outro jogador não exibe sugestão
- **WHEN** um `pedido_rolagem` é direcionado especificamente a outro jogador (`destinatarioContaId` diferente da conta atual)
- **THEN** o painel de eventos do jogador atual não exibe sugestão nem atalho de rolagem para esse card, independentemente de o texto corresponder a uma entrada do catálogo dele

#### Scenario: Painel do mestre não exibe sugestão
- **WHEN** o painel de eventos é exibido no dashboard do mestre
- **THEN** os cards de `pedido_rolagem` não exibem sugestão nem atalho de rolagem, já que o mestre não tem uma ficha própria associada

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

### Requirement: Painel de eventos oferece rolagem pronta para pedido pelo NPC
Quando um `pedido_rolagem` traz uma notação e um nome de NPC já preenchidos pela IA, o painel de eventos SHALL exibir, para qualquer jogador da mesa, um botão de rolagem pronto com essa notação — sem exigir casamento com o catálogo de rolagem do jogador que está vendo o painel.

#### Scenario: Jogador vê o botão de rolagem pelo NPC
- **WHEN** um `pedido_rolagem` cujo payload traz nome de NPC e notação chega ao painel de eventos
- **THEN** qualquer jogador da mesa vê um botão de rolagem identificado pelo nome do NPC, já com a notação pronta, independentemente do próprio catálogo de rolagem

#### Scenario: Jogador aciona o botão
- **WHEN** um jogador clica no botão de rolagem de um pedido pelo NPC
- **THEN** a UI envia uma rolagem livre com a notação do pedido, referenciando o id desse pedido, pelo mesmo caminho já usado para responder a outros pedidos de rolagem

### Requirement: Botão de rolagem pelo NPC deixa de ser acionável após a primeira resposta
Diferente de um pedido dirigido à mesa toda onde cada jogador responde de forma independente, um pedido pelo NPC SHALL admitir apenas uma resposta válida — assim que qualquer jogador responder, o painel de eventos SHALL deixar de oferecer o botão de rolagem desse pedido para os demais jogadores.

#### Scenario: Outro jogador já respondeu
- **WHEN** o painel de eventos de um jogador já contém uma rolagem de dados referenciando o pedido pelo NPC, emitida por outro jogador
- **THEN** esse jogador não vê mais (ou vê desabilitado) o botão de rolagem para esse mesmo pedido

#### Scenario: Ninguém respondeu ainda
- **WHEN** nenhuma rolagem de dados referenciando o pedido pelo NPC apareceu ainda no painel de eventos
- **THEN** o botão de rolagem desse pedido permanece visível e acionável para qualquer jogador da mesa
