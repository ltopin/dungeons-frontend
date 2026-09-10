## Context

Ver proposal.md - Why. O backend (change irmã `ai-dungeon-master` no `dungeons-api`) expõe: disparo da geração de mundo a partir de um contexto estruturado, consulta de status da geração, entrada como jogador ou assunção como mestre, registro/fechamento de rodada em modo exploração, e o canal de eventos já existente (`campaign-realtime-events`) carregando os novos tipos de evento (narração, mudança de modo) e uma origem IA.

O frontend já tem um wizard multi-etapas totalmente funcional em `src/wizard/` (`CharacterWizardPage.tsx`, `WizardSidebar.tsx`, `steps/*`, `wizardSteps.ts`, `wizardValidation.ts`) usado na criação de personagem, com o padrão de barra lateral + navegação livre + gravação por etapa + feedback visual de botão já resolvido e testado (`wizard-confirm-save-and-advance`). Este design reaproveita esse padrão em vez de desenhar um novo.

## Goals / Non-Goals

**Goals:**
- Definir como o wizard de criação de mundo reaproveita a estrutura de `src/wizard/` sem duplicar o padrão de navegação/validação já resolvido para personagens.
- Definir onde a UI de rodada (resumo, fechamento, narração) e a UI de combate se encaixam nas telas de campanha já existentes.
- Garantir que a nova UI seja fiel ao tema visual já estabelecido no restante do frontend.

**Non-Goals:**
- Qualquer lógica de geração, narração ou regras de combate — tudo isso é decidido pelo backend; o frontend só exibe e envia ações.
- Redesenho do dashboard de mestre ou da tela de ficha já existentes além do necessário para acomodar os novos estados (aguardando geração, resumo de handoff).

## Decisions

### Reaproveitar `src/wizard/` como base estrutural, não criar um wizard paralelo

O wizard de criação de mundo usa o mesmo padrão de `WizardSidebar` (barra lateral com estado por etapa) e o mesmo formato de step components + `wizardValidation.ts` (bloqueio de avanço até a etapa estar completa, gravação forçada ao confirmar) já usado em `CharacterWizardPage.tsx`. As etapas em si são novas (contexto de mundo, não de personagem), mas a estrutura de navegação, o componente de barra lateral e o padrão de confirmação/loading do botão são reaproveitados como estão, não reimplementados.

**Alternativa considerada:** construir uma tela de formulário única (sem wizard) para o contexto de mundo, já que são poucos campos. Descartada porque o usuário pediu explicitamente fidelidade ao mesmo layout de wizard já usado no restante do produto — introduzir um segundo padrão de formulário multi-campo quebraria a consistência visual que o `character-creation-wizard` já estabeleceu.

### Fidelidade visual via skill `impeccable`

A implementação das novas telas (wizard de mundo, tela de acompanhamento de geração, escolha de papel, painel de rodada/narração, UI de combate, confirmação de handoff) SHALL usar a skill `impeccable` já disponível no repo (`.claude/skills/impeccable/`) durante a construção, para garantir aderência ao tema visual (cores, tipografia, espaçamento, componentes) já estabelecido no restante do `dungeons-frontend`, em vez de introduzir estilos ad-hoc.

### UI de rodada/narração vive no painel de eventos já existente

Em vez de criar uma tela nova e separada para a narração, o campo de resumo de rodada, o indicador de quem já respondeu e o botão de fechar rodada ficam na mesma tela onde hoje já mora o painel de eventos de mesa (`campaign-realtime-events`, hoje presente no dashboard do mestre e na tela de ficha do jogador). A narração e as mudanças de modo aparecem como itens desse mesmo painel cronológico, só que com uma marcação visual de origem IA.

**Alternativa considerada:** tela dedicada só para a sessão ao vivo, separada da ficha/dashboard. Descartada porque fragmentaria a atenção do jogador entre duas telas durante o jogo (ficha + sessão), quando o painel de eventos já é o lugar natural onde ele acompanha o que acontece na mesa.

### Estado "aguardando geração" como uma tela própria, não um modal

Como a geração pode levar bastante tempo (mundo completo + lore), a tela de acompanhamento é uma rota própria (não um modal bloqueante), permitindo que o usuário volte para a lista de campanhas e retorne mais tarde sem perder o progresso da geração em andamento no backend.

## Risks / Trade-offs

- [Reaproveitar `WizardSidebar`/`wizardValidation.ts` genéricos o suficiente para um contexto de mundo, não só de personagem] → Se algum acoplamento a conceitos de ficha aparecer nesses módulos, extrair a parte genérica antes de reaproveitar, em vez de duplicar o componente.
- [Painel de eventos ganha dois tipos novos de evento (narração, mudança de modo) que têm formato de conteúdo bem diferente de uma rolagem] → Cada tipo de evento já teria uma renderização própria dentro do painel; narração e mudança de modo só adicionam mais um caso a esse mesmo padrão.
- [Tela de resumo de handoff precisa continuar acessível depois do primeiro carregamento, não é só um toast que some] → Tratada como conteúdo persistido, reaberto a partir do dashboard, não como notificação efêmera.
