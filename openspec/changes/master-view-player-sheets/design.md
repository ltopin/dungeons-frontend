## Context

Ver proposal.md - Why. Hoje `MasterDashboard` (src/routes/MasterDashboard.tsx) renderiza `FichaResumo[]` como `<ul>` de texto. `CharacterSheetPage` (src/routes/CharacterSheetPage.tsx) só sabe abrir a ficha do usuário logado, derivando `fichaId` de `campanha.fichaId` (presente apenas quando `role === 'jogador'`). Os componentes de seção (`GeralTab`, `CombateTab`, `TalentosTab`, `AtaquesTab`, `PericiasTab`, `MagiasTab`, `InventarioTab`, `NotasTab`) são todos editáveis por padrão, usando `useSectionAutosave`/`useListSection` internamente.

## Goals / Non-Goals

**Goals:**
- Mestre navega, por aba, entre todas as fichas da sua campanha.
- Cada ficha aberta é visualizável por completo (todas as 8 seções), em modo somente leitura.
- A rota de cada ficha é endereçável (`/campanhas/:id/fichas/:fichaId`), permitindo compartilhar/voltar a um link direto.

**Non-Goals:**
- Edição pelo mestre (fica para um change futuro, se necessário).
- Atualização em tempo real dos dados enquanto o mestre observa (fora de escopo do MVP, conforme decisão já registrada para o projeto).
- Comparação lado a lado de múltiplas fichas simultâneas.

## Decisions

### Componente de leitura separado dos tabs editáveis
Em vez de dar um prop `readOnly` a `GeralTab`/`CombateTab`/etc. (que exigiria desviar `useSectionAutosave`/`useListSection` internamente em 8 componentes), a visualização do mestre usa um conjunto de componentes de leitura dedicados, que recebem a `Ficha` já carregada e apenas renderizam — nunca importam os hooks de autosave.

**Alternativa considerada**: threading de `readOnly` pelos componentes existentes. Rejeitada por acoplar os dois modos: qualquer mudança de comportamento de edição arrisca vazar para o modo leitura (e vice-versa), e a superfície de teste dobra em cada um dos 8 componentes. A duplicação de markup do modo leitura é aceitável e isolada — pode evoluir independentemente (ex. adicionar campos calculados só de visualização) sem tocar no editor.

### Rota aninhada com navegação real (não estado local)
A troca de aba externa no `MasterDashboard` é um `<Link>`/navegação de rota para `/campanhas/:id/fichas/:fichaId`, não uma troca de estado local dentro do dashboard. A ficha selecionada fica sempre refletida na URL.

**Alternativa considerada**: aba como estado local (`useState` do `fichaId` selecionado), sem tocar a URL. Rejeitada porque a rota dedicada só se justifica se for de fato navegável/compartilhável — caso contrário a rota existiria sem nunca ser alcançada pela navegação normal da aplicação.

### `nomeJogador` no rótulo da aba
O rótulo de cada aba mostra personagem **e** jogador (ex.: "Thoromir — Fulano"), não somente o nome do personagem. Isso exige que `FichaResumo` (src/api/types.ts) ganhe um campo `nomeJogador`, populado a partir do `nome_jogador` que a API passa a expor em `GET /campanhas/:id/fichas` (change espelhado no `dungeons-api`, fora do escopo de implementação deste repositório).

## Risks / Trade-offs

- [Duplicação de markup entre tabs editáveis e tabs de leitura] → Aceito deliberadamente (ver Decisions); ambos os conjuntos de componentes são pequenos o bastante para não pesar a manutenção, e o isolamento evita bugs cruzados.
- [Frontend fica bloqueado até a API expor `nome_jogador`] → O change da API é proposto em paralelo (mesmo nome de change, repositório `dungeons-api`); até lá, a aba pode cair para mostrar só o nome do personagem sem quebrar.
- [Duas rotas de ficha coexistindo — `/campanhas/:id/ficha` (jogador, própria ficha, editável) e `/campanhas/:id/fichas/:fichaId` (mestre, leitura)] → Nomes de rota próximos podem confundir; manter o singular/plural (`ficha` vs `fichas/:fichaId`) como já esboçado evita colisão de path, mas vale revisar com atenção ao adicionar ao router.

## Migration Plan

Sem dado existente a migrar — é uma tela nova sobre dados já existentes (`FichaResumo`, `Ficha`). Nenhum rollback especial: a rota antiga do dashboard (`MasterDashboard` como lista) é substituída diretamente pela versão com abas.
