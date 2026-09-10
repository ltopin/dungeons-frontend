## Context

Ver proposal.md - Why. Hoje `useCampaignEvents` já recebe `rodada:estado` em tempo real (broadcast a cada envio de resumo) e já recebe `evento:novo`/`evento:historico` para o painel de eventos de mesa. Os dois canais já existem — esta change só muda o que trafega neles e como o `RodadaPanel`/`EventosMesaPanel` renderizam, não a infraestrutura de transporte. O backend (change irmã de mesmo nome em `dungeons-api`) é quem decide quando persistir os novos eventos; o frontend só consome.

## Goals / Non-Goals

**Goals:**
- Mostrar o texto do resumo/ação de cada jogador em tempo real, não só um indicador booleano.
- Depois que a rodada fecha, manter esse texto acessível no histórico permanente do painel de eventos, com fronteira visual clara entre rodadas.
- Reaproveitar o padrão já estabelecido de "cada tipo de evento tem sua própria renderização dentro do painel" (ver `ai-dungeon-master/design.md`), em vez de criar um componente de chat separado.

**Non-Goals:**
- Edição com histórico de versões ("editado às...") — reenviar o resumo simplesmente substitui o texto exibido, sem rastro da versão anterior.
- Chat livre fora do ciclo de rodada/turno (mensagens a qualquer momento, sem ligação com resumo/ação) — fora de escopo desta change.
- Mudar o transporte REST do envio (`enviarResumoRodada`/`fecharRodada` continuam REST, ver `fix-rodada-ia-wire-contract`).

## Decisions

### Fase "aberta" (ephemeral, via `rodada:estado`) + fase "fechada" (permanente, via evento de mesa)

Enquanto a rodada de exploração está aberta, o texto de cada resumo viaja pelo `rodada:estado` que já existe — cada envio novo simplesmente substitui o campo `resumoTexto` daquele participante no estado local. Nenhum evento de histórico é criado nessa fase. Só quando a rodada fecha (`fecharRodada`) é que o backend persiste um evento `resumo_rodada` por jogador que respondeu, que entra no feed permanente do `EventosMesaPanel` ao lado da narração da IA daquela rodada.

**Por quê:** evita duplicar entradas no histórico a cada "Atualizar resumo" (o jogador pode reescrever várias vezes antes de fechar) e casa com o dado que o `fix-rodada-ia-wire-contract` já fixou: `rodada:estado` é estado corrente, não log. Em combate não existe essa fase "aberta" — cada ação já é resolvida na hora pela IA — então lá a ação vira evento permanente imediatamente, sem fase intermediária.

**Alternativa considerada:** emitir um evento de histórico a cada envio de resumo, mesmo antes de fechar a rodada. Descartada porque geraria um evento por edição (o jogador reescrevendo o resumo três vezes viraria três entradas no histórico), poluindo o feed sem necessidade — o combinado com o usuário foi "reenvio substitui silenciosamente".

### Novos tipos de evento seguem o padrão existente em `types.ts`/`EventosMesaPanel`

`resumo_rodada` e `acao_turno` são dois novos casos de `EventoMesa`/`mapEventoFromWire`, com payload `{ texto, rodada, autorNomePersonagem }` (mesmo formato de `NarracaoIaPayload`, já existente), e dois novos casos em `descreverEvento` no `EventosMesaPanel`. Não é um componente de chat novo — é mais um tipo de card no mesmo feed cronológico, igual `narracao_ia`/`mudanca_modo` já são.

### Agrupamento visual por rodada no `EventosMesaPanel`

O painel já recebe `evento.origem`/`criadoEm`; cada evento com payload que carregue `rodada` (rolagem/pedido não carregam — ficam "soltos" entre os divisores) permite inserir um divisor "Rodada N" sempre que o número de rodada mudar entre um item e o próximo da lista ordenada. Não é preciso um campo novo de "fim de rodada" — a própria mudança de `rodada` no payload já marca a fronteira.

**Alternativa considerada:** pedir ao backend um evento explícito de "fim de rodada". Descartada por redundância — a narração de cada rodada já carrega `rodada`, e junto com `resumo_rodada`/`acao_turno` isso já basta para agrupar.

## Risks / Trade-offs

- [Resumo permanece privado enquanto a rodada está aberta se o socket cair e reconectar sem `rodada:estado` mais recente] → `reconectar()` já força reentrada na sala (`sala:entrar`), que já reenvia o estado corrente; nenhuma mudança necessária aqui.
- [Depende do payload novo do `dungeons-api` — sem ele, `resumoTexto`/eventos novos simplesmente não chegam] → `mapEventoFromWire`/`mapEstadoRodadaFromWire` devem tratar os campos novos como opcionais (fallback para o comportamento atual) até o backend estar no ar, evitando quebrar a UI se as duas changes forem deployadas fora de ordem.
- [Conflito de arquivo com `fix-rodada-ia-wire-contract`, ainda em andamento nos dois repos] → esta change só deve ser aplicada depois que aquela for concluída/arquivada (ver proposal.md - Impact).
