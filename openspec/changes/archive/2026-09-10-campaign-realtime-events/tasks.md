## 1. Conexão de tempo real

- [x] 1.1 Adicionar dependência de cliente de tempo real (ex.: `socket.io-client`) ao `package.json`
- [x] 1.2 Criar módulo/hook `useCampaignEvents(campanhaId)`: conecta, entra na sala da campanha, expõe histórico + eventos novos + estado de conexão (conectado/reconectando/indisponível)
- [x] 1.3 Tipar os eventos de mesa (`rolagem_dados`, `pedido_rolagem`) espelhando o payload definido no `dungeons-api`

## 2. Painel de eventos

- [x] 2.1 Criar componente de painel de eventos (lista cronológica), compartilhado entre `MasterDashboard` e a tela de ficha do jogador
- [x] 2.2 Exibir estado vazio/indisponível quando a conexão cair ou não houver eventos ainda
- [x] 2.3 Montar o painel em `MasterDashboard` (src/routes/MasterDashboard.tsx)
- [x] 2.4 Montar o painel na tela de ficha do jogador (src/routes/CharacterSheetPage.tsx ou equivalente)

## 3. Rolagem vinculada a item de ficha

- [x] 3.1 Adicionar controle de rolagem aos itens de ficha rolam por si (ataque, perícia, talento) na tela de ficha do jogador
- [x] 3.2 Enviar a intenção de rolagem (item selecionado) pelo canal e exibir o resultado recebido no painel de eventos

## 4. Rolagem livre

- [x] 4.1 Criar controle de rolagem livre com campo de notação de dados (ex.: `2d6+3`)
- [x] 4.2 Validar a notação no cliente antes de enviar; bloquear envio e indicar erro quando inválida
- [x] 4.3 Enviar a rolagem livre válida pelo canal e exibir o resultado recebido

## 5. Pedido de rolagem (mestre)

- [x] 5.1 Criar controle, visível só ao mestre, para pedir rolagem a um jogador específico ou à mesa toda
- [x] 5.2 Enviar o pedido pelo canal; garantir que o controle não é renderizado para quem não é mestre

## 6. Testes

- [x] 6.1 Teste do painel de eventos: histórico inicial exibido, novo evento chegando atualiza a lista
- [x] 6.2 Teste de rolagem vinculada a item de ficha: resultado exibido é o recebido do canal, não um valor calculado localmente
- [x] 6.3 Teste de rolagem livre: notação inválida bloqueia envio; notação válida envia e exibe resultado
- [x] 6.4 Teste de pedido de rolagem: controle visível só ao mestre; envio com e sem jogador específico
- [x] 6.5 Teste de degradação: painel indica estado indisponível sem quebrar o restante da tela quando a conexão falha
