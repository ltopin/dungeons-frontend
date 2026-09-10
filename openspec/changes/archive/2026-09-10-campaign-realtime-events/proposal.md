## Why

Hoje não existe nenhuma via de troca de informação ao vivo entre mestre e jogadores dentro do produto — nem no `MasterDashboard`, nem no editor de ficha do jogador (`CharacterSheetPage`). O caso mais concreto é a rolagem de dados: um jogador rola, o mestre e a mesa precisam ver isso na hora, e o mestre precisa poder pedir uma rolagem específica a alguém. Isso é resolvido hoje inteiramente fora do produto (voz, chat externo).

## What Changes

- Novo painel de eventos de mesa, visível tanto no `MasterDashboard` (mestre) quanto na tela de ficha do jogador, mostrando rolagens e pedidos de rolagem em tempo real, em ordem cronológica, incluindo o histórico recente ao entrar.
- UI de rolagem: jogador pode rolar a partir de um item da própria ficha (ataque, perícia ou talento) ou fazer uma rolagem livre; o resultado exibido é sempre o que o servidor devolve — a UI nunca calcula nem exibe um resultado próprio como final.
- UI do mestre para pedir uma rolagem a um jogador específico ou à mesa toda, aparecendo no painel de eventos de quem recebeu o pedido.
- Conexão em tempo real por campanha, ativa enquanto o usuário está na tela do dashboard do mestre ou da ficha do jogador daquela campanha.
- Depende do change espelhado `campaign-realtime-events` no `dungeons-api`, que define o canal, a autenticação, as salas por campanha e a autoridade do servidor sobre o resultado das rolagens; a implementação do canal é feita pelo agente responsável por aquele repositório — aqui apenas se consome o contrato esperado.

## Capabilities

### New Capabilities
- `campaign-realtime-events`: painel de eventos de mesa em tempo real (rolagem de dados e pedido de rolagem), visível ao mestre e aos jogadores de uma campanha.

### Modified Capabilities
_Nenhuma — `campaigns` e `character-sheets` continuam com os mesmos requisitos hoje especificados; este change adiciona um painel novo às telas existentes, sem mudar a navegação ou a edição/persistência de ficha já especificadas._

## Impact

- Novo cliente de tempo real (ex.: `socket.io-client`) e um módulo de conexão por campanha (local a definir em design.md).
- `src/routes/MasterDashboard.tsx` e `src/routes/CharacterSheetPage.tsx` (ou a tela de ficha do jogador correspondente): ganham o painel de eventos de mesa.
- Novo(s) componente(s) para o painel de eventos, controles de rolagem (vinculada a item de ficha ou livre) e controle de pedido de rolagem do mestre.
- `src/api/types.ts`/novo módulo de API: tipos para os eventos de mesa (`rolagem_dados`, `pedido_rolagem`) espelhando o payload definido no `dungeons-api`.
- Depende do change espelhado no `dungeons-api` (mesmo nome) para o canal, autenticação e contrato de eventos.
