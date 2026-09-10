## Why

Hoje, uma vez que o jogador termina a trilha de criação (ou preenche a ficha manualmente), não existe nenhuma forma de descartar o personagem e recomeçar do zero — a única saída é editar campo por campo manualmente. O change irmão `add-ficha-reset` no `dungeons-api` está adicionando um endpoint atômico `POST /fichas/:fichaId/reset` para isso; este change consome esse contrato e expõe a ação na UI.

## What Changes

- Novo botão "Reiniciar ficha" na aba Geral (`GeralTab`), visível apenas para o jogador dono da ficha (o mestre só visualiza a ficha em modo leitura — ver requisito existente de visualização somente leitura — então nunca vê esse botão).
- Ao clicar, abre um modal de confirmação simples explicando que a ação apaga todos os dados da ficha e não pode ser desfeita.
- Ao confirmar: chama o novo endpoint de reset da API e, em caso de sucesso, redireciona para a trilha de criação de personagem (`/campanhas/:id/ficha/criar`), reaproveitando a mesma rota que hoje só é alcançada automaticamente quando a ficha nasce vazia.
- Em caso de falha na chamada de reset, o modal permanece aberto (ou reabre) com uma mensagem de erro, e a ficha não é considerada resetada — nenhuma navegação ocorre.
- **Sem novo campo de "ficha resetada"** — a UI continua usando a mesma heurística já existente (`fichaAindaNaoIniciada`) para decidir que a ficha está vazia quando o jogador chegar à trilha, já que o reset no backend deixa `geral` exatamente nesse estado.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `character-sheets`: ganha o requisito do botão de reiniciar ficha, com confirmação, disponível apenas para o jogador dono.

## Impact

- `src/sheet/tabs/GeralTab.tsx` — novo botão + modal de confirmação.
- `src/routes/CharacterSheetPage.tsx` — orquestra a chamada de reset e a navegação para `/campanhas/:id/ficha/criar` em caso de sucesso (é quem já tem o `id` da campanha e o `navigate`/`Link` disponíveis).
- `src/api/sheets.ts` — nova função `resetarFicha(fichaId)` chamando `POST /fichas/:fichaId/reset`.
- Depende do contrato definido no change irmão `add-ficha-reset` do `dungeons-api` (endpoint ainda não implementado até este momento — a implementação lá é responsabilidade de outro agente).
