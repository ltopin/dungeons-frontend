## Context

Ver proposal.md - Why. Duas famílias de hook cobrem a persistência do assistente, e ambas têm gravação debounced (1s) que pode ficar pendente no momento do clique em confirmar:

- `useSectionAutosave` (seções 1:1: `geral`, `moedas`, `magias-config`) — usado por `RacaClasseStep`, `AtributosStep`, `EquipamentoStep` (moedas), `MagiasStep` (config). Hoje só expõe `retry`, pensado para reenviar depois de um erro, não para forçar o envio de uma edição recente antes de navegar.
- `useListSection` (seções de lista: `pericias`, `talentos`, `magias`, `itens`) — usado por `PericiasStep`, `TalentosStep`, `MagiasStep` (lista) e `EquipamentoStep` (itens). Criação/remoção já são imediatas; só a edição de campo por linha (ex.: graduação de perícia) é debounced.

O botão de confirmação de cada etapa (`onConcluir`) hoje só troca o passo (`marcarConcluido`), sem relação nenhuma com o estado de salvamento.

## Goals / Non-Goals

**Goals:**
- Garantir que, ao clicar em confirmar, qualquer edição pendente da etapa atual seja enviada e confirmada pela API antes de trocar de passo.
- Dar feedback visual claro quando o botão está desabilitado (falta preencher algo) e quando uma confirmação está em andamento.
- Comportamento uniforme nas 6 etapas com botão de confirmação.

**Non-Goals:**
- Não muda a lógica de validação de "pode concluir" de cada etapa (regras de raça/classe/pontos/pré-requisitos continuam como estão).
- Não introduz um mecanismo novo de fila/transação entre seções diferentes — cada etapa só precisa garantir a própria seção antes de avançar.
- Não resolve o pendente 6.4 do `pathfinder-character-builder` (teste de retomada entre sessões) — este change cobre só o clique de confirmação.

## Decisions

### 1. `flush()` em `useSectionAutosave`, `flushAll()` em `useListSection`

Ambos os hooks ganham um método que:
- Cancela o timer de debounce pendente, se houver.
- Se não há patch pendente (`pendingRef.current` vazio / nenhum timer em `useListSection`), resolve imediatamente sem chamar a API — o clique em confirmar não deve gerar uma requisição void quando nada mudou desde o último autosave.
- Se há patch pendente, chama a mesma função `save`/atualização de linha já usada pelo debounce, e retorna a Promise dela (sucesso ou rejeição), em vez de duplicar a lógica de request.

Alternativa considerada: expandir `retry` para servir os dois propósitos (reenvio de erro e flush de confirmação). Rejeitada porque os dois têm gatilhos e semânticas diferentes (erro do usuário vs. saída normal da etapa) e misturar aumentaria a chance de um retry de erro disparar durante uma navegação, ou vice-versa.

### 2. `onConcluir` vira assíncrono, orquestrado pelo `CharacterWizardPage`

Cada etapa expõe um `confirmar()` que:
1. Chama `flush()`/`flushAll()` de todas as seções que ela gerencia (ex.: `EquipamentoStep` chama o flush de `moedas` — `itens` não tem edição de campo debounced hoje, só criação/remoção imediatas, então não precisa flush).
2. Se todas resolverem, chama `onConcluir()` (que continua fazendo só `marcarConcluido`).
3. Se alguma rejeitar, não avança; a etapa mantém o status de erro já exibido pelo `SaveStatusBadge` (`useSectionAutosave`) ou pelo indicador por linha (`useListSection`).

O botão de cada etapa mantém um estado local `confirmando` (`useState`) para desabilitar e mostrar "Salvando…" enquanto a Promise de `confirmar()` está pendente.

Alternativa considerada: mover a orquestração para `CharacterWizardPage`, chamando um `ref` imperativo por etapa. Rejeitada — cada etapa já é a dona das seções que gerencia; expor um `confirmar()` local mantém o mesmo padrão de props (`onConcluir`) e evita uma API de ref só para isso.

### 3. Estado visual de desabilitado escopado ao `.wizard-step-actions`

Nova regra `.ficha-sheet .wizard-step-actions button:disabled { opacity: 0.4; cursor: not-allowed; }`, no mesmo padrão já usado por `.wizard-seal-botoes button:disabled` e `.wizard-skill-controles button:disabled`.

Alternativa considerada: `.add-btn:disabled` global. Rejeitada para não mudar a aparência dos botões "+ adicionar linha" já existentes nas abas da ficha manual (`AtaquesTab`, `PericiasTab`, etc.), que não fazem parte do escopo deste bug e não foram auditados quanto a esse efeito colateral.

## Risks / Trade-offs

- [Confirmar passa a esperar uma resposta de rede em vez de trocar de passo instantaneamente] → Mitigado pelo "resolve imediato sem request quando não há pendência" da decisão 1: no caminho comum (jogador parou de digitar/clicar por >1s antes de confirmar, ou não editou nada na etapa), o autosave já rodou e `flush()` não gera round-trip extra.
- [Falha de rede no flush deixa o jogador "preso" na etapa sem entender por quê] → Mitigado por reaproveitar os indicadores de erro já existentes (`SaveStatusBadge` com `retry`, e o status por linha do `useListSection`) em vez de inventar um novo canal de erro; o botão de confirmar volta a ficar clicável para tentar de novo.
- [Duplo clique durante o flush dispara duas confirmações] → Mitigado pelo estado `confirmando` desabilitando o botão enquanto a Promise está pendente.
