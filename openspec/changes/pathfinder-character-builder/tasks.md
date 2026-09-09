## 1. Cliente do compêndio (dungeons-api)

- [x] 1.1 `src/api/compendioTypes.ts` — tipos espelhando exatamente o schema do compêndio (`CompendioRaca`, `CompendioClasse`, `CompendioPericia`, `CompendioTalento`, `CompendioMagia`)
- [x] 1.2 `src/api/compendio.ts` — `listarRacasCompendio`, `listarClassesCompendio`, `listarPericiasCompendio`, `listarTalentosCompendio`, `listarMagiasCompendio` (com filtro `classe`+`nivel`)

## 2. Regras que continuam no frontend (fora do compêndio)

- [x] 2.1 `src/rules/srd/pointBuy.ts` — tabela de custo de pontuação (7–18) e pools de pontos
- [x] 2.2 `src/rules/srd/equipment.ts` — catálogo de equipamento, ouro médio por classe (`OURO_INICIAL_POR_CLASSE`, chaveado pelo nome da classe) e pacotes iniciais para as 11 classes do compêndio
- [x] 2.3 `src/rules/srd/skillPoints.ts` — cálculo de pontos de perícia no 1º nível e custo por graduação
- [x] 2.4 `src/rules/classProgression.ts` — BAB/salvaguarda/graduações no 1º nível a partir da progressão da classe (`boa`/`media`/`ruim`)

## 3. Validação no wizard

- [x] 3.1 `src/rules/compendioPrereq.ts` — parser tolerante de `pre_requisitos` (atributo mínimo, BAB mínimo, nível de conjurador, talento anterior, combinações por vírgula), com resultado `atende`/`nao_atende`/`nao_verificavel`
- [x] 3.2 `src/wizard/wizardValidation.ts` — monta o contexto a partir do compêndio, `talentosDisponiveisNivel1` e `bonusPericiaNivel1` (heurísticas de texto sobre `caracteristicas`/`tracos`)
- [x] 3.3 Testes: `src/rules/compendioPrereq.test.ts`, `src/rules/srd/pointBuy.test.ts`, `src/rules/srd/skillPoints.test.ts`

## 4. Rotas e navegação

- [x] 4.1 `src/wizard/CharacterWizardPage.tsx` + `src/wizard/WizardSidebar.tsx` — busca o compêndio inteiro (racas/classes/pericias/talentos) uma vez no mount, navegação livre entre etapas
- [x] 4.2 Rota `/campanhas/:id/ficha/criar` em `src/App.tsx`
- [x] 4.3 Redirect em `src/routes/CharacterSheetPage.tsx`: nome+classe+raça vazios (ou `null`), checado uma única vez na carga inicial
- [ ] 4.4 Botão de acesso ao assistente a partir da ficha já preenchida — fora de escopo desta leva

## 5. Etapas do assistente

- [x] 5.1 `RacaClasseStep` — lista raças/classes do compêndio, mostra traços e características de nível 1
- [x] 5.2 `AtributosStep` — compra de pontos com pool selecionável; seletor de "+2 à escolha" quando `ajustes_atributo` vem vazio do compêndio (Humano e afins)
- [x] 5.3 `PericiasStep` — aloca graduações contra o catálogo de perícias do compêndio, respeitando `pericias_de_classe` da classe escolhida
- [x] 5.4 `TalentosStep` — lista talentos do compêndio com bloqueio rígido quando o pré-requisito é reconhecido e não atendido, texto do pré-requisito sempre visível (inclusive quando "não verificável")
- [x] 5.5 `MagiasStep` — busca `GET /compendio/magias?classe=&nivel=0,1` sob demanda ao entrar na etapa, só para classe conjuradora, com estado de carregamento/erro
- [x] 5.6 `EquipamentoStep` — ouro inicial e pacote por classe (dado do frontend, ver 2.2), catálogo de compra
- [x] 5.7 `RevisaoStep` — resumo somente-leitura e link para a ficha completa

## 6. Testes

- [x] 6.1 `CharacterSheetPage.test.tsx` — ficha em branco (incl. campos `null`, não só string vazia) redireciona para o assistente; ficha preenchida não redireciona
- [x] 6.2 `CharacterWizardPage.test.tsx` — mocka `src/api/compendio.ts` com raça/classe/talento fake; escolha avança para Atributos; talento bloqueado por pré-requisito de Força fica indisponível com o texto visível, e é liberado depois de aumentar o atributo via navegação livre entre etapas
- [x] 6.3 `compendioPrereq.test.ts` — cobre os 4 padrões reconhecidos, combinação por vírgula (E), e o fallback "não verificável" para texto não reconhecido, inclusive quando misturado com uma cláusula reconhecida
- [ ] 6.4 Teste de retomada entre sessões (sair no meio, recarregar a página, confirmar que os dados já salvos aparecem) — não coberto ainda
- [ ] 6.5 Testes de integração dedicados para `PericiasStep`/`MagiasStep`/`EquipamentoStep` — cobertos indiretamente pela suíte de `useListSection`/`useSectionAutosave`/regras puras, sem teste de integração próprio ainda

## 7. Pendências fora desta leva

- [ ] 7.1 Persistência real de ficha de NPC do mestre (ficha solta vinculada à campanha, sem membership de jogador) — depende de uma proposta OpenSpec própria no `dungeons-api` para o modelo de dados
- [ ] 7.2 Expandir a cobertura do parser de pré-requisito (`src/rules/compendioPrereq.ts`) conforme mais padrões de texto do compêndio real forem encontrados em uso
- [ ] 7.3 Botão de acesso ao assistente a partir da ficha já preenchida (ver 4.4)
- [ ] 7.4 Se o volume/edição de equipamento crescer, avaliar mover para um compêndio de equipamento no `dungeons-api` (proposta própria)
