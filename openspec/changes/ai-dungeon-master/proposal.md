## Why

O `dungeons-api` ganha (change irmã `ai-dungeon-master`) a capacidade de conduzir uma campanha inteira sem mestre humano: gera o mundo a partir de um contexto informado pelo criador e narra a sessão ao vivo. O frontend precisa da UI para disparar essa geração, jogar as rodadas conduzidas pela IA e permitir que o criador assuma como mestre humano quando quiser.

## What Changes

- Novo fluxo de criação de campanha "gerar com IA": um wizard passo a passo coleta o contexto do mundo (gênero/tom, nível de poder inicial, restrições de conteúdo, tamanho do grupo, e opcionalmente inspirações/idioma/nome), reaproveitando o mesmo padrão visual e de navegação já usado no `character-creation-wizard` (barra lateral com estado de cada etapa, navegação livre entre etapas, gravação de progresso por etapa, feedback visual de botão desabilitado/carregando).
- Tela de acompanhamento enquanto o mundo é gerado (a geração é assíncrona no backend).
- Ao concluir a geração, tela de escolha de papel: entrar como jogador, ou assumir como mestre imediatamente.
- UI da sessão ao vivo em modo exploração: campo de resumo de rodada por jogador, indicador de quem já escreveu, e um botão (visível a qualquer membro) para fechar a rodada e disparar a narração da IA.
- A narração da IA e as mudanças de modo (exploração/combate) passam a aparecer no painel de eventos de mesa já existente, junto com rolagens e pedidos de rolagem, distinguindo visualmente eventos de origem IA.
- UI de modo combate: indicação de ordem de iniciativa e de turno corrente, com controles de ação habilitados apenas para o jogador na vez.
- Ação "assumir como mestre", disponível a qualquer momento para quem criou a campanha, com confirmação explícita de que é irreversível, seguida da exibição do resumo de handoff gerado pela IA antes de cair no dashboard de mestre já existente.
- Esta change cobre apenas o frontend. O contrato de API, a geração do mundo e a condução da sessão são responsabilidade da change irmã `ai-dungeon-master` no `dungeons-api`.

## Capabilities

### New Capabilities
- `ai-world-generation`: wizard de criação de mundo por IA (reaproveitando o layout do `character-creation-wizard`), tela de acompanhamento da geração, e escolha de papel do criador ao final.
- `ai-session-narration`: UI da sessão ao vivo conduzida por IA — resumo de rodada por jogador, fechamento de rodada, narração exibida no painel de eventos, e UI de turnos durante o modo combate.
- `ai-master-handoff`: ação de assumir como mestre humano a qualquer momento, com confirmação irreversível e exibição do resumo de handoff, antes de entrar no dashboard de mestre já existente.

### Modified Capabilities
- `campaigns`: a tela de criação de campanha ganha uma opção de gerar via IA, que leva ao wizard de `ai-world-generation` em vez do fluxo atual (que sempre navega direto para o dashboard de mestre).
- `campaign-realtime-events`: o painel de eventos de mesa passa a exibir narração da IA e mudança de modo exploração/combate, além de rolagens e pedidos de rolagem, distinguindo a origem (IA ou humana) de cada evento.

## Impact

- Novo wizard reaproveitando os componentes já existentes de `src/wizard/` (barra lateral, padrão de etapas, validação e confirmação por etapa) para um fluxo diferente (criação de mundo, não de personagem).
- Painel de eventos de mesa (`campaign-realtime-events`) precisa reconhecer novos tipos de evento vindos do backend (narração, mudança de modo) e uma origem não-humana.
- Tela de campanha ganha um novo estado possível (aguardando geração de mundo) e uma nova ação (assumir como mestre), além dos estados já existentes (dashboard de mestre, ficha de jogador).
