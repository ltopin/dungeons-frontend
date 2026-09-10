## Context

Ver proposal.md - Why. Três lacunas independentes na ficha existente: Iniciativa (falta o total), Idiomas (falta o campo inteiro), Habilidades especiais de raça/classe (o modelo e a UI já existem — `FichaTalento.categoria === 'qualidade_especial'`, aba "Qualidades Especiais" — mas o assistente nunca grava nada lá).

`FichaCombate` e `FichaGeral` têm um conjunto fixo de colunas no `dungeons-api` (seções 1:1); adicionar `iniciativaTotal` e `idiomas` exige colunas novas lá, fora deste repositório (tratado como specs-only aqui, mesma relação de dependência cruzada de `pathfinder-character-builder`).

## Goals / Non-Goals

**Goals:**
- Iniciativa total visível e recalculada ao vivo, seguindo exatamente o mesmo padrão dos demais totais de Combate (CA, CMB, CMD): calculado no frontend, enviado no payload de autosave da seção, persistido pelo backend.
- Campo de Idiomas como texto livre dentro da seção Geral já existente — sem criar seção/tabela nova.
- Qualidades especiais de raça/classe gravadas automaticamente ao confirmar Raça e Classe, reaproveitando o mesmo endpoint de lista (`ficha_talentos`) que `TalentosStep.tsx` já usa — nenhuma mudança de schema necessária para essa parte.

**Non-Goals:**
- Distinguir na UI/modelo se uma qualidade especial veio da raça ou da classe (não há campo de origem; o nome/descrição do compêndio já deixa isso implícito na prática).
- Ressincronizar (remover/atualizar) qualidades especiais automaticamente quando o jogador troca de raça/classe depois de já ter confirmado a etapa — comportamento aditivo apenas, para nunca apagar uma edição manual do jogador na aba de Talentos.
- Modelar idiomas como lista estruturada com fonte (racial, bônus de Inteligência, etc.) — texto livre é suficiente para o pedido original e não exige uma seção nova.
- Implementar as colunas novas (`iniciativa_total`, `idiomas`) no `dungeons-api` — este repositório só descreve o contrato esperado; a implementação do backend é uma mudança irmã nesse outro repositório.

## Decisions

**Iniciativa como campo derivado persistido, não só calculado na tela.** Segue o precedente do próprio `CombateTab.tsx`/`CombateReadOnly.tsx`: mesmo campos triviais de recalcular a partir de dados já carregados (ex: `caToque`, `caSurpreendido`) são persistidos no payload de autosave e a visualização do mestre lê o valor persistido em vez de recalcular localmente. Manter esse padrão para Iniciativa evita uma inconsistência onde só um campo derivado do Combate seria "calculado na hora" enquanto os outros são persistidos.

**Idiomas como campo de texto livre em Geral, não uma seção nova.** Uma seção 1:1 nova (como Notas) exigiria uma tabela nova no backend; um campo a mais em `ficha_geral` (que já existe) é a menor mudança de schema possível. Alternativa considerada: lista estruturada de idiomas com fonte — rejeitada por exigir uma tabela de lista nova só para um dado que, na prática, é preenchido uma vez e raramente editado.

**Qualidades especiais gravadas de forma aditiva, sem re-sincronizar.** Alternativa considerada: ao trocar de raça/classe, remover as qualidades especiais da escolha anterior e gravar as da nova. Rejeitada porque não há como distinguir de forma confiável uma linha auto-gravada pelo assistente de uma linha que o jogador editou manualmente depois (mesmo nome, sem campo de origem) — remover automaticamente arriscaria apagar uma edição do jogador. A dedução por nome duplicado evita re-gravar a mesma linha em confirmações repetidas sem tentar decidir o que remover.

## Risks / Trade-offs

- [Comportamento aditivo de qualidades especiais pode deixar traços "órfãos" da raça/classe antiga se o jogador trocar de ideia no meio da criação] → Aceitável para esta leva: o jogador ainda pode remover manualmente a linha errada na aba Talentos (CRUD já existe); documentado como Non-Goal.
- [Dependência do `dungeons-api` para persistir `iniciativaTotal` e `idiomas`] → Mesma relação de dependência cruzada já usada em `pathfinder-character-builder`; a mudança irmã no outro repositório deve ser proposta antes (ou em paralelo) da implementação deste lado.
- [Detecção de duplicata por nome exato pode falhar se o compêndio tiver dois traços com nomes iguais entre raça e classe, ou se o jogador renomear uma linha manualmente] → Risco baixo e sem efeito destrutivo (na pior hipótese, uma linha deixa de ser re-gravada ou é gravada uma vez a mais); não vale a complexidade de um identificador de origem para esta leva.
