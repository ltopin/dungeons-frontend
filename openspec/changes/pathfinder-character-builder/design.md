## Context

Ver `proposal.md` para a motivação. Hoje `CampaignPage` redireciona todo jogador direto para `/campanhas/:id/ficha` (`CharacterSheetPage`), que renderiza as abas manuais (`GeralTab`, `CombateTab`, `PericiasTab`, `TalentosTab`, `MagiasTab`, `AtaquesTab`, `InventarioTab`, `FamiliarTab`), cada uma com autosave debounced por seção (`useSectionAutosave`, `useListSection`). A ficha já nasce provisionada em branco pelo backend no momento em que o jogador entra na campanha, com todas as seções 1:1 e a lista padrão de perícias. O motor de regras (`src/rules/`) já calcula CA, testes, ataque, CMB/CMD, perícia total, CD de magia e capacidade de carga a partir dos inputs.

Este change consome o compêndio real já implementado na mudança irmã `pathfinder-character-builder` do `dungeons-api`: coleções MongoDB somente-leitura (`compendio_racas`, `compendio_classes`, `compendio_pericias`, `compendio_talentos`, `compendio_magias`) seedadas a partir do Core Rulebook, servidas via `GET /compendio/*` autenticado. Uma primeira versão deste change havia autorado um subconjunto próprio ("núcleo básico") como dado estático no frontend, por não se saber ainda que o backend implementaria um compêndio real; essa versão foi descartada assim que o compêndio real foi encontrado, em favor de consumi-lo diretamente — ver Risks/Trade-offs sobre por que ele não cobre tudo.

## Goals / Non-Goals

**Goals:**
- Assistente passo a passo que consome o compêndio real do `dungeons-api` para raça, classe, perícia, talento e magia — sem duplicar esse conteúdo no frontend.
- Resumível de graça: como o estado inicial de cada etapa vem da ficha já persistida, sair e voltar não perde progresso salvo.
- Validação bloqueante onde é automaticamente verificável: compra de pontos de atributo dentro de um pool, alocação de perícia dentro do máximo de graduações e do pool calculado, talento cujo pré-requisito reconhecido não é satisfeito não pode ser escolhido, magia além do limite por nível não pode ser escolhida, item cujo custo excede o ouro restante não pode ser comprado.
- Navegação livre entre etapas por uma barra lateral (não sequencial), para suportar tanto o jogador criando seu personagem do zero quanto o mestre montando um NPC rapidamente.

**Non-Goals:**
- Cobertura de 100% dos pré-requisitos de talento do compêndio — o parser de texto livre (`src/rules/compendioPrereq.ts`) reconhece os padrões mais comuns; o que não reconhece vira "não verificável" (não bloqueia), nunca um bloqueio ou uma liberação incorretos.
- Equipamento (armas/armaduras) e ouro inicial por classe vindos do compêndio — o `dungeons-api` não cobre isso nesta leva; seguem como dado estático curado no frontend.
- Botão de acesso ao assistente a partir da ficha já preenchida — nesta leva, o único caminho de volta ao assistente é a URL direta `/campanhas/:id/ficha/criar`.
- Persistência real de ficha de NPC do mestre ("ficha solta vinculada à campanha, sem membership de jogador") — exige uma proposta OpenSpec própria no `dungeons-api` para o modelo de dados.
- Migrar `CampaignPage`/`CharacterSheetPage` para um framework de state machine — o assistente usa estado de componente React simples.

## Decisions

### 1. Estado do assistente deriva da ficha, mais estado local elevado para raça/classe escolhidas

Cada etapa lê o valor atual da seção correspondente da ficha como valor inicial do formulário daquela etapa, e grava via o mesmo hook/endpoint que a aba manual equivalente usa. Como a ficha só guarda raça e classe como **texto livre** (`geral.raca`/`geral.classe`), o componente pai (`CharacterWizardPage`) busca o compêndio inteiro (racas/classes/pericias/talentos) uma única vez no mount, e mantém `racaId`/`classeId` como estado local elevado (tentando primeiro casar o nome salvo na ficha com um `id` do compêndio, para o caso de o jogador sair e voltar) — as etapas seguintes recebem os objetos `CompendioRaca`/`CompendioClasse` já resolvidos como props, não fazem sua própria busca.

### 2. Heurística de "ficha em branco" para decidir a entrada, avaliada uma única vez

`nomePersonagem`, `classe` e `raca` vazios/nulos ao mesmo tempo é o sinal de "personagem ainda não criado". A checagem é feita uma única vez, no `GET` inicial da ficha — recalculá-la a cada re-sincronização de autosave arrancaria o jogador de volta ao assistente se um autosave em trânsito produzisse um objeto `geral` parcial. (Bug real encontrado em produção: a API retorna `null`, não string vazia, para campos de texto ainda não preenchidos — a checagem trata `null` e string vazia da mesma forma.)

### 3. Pré-requisito de talento: parser tolerante de texto livre, com fallback "não verificável"

O compêndio guarda `pre_requisitos` como texto livre (decisão da mudança irmã no backend), não como uma estrutura ou função. `src/rules/compendioPrereq.ts` separa o texto em cláusulas por vírgula (tratadas como E) e reconhece: atributo mínimo ("Força 13"), base de ataque mínima ("Base de Ataque Base +N"), nível de conjurador mínimo ("Conjurador de nível N"), e talento anterior (a cláusula bate com o nome exato de outro talento do próprio compêndio). Qualquer cláusula fora desses padrões (ex: "Proficiência com escudos", "Capacidade de canalizar energia", "5 graduações em uma perícia de Ofício ou Profissão") marca o pré-requisito **inteiro** como não verificável — mesmo que outras cláusulas da mesma combinação sejam reconhecidas — porque bloquear ou liberar parcialmente sem conseguir avaliar tudo seria pior do que ser transparente que não foi possível confirmar. Decisão do usuário: um talento não verificável **não é bloqueado**, só exibe o texto do pré-requisito sem a promessa de que foi conferido — evita travar talentos legítimos por limitação do parser em ~176 talentos de texto real. Amostra de 106 talentos com pré-requisito no seed atual: os quatro padrões acima cobrem a maioria dos casos simples; o restante (proficiências, "capacidade de X", graduações de perícia, talentos de raça/classe específicos) fica não verificável até o parser crescer.

### 4. Quantidade de talentos e pontos de perícia no 1º nível: heurística sobre texto, não campo pronto

O compêndio não expõe "quantos talentos o personagem ganha no 1º nível" nem "quantos pontos de perícia bônus a raça dá" como números — só descreve em `caracteristicas` (classe) e `tracos` (raça) em texto livre (ex: "Talento de Combate Bônus" do Guerreiro, "Talentoso"/"Versátil" do Humano). `talentosDisponiveisNivel1` e `bonusPericiaNivel1` (`src/wizard/wizardValidation.ts`) detectam essas menções por regex tolerante (procura "talento" + "bônus/adicional" nas características de nível 1 da classe e nos traços da raça; procura "perícia" + "adicional/extra" + "cada nível" nos traços da raça) e aplicam o valor numérico real da regra do Pathfinder 1e (+1 talento por menção detectada; +1 ponto de perícia por nível quando o traço de perícia extra é detectado — a regra real do traço "Versátil" do Humano). Alternativa considerada: pedir ao `dungeons-api` para expor esses números como campos estruturados. Não descartada, só adiada — a mudança irmã lá já está implementada com esse formato; expor os números exigiria uma revisão de schema própria, fora do escopo desta leva.

### 5. Etapas num único componente com barra lateral de navegação livre, não rotas filhas

`src/wizard/CharacterWizardPage.tsx` renderiza a etapa atual condicionalmente a partir de um estado `step`, com `WizardSidebar` permitindo pular para qualquer etapa a qualquer momento — não usa sub-rotas do `react-router`. Motivo: suportar o mestre montando um NPC rápido, que pode pular direto para Talentos. Trade-off aceito: um refresh de página sempre reabre na primeira etapa, não na última visitada; nenhum dado é perdido porque cada etapa já persiste na ficha ao ser preenchida.

### 6. Ordem das etapas, com Raça e Classe combinadas e Equipamento adicionado

Raça e Classe (uma única etapa) → Atributos → Perícias → Talentos → Magias (só se conjurador) → Equipamento → Revisão.

### 7. Atributos por compra de pontos com pool selecionável, e bônus racial "à escolha"

O jogador escolhe entre quatro pools nomeados (10 a 25 pontos) e distribui pontos pela tabela de custo oficial. Diferente da primeira versão desta proposta (dado próprio, todas as raças com ajuste fixo): o compêndio real inclui raças cujo `ajustes_atributo` vem **vazio** (Humano, Meio-Elfo, Meio-Orc — o bônus é "+2 à escolha do jogador", descrito só em texto no traço "Bônus de Atributo"). A etapa de Atributos detecta `ajustes_atributo` vazio e oferece um seletor de qual atributo recebe o +2, aplicado como o ajuste efetivo daquele atributo só.

### 8. Equipamento com catálogo e pacote inicial por classe, fora do compêndio

Cada uma das 11 classes do compêndio tem um ouro médio inicial e um pacote de itens sugerido, curados no frontend (`src/rules/srd/equipment.ts`, chaveados pelo nome exato da classe como vem do compêndio) — o `dungeons-api` não cobre armas/armaduras nesta leva. O jogador pode aplicar o pacote com um clique (respeitando o ouro disponível) ou comprar item a item de um catálogo curado.

## Risks / Trade-offs

- [Parser de pré-requisito não cobre 100% dos 176 talentos do compêndio] → aceito conscientemente pelo usuário; o fallback "não verificável" nunca bloqueia nem libera incorretamente, só deixa de automatizar a checagem. A lista de padrões cresce incrementalmente.
- [Contagem de talentos/pontos de perícia bônus por heurística de texto, não campo estruturado] → aceito; se o texto de uma característica/traço mudar de fraseado no compêndio (ex: numa correção de conteúdo), a heurística pode parar de detectar um bônus que antes detectava. Mitigação: os testes de `wizardValidation` fixam o fraseado esperado, então uma mudança de texto no seed quebra o teste em vez de silenciosamente parar de contar.
- [Equipamento e ouro inicial vivem como dado estático do frontend, não no compêndio] → aceito para esta leva; se o usuário quiser equipamento no compêndio depois, é uma proposta OpenSpec nova no `dungeons-api`.
- [Heurística de ficha em branco pode reabrir o assistente indesejadamente se nome, classe E raça forem apagados ao mesmo tempo] → aceito, caso raro e recuperável.
- [Sem botão de retorno ao assistente uma vez que o personagem já tem nome/classe/raça] → aceito para esta leva.
- [Refresh de página durante o assistente sempre reabre na primeira etapa] → aceito, trade-off da decisão 5; nenhum dado é perdido.
- [Acoplamento de schema: `src/api/compendioTypes.ts` espelha exatamente os campos do `dungeons-api`] → qualquer mudança de schema no compêndio do backend exige atualizar os tipos e, possivelmente, o parser de pré-requisito e as heurísticas de texto no mesmo commit.
- [Persistência real de NPC do mestre não existe] → bloqueado por uma decisão de modelo de dados que pertence a uma proposta futura no `dungeons-api`.

## Migration Plan

Depende do compêndio do `dungeons-api` estar seedado e acessível (`npm run seed:compendio` naquele repositório) antes deste change funcionar de ponta a ponta — sem isso, as etapas de Raça/Classe/Perícias/Talentos/Magias carregam listas vazias. Rollout: (1) confirmar que o compêndio está seedado no ambiente alvo; (2) este change implantado, todo jogador novo passa pelo assistente ao entrar numa campanha; (3) persistência de NPC do mestre fica para uma proposta futura, condicionada a uma mudança de modelo de dados no `dungeons-api`.
