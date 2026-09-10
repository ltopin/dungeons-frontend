## 1. Tipos e mapeamento de wire

- [x] 1.1 Em `src/realtime/rodada.ts`, adicionar `resumoTexto: string | null` a `ParticipanteRodada` e mapear `resumo_texto` (opcional/`null` por padrão) em `mapEstadoRodadaFromWire`.
- [x] 1.2 Em `src/realtime/types.ts`, adicionar `ResumoRodadaPayload` e `AcaoTurnoPayload` (`{ texto, rodada, autorNomePersonagem }`), os tipos `'resumo_rodada'`/`'acao_turno'` em `EventoMesa`/`EventoMesaWire`, e os casos correspondentes em `mapEventoFromWire`.

## 2. Painel de rodada (fase aberta)

- [x] 2.1 Em `RodadaPanel.tsx` (`ResumoRodadaPanel`), trocar a linha de cada participante (`✓`/`— aguardando`) para exibir `p.resumoTexto` quando presente, mantendo o fallback atual quando `resumoTexto` for `null`.
- [x] 2.2 Atualizar `RodadaPanel.test.tsx` cobrindo: texto aparece ao vivo para outro jogador; reenvio substitui o texto exibido sem marca de "editado".

## 3. Painel de eventos (fase fechada / histórico)

- [x] 3.1 Em `EventosMesaPanel.tsx`, adicionar os casos `resumo_rodada` e `acao_turno` em `descreverEvento` (título com o nome do autor, detalhe com o texto).
- [x] 3.2 Adicionar agrupamento visual por rodada: ao renderizar a lista de eventos, inserir um divisor "Rodada N" sempre que o campo `rodada` do payload mudar em relação ao evento anterior (eventos sem `rodada` no payload — rolagem/pedido — não disparam novo divisor).
- [x] 3.3 Atualizar `EventosMesaPanel.test.tsx` cobrindo: evento `resumo_rodada` e `acao_turno` renderizam texto e autor corretos; divisor de rodada aparece na transição entre rodadas.

## 4. Integração end-to-end

- [x] 4.1 Atualizar `useCampaignEvents.test.ts` garantindo que `rodada:estado` com `resumo_texto` popula `resumoTexto`, e que `evento:novo`/`evento:historico` com `tipo: 'resumo_rodada'`/`'acao_turno'` aparecem em `eventos`.
- [x] 4.2 Rodar `npm test` e `npm run lint` (ou equivalentes do projeto) e confirmar que a suíte passa.

## 5. Sequenciamento

- [x] 5.1 Confirmar que `fix-rodada-ia-wire-contract` está concluída e arquivada (frontend e api) antes de iniciar a implementação desta change — ambas mexem em `rodadaEstado`/`sessaoIA`/`useCampaignEvents`/`RodadaPanel`. (Decisão do usuário: prosseguir apesar de a change ainda não estar arquivada — código frontend já completo, faltam só verificações manuais e2e dependentes do backend.)
