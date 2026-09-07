# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mestres e jogadores do grupo de D&D 3.5 do próprio dono do produto, gerenciando suas campanhas e fichas de personagem para uso pessoal — não um produto voltado a grupos externos. Uma mesma pessoa pode ser mestre em uma campanha e jogador em outra: o papel é escopado por campanha, não por conta.

## Product Purpose

Substituir a ficha de personagem em papel/planilha e o fluxo manual de exportar/importar JSON por uma ferramenta web onde campanhas e fichas vivem juntas, persistidas em banco via API, com autosave. Sucesso significa que o grupo consegue gerir campanhas e fichas inteiramente pela ferramenta, sem depender de arquivos exportados manualmente.

## Positioning

A gestão de campanha e a ficha de personagem vivem juntas e sincronizadas, não como uma ficha digital isolada: o mestre cria uma campanha, que passa a aparecer na lista de campanhas abertas; qualquer jogador autenticado entra com uma única ação (sem código) e registra exatamente uma ficha vinculada àquela campanha. O par campanha+ficha, com papéis atribuídos por campanha, é o mecanismo central.

## Operating Context

Sessões de mesa de D&D 3.5 do grupo do dono do produto. Interface em português do Brasil. Um mestre pode simultaneamente ser jogador em outra campanha.

## Capabilities and Constraints

- Conta única por pessoa (`Conta`/User) — sem tipos de conta separados Mestre/Jogador.
- Papel (mestre/jogador) definido por uma relação de membership (conta, campanha, role).
- Mestre cria campanha; ela aparece automaticamente na lista de "campanhas abertas" para qualquer jogador autenticado que ainda não seja membro.
- Jogador entra em qualquer campanha aberta com uma única ação (sem código de convite) e registra exatamente uma ficha por campanha — par único (jogador, campanha). Um mecanismo de restrição (senha) para campanhas privadas fica para uma iteração futura; por ora toda campanha criada é aberta a qualquer jogador autenticado.
- Persistência via API/banco de dados; sem exportar/importar JSON manual como mecanismo de persistência (botões antigos de Exportar/Importar devem ser removidos ao integrar com a API).
- Autosave com debounce (~1–2s após o usuário parar de digitar), com indicador sutil de status de salvamento — sem botão "Salvar" explícito.
- Recursos em tempo real (HP ao vivo, iniciativa compartilhada, dados/chat compartilhados) estão fora do escopo do MVP; porta aberta para depois, sem infraestrutura comprometida agora.
- Em aberto (não decidido): ficha como tabelas normalizadas (perícias/talentos/ataques/inventário como linhas) vs. blob JSON/JSONB validado na API; autosave da ficha inteira vs. por seção; criação do registro da ficha no momento em que o jogador entra na campanha vs. lazy no primeiro edit.

## Brand Commitments

A tela de ficha de personagem chama-se "Livro de Ligações" e já tem um tema visual implementado (tomo de couro escuro, selos dourados para atributos, réguas em fio de ouro — ver `src/styles.css` e `src/sheet/theme.tsx`, escopado em `.ficha-sheet`). Esse tema é identidade confirmada da ficha e deve ser preservado.

## Evidence on Hand

Código-fonte existente: a tela de ficha (`CharacterSheetPage` e as abas em `src/sheet/tabs/`) tem o tema "Livro de Ligações" totalmente implementado. As telas de login, cadastro, lista de campanhas (com entrada em campanha aberta inline, sem código) e dashboard do mestre já têm o tratamento visual de tomo de couro/selos dourados aplicado — login/cadastro sob `.auth-screen`, lista de campanhas e dashboard do mestre sob `.campaigns-screen`, ambos em `src/styles.css`. Não há dados de usuário real, testemunhos ou casos de uso publicados a declarar.

## Product Principles

1. Uma conta, papéis por campanha — nunca modelar mestre/jogador como tipos de conta separados.
2. Tudo persiste no servidor — nenhuma funcionalidade deve depender de exportar/importar JSON manual.
3. Fricção mínima ao editar a ficha — autosave silencioso, sem passos de salvamento manuais.
4. Tempo real é não-objetivo do MVP — não introduzir infraestrutura de websocket/live antes de decisão explícita do usuário.
5. "Livro de Ligações" é a identidade confirmada da ficha; as demais telas (login, campanhas, dashboard) podem desenvolver seu próprio visual, mas devem se sentir parte do mesmo produto.

## Accessibility & Inclusion

Nenhum requisito específico estabelecido ainda.
