## 1. Entrada: criar campanha via IA

- [x] 1.1 Adicionar a opção "gerar com IA" na tela de criação de campanha existente
- [x] 1.2 Rotear a opção "gerar com IA" para o novo wizard, em vez do fluxo atual de criação direta

## 2. Wizard de criação de mundo

- [x] 2.1 Extrair/confirmar a parte genérica de `src/wizard/` (barra lateral, padrão de step, validação de avanço, feedback de botão) reaproveitável fora do contexto de personagem
- [x] 2.2 Criar as etapas do wizard de mundo (gênero/tom, nível de poder inicial, restrições de conteúdo, tamanho do grupo, inspirações/idioma/nome opcionais)
- [x] 2.3 Implementar navegação livre entre etapas e gravação de progresso por etapa, reaproveitando o padrão já validado no `character-creation-wizard`
- [x] 2.4 Bloquear avanço de etapa com campo obrigatório vazio, com feedback visual no botão de confirmação
- [x] 2.5 Disparar a geração ao concluir a última etapa e navegar para a tela de acompanhamento
- [x] 2.6 Usar a skill `impeccable` ao construir as telas do wizard, garantindo fidelidade ao tema visual já estabelecido no restante do frontend

## 3. Acompanhamento da geração e escolha de papel

- [x] 3.1 Tela de acompanhamento com polling/consulta de status da geração em andamento
- [x] 3.2 Estado de erro na tela de acompanhamento quando a geração falha
- [x] 3.3 Tela de escolha de papel ao concluir a geração (entrar como jogador / assumir como mestre)
- [x] 3.4 Ação "entrar como jogador" navegando para o editor de ficha da campanha
- [x] 3.5 Permitir que o criador saia sem escolher e volte mais tarde pela lista de campanhas

## 4. Sessão ao vivo — modo exploração

- [x] 4.1 Campo de resumo de rodada no painel de eventos da campanha (dashboard/ficha)
- [x] 4.2 Indicador de quais jogadores já escreveram o resumo da rodada corrente
- [x] 4.3 Botão de fechar rodada, visível a qualquer membro, habilitado mesmo com resumos pendentes
- [x] 4.4 Renderização da narração da IA como um novo tipo de item no painel de eventos, com marcação visual de origem IA

## 5. Sessão ao vivo — modo combate

- [x] 5.1 Exibição da ordem de iniciativa e do turno corrente quando a campanha entra em modo combate
- [x] 5.2 Habilitar controles de ação apenas para o jogador do turno corrente, desabilitados para os demais
- [x] 5.3 Retorno automático à UI de rodada em modo exploração quando o combate é encerrado

## 6. Assumir como mestre

- [x] 6.1 Ação "assumir como mestre" visível para o criador a qualquer momento durante uma campanha conduzida por IA
- [x] 6.2 Etapa de confirmação explícita informando a irreversibilidade antes de disparar o handoff
- [x] 6.3 Tela de exibição do resumo de handoff gerado pela IA, antes de navegar para o dashboard de mestre
- [x] 6.4 Forma de reabrir o resumo de handoff a partir do dashboard depois do carregamento inicial

## 7. Testes

- [x] 7.1 Teste do fluxo completo do wizard de criação de mundo (navegação, validação, disparo da geração)
- [x] 7.2 Teste do fechamento de rodada com jogadores pendentes
- [x] 7.3 Teste de renderização de narração e mudança de modo no painel de eventos
- [x] 7.4 Teste da confirmação de irreversibilidade ao assumir como mestre
