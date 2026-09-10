## 1. Migrar envio de ações de rodada para REST

- [x] 1.1 Em `useCampaignEvents.ts`, substituir `socket.emit('rodada:resumo', ...)` por uma chamada `POST /campanhas/:id/rodada/resumo`, preservando a mesma assinatura de retorno (`Promise<void>`) que `RodadaPanel`/`ResumoRodadaPanel` já esperam
- [x] 1.2 Substituir `socket.emit('rodada:fechar', ...)` por `POST /campanhas/:id/rodada/fechar`, mesma preservação de assinatura
- [x] 1.3 Propagar falhas da chamada REST (rede ou resposta de erro) como rejeição da Promise, para acionar os estados de erro (`erroEnvio`/`erroFechar`) que a UI já implementa
- [ ] 1.4 Manter `socket.on('rodada:estado', ...)` como está — o payload já é consumido corretamente por `mapEstadoRodadaFromWire`; conferir que o formato bate com o documentado em `design.md` (decisão 3) assim que o backend estiver disponível para teste manual

## 2. Campo de ação do jogador em combate

- [x] 2.1 Adicionar a `CombateTurnoPanel` um formulário de texto livre, visível apenas quando `meuTurno` é `true`
- [x] 2.2 Ligar o envio desse formulário à mesma função `enviarResumoRodada` (mesmo endpoint REST de `rodada/resumo`) já usada em modo exploração — sem criar um segundo caminho de envio
- [x] 2.3 Exibir estado de carregamento e erro equivalentes aos já existentes em `ResumoRodadaPanel` (reaproveitar o mesmo padrão visual/aria, não duplicar lógica)

## 3. Testes

- [x] 3.1 Atualizar `RodadaPanel.test.tsx`: cobrir o novo campo de ação em `CombateTurnoPanel` (aparece só no próprio turno, envia, mostra erro em falha)
- [x] 3.2 Atualizar `useCampaignEvents.test.ts`: trocar as asserções de `socket.emit('rodada:resumo'|'rodada:fechar', ...)` por asserções de chamada REST (mock do cliente HTTP), mantendo a cobertura existente do listener `rodada:estado`
- [x] 3.3 Rodar `tsc -b`, `npm run build` e `vitest run` completos; confirmar que nenhuma suíte existente quebrou (`tsc -b` e `npm run build` limpos; `vitest run` completo: 236/238 — as 2 falhas são o flake pré-existente já documentado em `MasterDashboard.test.tsx`/"pede rolagem a um jogador específico selecionado", que passa isolado; não relacionado a esta change)

## 4. Verificação ponta a ponta com o backend

- [ ] 4.1 Depois que a change irmã `fix-rodada-ia-wire-contract` em `dungeons-api` implementar a emissão de `rodada:estado` (ver design.md), validar manualmente com duas contas em uma campanha mestrada por IA: o painel de rodada aparece para ambas, o resumo de uma aparece como "respondido" para a outra em tempo real, fechar a rodada dispara a narração no painel de eventos, e o turno de combate permite agir e avança corretamente
