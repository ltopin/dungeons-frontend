## Why

Hoje um jogador que entra numa campanha cai direto na ficha em branco (`CharacterSheetPage`, via redirect em `CampaignPage`) e precisa preencher tudo — raça, classe, perícias de classe, talentos, magias, equipamento — sabendo de cabeça (ou consultando o livro em papel) as regras de D&D 3.5/Pathfinder 1e. Esta mudança dá ao jogador um assistente guiado de criação de personagem ("Trilha de Criação de Personagem"), consumindo o compêndio real já implementado no `dungeons-api` (mudança irmã de mesmo nome naquele repositório), em vez de um formulário em branco ou de conteúdo duplicado no frontend.

## What Changes

- Novo assistente de criação de personagem, num único componente (`CharacterWizardPage`) com barra lateral de navegação livre entre etapas ("Mesa do escriba"): o jogador pode pular para qualquer etapa a qualquer momento, sem ordem obrigatória — não são sub-rotas por etapa.
- Etapas: Raça e Classe (combinadas numa única etapa) → Atributos (compra de pontos validada) → Perícias → Talentos (bloqueio rígido de pré-requisito, quando reconhecível) → Magias (só se a classe for conjuradora) → Equipamento (catálogo de compra + pacote inicial por classe) → Revisão.
- **Raça, classe, perícias, talentos e magias vêm do compêndio real do `dungeons-api`** (`GET /compendio/{racas,classes,pericias,talentos,magias}`, já implementado e seedado com o Core Rulebook: 7 raças, 11 classes, 35 perícias, 176 talentos, 210 magias) — não é mais dado estático duplicado no frontend. Novo cliente `src/api/compendio.ts` + tipos em `src/api/compendioTypes.ts`, consumindo o formato snake_case exato do backend (`dado_vida`, `bab_progressao`, `pericias_de_classe`, `magias_por_dia`, `pre_requisitos`, etc.), sem passar pelo mapeador de `wireFormat.ts` (que só remapeia a ficha).
- **Equipamento (armas/armaduras) e a tabela de compra de pontos continuam dado estático do frontend** (`src/rules/srd/{equipment,pointBuy}.ts`) — o compêndio do `dungeons-api` não cobre equipamento nem ouro inicial por classe; ouro médio por classe e pacotes iniciais são curados no frontend, chaveados pelo nome da classe como vem do compêndio.
- **Pré-requisito de talento é texto livre no compêndio** (`pre_requisitos: string | null`, ex: "Força 13", "Base de Ataque Base +1", "Destreza 13, Esquiva"), não mais uma função tipada por talento. Um parser tolerante (`src/rules/compendioPrereq.ts`) reconhece os padrões mais comuns (atributo mínimo, BAB mínimo, nível de conjurador, talento anterior por nome exato, combinações "E" separadas por vírgula) e avalia cada talento como **atende** (libera), **não atende** (bloqueia, com o motivo exibido) ou **não verificável** (texto que o parser não reconhece — decisão do usuário: não bloqueia, mostra o pré-requisito de forma neutra em vez de travar um talento válido por limitação do parser).
- Validação continua bloqueante onde é possível verificar automaticamente:
  - Atributos: compra de pontos com pool selecionável — não é possível gastar mais do que o pool escolhido. Raças com bônus "+2 à escolha" (Humano, e outras cujo `ajustes_atributo` vem vazio do compêndio) ganham um seletor de qual atributo recebe o bônus, na própria etapa de Atributos.
  - Perícias: máximo de graduações no 1º nível e pool de pontos de perícia (classe + Inteligência + bônus racial) — o compêndio não expõe esses números prontos, então a etapa usa os mesmos cálculos de regra de sempre (`src/rules/srd/skillPoints.ts`) sobre `pontos_pericia_por_nivel` da classe.
  - Talentos: bloqueio rígido apenas quando o pré-requisito é reconhecido e não atendido (ver acima).
  - Magias: limite de escolhas por nível, filtradas pela classe via `GET /compendio/magias?classe=&nivel=`.
  - Equipamento: não é possível comprar um item cujo custo exceda o ouro restante.
- Como o compêndio também não expõe "quantos talentos o personagem ganha no 1º nível" como número pronto, isso é inferido por uma heurística tolerante sobre o texto de `caracteristicas`/`tracos` (ex: detecta "Talento de Combate Bônus" do Guerreiro, "Talentoso" do Humano) — ver design.md, decisão 3.
- `CharacterSheetPage` continua redirecionando para o assistente quando nome, classe e raça estão todos vazios, avaliado uma única vez na carga inicial da ficha.

## Capabilities

### New Capabilities
- `character-creation-wizard`: fluxo guiado de criação de personagem, consumindo o compêndio real do `dungeons-api` para raça/classe/perícia/talento/magia, com validação bloqueante onde é automaticamente verificável, escrevendo na ficha através dos endpoints de seção já existentes.

### Modified Capabilities
(nenhuma — o assistente é um novo caminho de UI que escreve nos mesmos endpoints e seções já existentes; nenhum requisito de `character-sheets` ou `character-sheet-ruleset` muda.)

## Impact

- Novo: `src/api/compendio.ts`, `src/api/compendioTypes.ts` (cliente e tipos do compêndio).
- Novo: `src/rules/compendioPrereq.ts` (parser de pré-requisito), `src/rules/classProgression.ts` (matemática de BAB/salvaguarda/graduações, independente da fonte do dado).
- Mantido, sem depender do compêndio: `src/rules/srd/{pointBuy,equipment,skillPoints}.ts`.
- Novo: `src/wizard/{CharacterWizardPage.tsx,WizardSidebar.tsx,wizardSteps.ts,wizardValidation.ts}` e `src/wizard/steps/{RacaClasseStep,AtributosStep,PericiasStep,TalentosStep,MagiasStep,EquipamentoStep,RevisaoStep}.tsx`.
- Alterado: `src/routes/CharacterSheetPage.tsx` (redirect para o assistente quando nome+classe+raça vazios), `src/App.tsx` (rota `/campanhas/:id/ficha/criar`), `src/styles.css` (layout "Mesa do escriba", 100% herdado do tema Livro de Ligações já existente).
- Depende do contrato de leitura já implementado na mudança irmã `pathfinder-character-builder` do `dungeons-api` (`GET /compendio/*`) — nomes de campo devem bater exatamente com o que está seedado lá; qualquer mudança de schema no compêndio do backend exige atualizar `src/api/compendioTypes.ts` em conjunto.
- Fora de escopo desta leva: botão de acesso ao assistente a partir da ficha já preenchida; persistência real de ficha de NPC do mestre (segue dependendo de uma mudança de modelo de dados futura no `dungeons-api`).
