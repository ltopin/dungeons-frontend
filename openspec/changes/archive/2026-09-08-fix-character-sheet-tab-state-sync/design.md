## Context

Ver proposal.md - Why. Resumo técnico: `CharacterSheetPage` guarda `ficha` em `useState`, populado uma única vez via `obterFicha` em um `useEffect([id])`. Cada aba é montada condicionalmente (`{aba === 'X' && <Tab .../>}`), recebendo uma fatia de `ficha` como prop `initial`/`initialItems` para os hooks `useSectionAutosave` e `useListSection`. Esses hooks fazem `useState(initial)` — lido uma única vez no mount do hook — e nunca voltam a sincronizar com o prop. Como `ficha` no componente pai nunca é atualizado após um PATCH, remontar uma aba sempre reidrata a partir do snapshot do GET inicial.

## Goals / Non-Goals

**Goals:**
- Fazer com que o valor mais recente salvo de qualquer seção sobreviva a desmontagem/remontagem de aba, sem exigir refresh de página.
- Garantir que uma edição pendente (dentro da janela de debounce) seja persistida ao trocar de aba, em vez de descartada silenciosamente.
- Manter o autosave debounced por seção/linha como está (comportamento já coberto pela capability `character-sheets`).

**Non-Goals:**
- Não introduzir persistência local (localStorage/sessionStorage) — a capability `character-sheets` proíbe explicitamente qualquer cópia local dos dados fora da API.
- Não mudar o formato de dados trafegado com a API nem os endpoints de `src/api/sheets.ts`.
- Não resolver conflitos de edição concorrente (dois usuários editando a mesma ficha ao mesmo tempo) — fora de escopo deste change.
- Não mudar a UX de deixar as abas desmontarem ao trocar (não vamos manter todas montadas com CSS toggle); a estratégia escolhida corrige a sincronização de estado sem alterar esse comportamento de montagem.

## Decisions

### 1. Levantar o estado para `CharacterSheetPage` via callback `onSaved`, em vez de manter as abas sempre montadas

`useSectionAutosave` e `useListSection` passam a aceitar um parâmetro opcional `onSaved` (ou `onChange`), invocado com o valor confirmado pelo backend logo após `atualizarSecao`/`criarLinha`/`atualizarLinha`/`removerLinha` resolverem com sucesso. `CharacterSheetPage` passa, para cada aba, uma função que atualiza `ficha` via `setFicha((f) => f && { ...f, <secao>: valorConfirmado })`.

Assim, mesmo que a aba desmonte e remonte, o próximo `useState(initial)` do hook recebe o dado atualizado, porque o prop `initial`/`initialItems` já reflete o último save.

**Alternativa considerada — manter todas as abas sempre montadas (CSS `display:none` em vez de desmontar):** evitaria a perda de estado local sem precisar levantar o estado. Rejeitada porque: (a) não ataca a causa raiz relatada pelo usuário — os dados já estavam salvos no backend e mesmo assim sumiam, ou seja, o problema real é o prop `ficha` desatualizado no pai, não (apenas) o unmount da aba; (b) manteria as 8 seções completas montadas e re-renderizando simultaneamente, custo desnecessário; (c) muda o padrão de montagem sem necessidade, quando o problema é resolvido corrigindo a fonte da verdade dos dados.

### 2. Flush do save pendente no cleanup do hook, em vez de apenas limpar o timer

O `useEffect` de cleanup em `useSectionAutosave` (e o equivalente em `useListSection`) passa a, ao desmontar com um patch pendente em `pendingRef`/`pending.current`, disparar o `save`/`atualizarSecao` correspondente de forma síncrona (fire-and-forget, sem aguardar o componente já desmontado) em vez de só `clearTimeout`.

**Alternativa considerada — aumentar o debounce ou salvar a cada keystroke:** rejeitada por não eliminar a janela de corrida (só encolhe ou explode o volume de requests) e por mudar o comportamento de UX do indicador de status sem necessidade.

### 3. `onSaved` recebe o valor confirmado pela API, não o valor otimista local

Prefere-se propagar o retorno do `atualizarSecao`/`criarLinha`/etc. (já normalizado pelo backend) em vez do valor local otimista, para que `ficha` no pai reflita exatamente o que o backend persistiu (ex.: campos calculados/normalizados no PATCH).

## Risks / Trade-offs

- [Flush no unmount dispara uma requisição que o componente não vai mais observar (sem componente para atualizar `status`)] → Aceitável: o hook já usa `atualizarSecao` como fire-and-forget em relação à UI; a única mudança é garantir que o request seja disparado antes do cleanup, não que a UI aguarde a resposta.
- [Callback `onSaved` adiciona um novo parâmetro à assinatura pública dos hooks, tocando todas as 8 abas] → Mitigado por manter o parâmetro opcional e por ser uma mudança mecânica e uniforme (mesmo padrão em todas as abas).
- [Se duas abas diferentes fizerem PATCH quase simultâneo em seções diferentes, ambos os `setFicha` são atualizações independentes de campos distintos do objeto `ficha` — sem risco de sobrescrita entre si, pois cada `onSaved` só toca sua própria chave de seção] → Sem mitigação adicional necessária.

## Migration Plan

Mudança é aditiva e não quebra a API pública das telas — apenas correção de bug de sincronização no frontend. Não há dado migrado nem flag de rollout; deploy normal via merge. Rollback trivial (reverter o commit), já que nenhuma mudança de schema/API está envolvida.
