## Context

Ver `proposal.md` para a motivação e o change irmão `add-ficha-reset` do `dungeons-api` para o contrato do endpoint (`POST /fichas/:fichaId/reset`, retorna a ficha completa já resetada, autorização restrita ao jogador dono). `GeralTab` hoje só recebe `fichaId`/`geral`/`onChange`/`onSaved` — não tem acesso ao `id` da campanha nem a `navigate`, que vivem em `CharacterSheetPage` (`src/routes/CharacterSheetPage.tsx`). A detecção de "ficha ainda não iniciada" já existe em `fichaAindaNaoIniciada` (`src/wizard/wizardSteps.ts`) e não precisa de nenhuma mudança — o reset no backend já deixa `geral.nomePersonagem/classe/raca` vazios, então a rota `/campanhas/:id/ficha/criar` volta a se comportar como na primeira visita.

## Goals / Non-Goals

**Goals:**
- Reaproveitar ao máximo os padrões já existentes na ficha (badge de status, `apiRequest`) em vez de introduzir um padrão novo de modal/confirmação.
- Deixar claro no modal que a ação é irreversível, sem exigir digitação de confirmação (decisão do usuário: modal simples).

**Non-Goals:**
- Qualquer forma de desfazer o reset — não há undo, consistente com a decisão do backend de deletar em vez de apenas branquear.
- Botão de reset na visão do mestre — o mestre já está em modo somente leitura (requisito existente) e não ganha nenhum controle novo.

## Decisions

### 1. `CharacterSheetPage` orquestra a chamada e a navegação; `GeralTab` só exibe o botão e o modal
`GeralTab` ganha um novo prop `onReset: () => Promise<void>` (ou similar) chamado quando o jogador confirma no modal; a lógica de chamar `resetarFicha(fichaId)` e, em caso de sucesso, `navigate(`/campanhas/${id}/ficha/criar`)` fica em `CharacterSheetPage`, que já tem `id` (campanha) e é quem decide navegação hoje (ver `redirecionarParaTrilha`). Alternativa considerada: `GeralTab` importar `useNavigate` e o `id` da campanha diretamente. Rejeitada porque acopla uma aba de seção (que hoje só conhece `fichaId`) à rota da campanha, quebrando o padrão em que cada `*Tab` é dono só da sua seção da ficha.

### 2. Modal de confirmação simples, sem digitação de texto
Um modal com duas ações (Cancelar / Confirmar reset), texto explicando a irreversibilidade. Decisão do usuário: nada de "digite o nome do personagem para confirmar" — a barreira de um clique extra com aviso explícito é suficiente aqui.

### 3. Nova função `resetarFicha` em `src/api/sheets.ts`
Segue o mesmo padrão das funções existentes ali (`apiRequest`, mapeamento de resposta via `mapObjectToFrontend`/reconstrução de `Ficha` igual a `obterFicha`), chamando `POST /fichas/:fichaId/reset` e devolvendo a `Ficha` completa já resetada — mesmo shape de retorno de `obterFicha`.

## Risks / Trade-offs

- [Este change fica bloqueado até o endpoint existir de fato no `dungeons-api`] → aceito; a implementação da API é de responsabilidade de outro agente, e este change só pode ser aplicado (`tasks.md`) depois que o endpoint estiver disponível para teste manual/integração.
- [Se o jogador confirmar o reset e a navegação para a trilha falhar por algum motivo depois da chamada ter sucesso, a ficha já estará resetada mas o usuário não terá saído da tela] → mitigado porque a própria `CharacterSheetPage` já teria a `ficha` local atualizada com os dados zerados (mesmo padrão de `atualizarSecao`), então mesmo sem navegar a tela deixaria de mostrar dados antigos.
