## Context

`dungeons-frontend` está vazio hoje — não há `package.json` nem estrutura de app, só o protótipo de ficha (componente React único, estado local, export/import JSON) discutido na exploração que originou este change. Ver `proposal.md` para a motivação e a dependência do contrato definido em `dungeons-api` (change `character-sheet-persistence` naquele repositório).

## Goals / Non-Goals

**Goals:**
- Estabelecer a estrutura mínima de app (roteamento entre telas) necessária para campanha + ficha existirem como fluxos separados, não um componente único.
- Definir como o autosave por seção se conecta aos endpoints de `dungeons-api`, preservando a divisão em abas que o protótipo já tem.
- Remover completamente o caminho de persistência local (export/import JSON).

**Non-Goals:**
- Autenticação real (telas de login/cadastro, escolha de provedor) — fora de escopo deste change (ver proposal.md). Este design define apenas um placeholder de sessão para não bloquear o resto.
- Qualquer feature em tempo real (websocket) — não introduzido aqui, alinhado com o Non-Goal equivalente do change em `dungeons-api`.
- Escolha final de biblioteca de data-fetching ou identidade visual do dashboard do mestre — detalhes de baixo nível que não mudam o comportamento especificado (ver Open Questions).

## Decisions

### 1. Vite + React + roteamento client-side, sem framework full-stack
O protótipo já é React puro (hooks, JSX). Como o app é apenas um consumidor da API de `dungeons-api` (sem necessidade de SSR ou rotas de servidor), adota-se Vite + React Router em vez de um framework full-stack (ex: Next.js). Alternativa considerada — Next.js — rejeitada por adicionar uma camada de servidor sem necessidade real neste MVP.

### 2. Estrutura de rotas
```
/login                     (placeholder — ver decisão 4)
/campanhas                 (campanhas onde a conta atual é membro)
/campanhas/nova             (mestre cria campanha)
/campanhas/entrar            (jogador usa código de convite)
/campanhas/:id               (mestre → dashboard de fichas; jogador → redireciona para sua ficha)
/campanhas/:id/ficha          (editor de ficha — o componente do protótipo, adaptado)
```

### 3. Autosave por seção mapeado às abas existentes
Cada aba do editor (`GeralTab`, `CombateTab`, `PericiasTab`, `MagiasTab`, `InventarioTab`, Notas) mantém sua estrutura atual, mas troca a fonte de dados: em vez de ler/escrever só em `useState(emptySheet())`, cada aba busca sua seção via `GET /fichas/:id` (uma carga inicial que popula todas as seções) e persiste mudanças chamando o endpoint de seção correspondente definido em `dungeons-api`:
- Seções 1:1 (Geral, Combate, Magias-config, Moedas, Notas): debounce por seção → `PATCH` da seção inteira quando o usuário para de digitar.
- Seções de lista (Talentos, Ataques, Perícias, Magias, Itens): cada linha já tem seu próprio `id` (hoje gerado por `uid()` local); passa a ser o id retornado pela API. Criar linha → `POST` imediato; editar campo de uma linha → debounce por linha → `PATCH /:itemId`; remover → `DELETE /:itemId` imediato.

Estado local (`useState`) continua existindo para feedback imediato de digitação (otimista); o debounce só controla quando a chamada de rede acontece, não a atualização da tela.

### 4. Placeholder de sessão (até auth real existir)
Como autenticação não está definida em nenhum dos dois repositórios, este change introduz um contexto de sessão mínimo e explicitamente temporário: a "conta atual" vem de uma tela `/login` simplificada que apenas identifica qual conta de teste está em uso (ex: selecionar/criar uma conta por nome, sem senha), guardando o id da conta em memória/sessionStorage. Este placeholder deve ser isolado num único módulo (`auth/session` ou equivalente) para ser trocado inteiramente quando um change de autenticação real for feito, sem espalhar a lógica pela UI de campanha/ficha.

### 5. Sem estado de persistência local para a ficha
Remove-se `exportJSON`, `handleImportFile`, os botões "Exportar"/"Importar" e o `fileInputRef` associado. `emptySheet()` deixa de ser o estado inicial do componente — o estado inicial passa a ser "carregando" até a resposta de `GET /fichas/:id` chegar.

## Risks / Trade-offs

- [Autosave granular por seção/linha gera várias chamadas de rede se o usuário edita rápido em múltiplos campos de abas diferentes] → cada seção/linha tem seu próprio timer de debounce independente; não há um único debounce global que atrasaria seções não relacionadas.
- [Placeholder de sessão (decisão 4) pode ser esquecido em produção] → isolado em módulo único, com nome explícito indicando que é temporário, para facilitar auditoria antes de qualquer deploy real.
- [Contrato de `dungeons-api` ainda não está implementado, só especificado] → construir a camada de API do frontend contra a spec do change irmão; se a spec de `dungeons-api` mudar antes da implementação, este change precisa ser revisado.

## Migration Plan

Repositório greenfield — não há usuários nem dados a migrar. Não há estratégia de rollback além do rollback padrão de deploy (app ainda não está em produção).

## Open Questions

- Biblioteca de data-fetching (fetch nativo com um wrapper fino vs. uma lib como axios/react-query) — não muda o comportamento especificado, é detalhe de implementação a decidir na hora de codar.
- Layout visual exato do dashboard do mestre (cards, tabela, etc.) — decisão de design visual, não de comportamento; não muda as specs deste change.
