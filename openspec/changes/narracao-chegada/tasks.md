## 1. Tipos e mapeamento de wire

- [x] 1.1 Em `src/realtime/types.ts`, adicionar `NarracaoChegadaPayload` (`{ texto, personagemId, personagemNome }`), o tipo `'narracao_chegada'` em `EventoMesa`/`EventoMesaWire`, e o caso correspondente em `mapEventoFromWire`.
- [x] 1.2 Em `src/api/aiMaster.ts`, adicionar a função para disparar a geração da narração de chegada (endpoint REST a confirmar contra o contrato real do backend, mesmo padrão de `enviarResumoRodada`/`fecharRodada`).

## 2. Disparo na entrada da tela de rodada

- [x] 2.1 Em `CharacterSheetPage.tsx` (ou hook equivalente), ao carregar `eventos` de uma campanha com `mestre === 'ia'`, checar se já existe um evento `narracao_chegada` com `personagemId` igual ao da ficha atual.
- [x] 2.2 Se não existir, disparar a chamada de geração (tarefa 1.2) uma única vez por montagem da tela — sem repetir a chamada em re-renders.
- [x] 2.3 Enquanto o evento de chegada não chega, exibir um estado de carregamento no lugar de `RodadaPanel`/`ResumoRodadaPanel` (ver design.md, decisão "Estado de carregamento substitui o painel de resumo").
- [x] 2.4 Tratar falha na geração com uma mensagem de erro e opção de tentar novamente, seguindo o mesmo padrão visual dos demais erros de `RodadaPanel` (`erroEnvio`/`erroFechar`).

## 3. Renderização no painel de eventos

- [x] 3.1 Em `EventosMesaPanel.tsx`, adicionar o caso `narracao_chegada` em `descreverEvento`, identificando o nome do personagem que chegou e distinguindo visualmente de `narracao_ia`.
- [x] 3.2 Confirmar que o evento `narracao_chegada` (sem campo `rodada` no payload) não dispara o divisor de agrupamento por rodada introduzido em `rodada-resumo-chat`.

## 4. Testes

- [x] 4.1 Testes de `useCampaignEvents`/`CharacterSheetPage`: personagem sem narração de chegada → dispara a chamada e mostra carregamento; personagem já com narração de chegada nos eventos carregados → não dispara nova chamada, mostra `RodadaPanel` direto.
- [x] 4.2 Teste de `EventosMesaPanel`: evento `narracao_chegada` renderiza texto e nome do personagem corretamente, sem gerar divisor de rodada.
- [x] 4.3 Teste cobrindo múltiplos personagens: cada um recebe/consulta sua própria narração de chegada de forma independente.
- [x] 4.4 Rodar `tsc -b`, `npm run build` e `vitest run` completos; confirmar que nenhuma suíte existente quebrou. (`tsc -b` e `npm run build` limpos; `vitest run` completo: 270/270 — uma falha em `MasterDashboard.test.tsx`/"mostra o controle de pedir rolagem, listando os jogadores da campanha" apareceu numa rodada e não se repetiu ao isolar o arquivo nem ao rodar a suíte completa de novo: mesmo flake pré-existente já documentado em `fix-rodada-ia-wire-contract`, não relacionado a esta change.)

## 5. Sequenciamento

- [x] 5.1 Confirmar que `fix-rodada-ia-wire-contract` e `rodada-resumo-chat` estão concluídas e arquivadas (frontend e api) antes de iniciar a implementação desta change. (Nenhuma das duas estava arquivada e ambas tinham checkboxes formalmente pendentes nos dois repos no momento da implementação — todas ligadas a verificação manual ponta a ponta com o backend. O usuário confirmou explicitamente que essa verificação manual já foi feita; prossegui com a implementação por instrução direta dele, não por leitura literal do `tasks.md`.)
- [x] 5.2 Confirmar que a change irmã `narracao-chegada` em `dungeons-api` está implementada e o contrato real do endpoint bate com o assumido em `design.md`, ajustando tarefa 1.2 se divergir. (Confirmado em `dungeons-api/src`: `POST /:campanhaId/rodada/chegada` existe em `routes/campanhas.ts`, `narrarChegadaPersonagem`/`registrarNarracaoChegada` idempotentes por `personagem_id`, payload `{ texto, personagem_id, personagem_nome }` — bate exatamente com o assumido em `design.md`; nenhum ajuste necessário na tarefa 1.2.)
