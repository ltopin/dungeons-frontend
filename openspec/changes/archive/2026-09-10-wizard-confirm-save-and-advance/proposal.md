## Why

Na trilha de criação de personagem (`pathfinder-character-builder`), o botão "Confirmar" de cada etapa fica desabilitado sem nenhum retorno visual quando falta algum campo obrigatório (ex.: nome do personagem vazio na etapa Raça e Classe) — o botão usa a classe `.add-btn`, que não tem regra `:disabled`, então ele continua com a mesma cor dourada e cursor de clique de um botão habilitado. O jogador clica, nada visível acontece, e a etapa não avança, dando a impressão de que o assistente travou. Além disso, o clique em "Confirmar" não garante que a escolha da etapa (ex.: raça/classe) já foi persistida antes de navegar — a gravação depende do autosave debounced (1s) disparado quando o campo foi alterado, então um clique rápido logo após escolher pode navegar com o patch ainda pendente.

## What Changes

- O botão de confirmação de cada etapa do assistente (`.add-btn` usado como CTA de avanço) ganha um estado visual de desabilitado (opacidade reduzida, cursor `not-allowed`), consistente com os outros controles do assistente (`.wizard-seal-botoes button:disabled`, `.wizard-skill-controles button:disabled`).
- Ao clicar em "Confirmar" numa etapa, o sistema força o envio imediato de qualquer alteração pendente daquela etapa (sem esperar o debounce) e só avança para a próxima etapa depois que esse salvamento é confirmado.
- Enquanto o salvamento do clique está em andamento, o botão exibe um estado de carregamento e fica desabilitado para evitar duplo clique.
- Esse comportamento é o mesmo em todas as etapas com botão de confirmação (Raça e Classe, Atributos, Perícias, Talentos, Magias, Equipamento).

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `character-creation-wizard`: a etapa SHALL sinalizar visualmente quando o botão de confirmação está desabilitado, e SHALL garantir que a gravação da etapa foi confirmada pela API antes de avançar para a próxima etapa ao clicar em confirmar.

## Impact

- `src/wizard/steps/RacaClasseStep.tsx`, `AtributosStep.tsx`, `PericiasStep.tsx`, `TalentosStep.tsx`, `MagiasStep.tsx`, `EquipamentoStep.tsx` — botão de confirmação de cada etapa.
- `src/wizard/CharacterWizardPage.tsx` — callbacks `onConcluir` passados a cada etapa.
- `src/sheet/useSectionAutosave.ts` — precisa expor uma forma de forçar o flush do save pendente e reportar quando ele termina (hoje só expõe `retry`, pensado para reenviar após erro).
- `src/styles.css` — regra `:disabled` para `.add-btn`.
