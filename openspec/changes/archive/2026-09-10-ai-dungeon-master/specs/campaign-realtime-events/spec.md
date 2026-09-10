## MODIFIED Requirements

### Requirement: Painel de eventos de mesa
Ao acessar a tela de uma campanha (dashboard do mestre ou ficha do jogador), o usuário SHALL ver um painel com os eventos de mesa daquela campanha (rolagens de dados, pedidos de rolagem, narração da IA e mudança de modo exploração/combate), em ordem cronológica, incluindo os eventos recentes já ocorridos antes de ele entrar na tela, e distinguindo visualmente a origem (IA ou uma conta humana específica) de cada evento.

#### Scenario: Usuário entra na tela da campanha
- **WHEN** o usuário acessa a tela de uma campanha em que é membro
- **THEN** o painel de eventos exibe os eventos recentes já ocorridos naquela campanha, em ordem cronológica

#### Scenario: Novo evento ocorre enquanto o usuário está na tela
- **WHEN** qualquer membro da campanha emite uma rolagem de dados ou um pedido de rolagem, ou a IA narra uma rodada ou muda o modo da campanha, enquanto o usuário está na tela da campanha
- **THEN** o painel de eventos do usuário atualiza para mostrar esse evento, sem precisar recarregar a página

#### Scenario: Evento de origem IA é distinguível
- **WHEN** o painel de eventos exibe um evento gerado pela IA (narração ou mudança de modo)
- **THEN** o sistema marca visualmente esse evento como originado pela IA, diferente de eventos originados por uma conta humana
