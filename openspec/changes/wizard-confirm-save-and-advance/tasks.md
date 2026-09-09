## 1. Hooks de persistência

- [x] 1.1 `src/sheet/useSectionAutosave.ts` — adicionar `flush(): Promise<T>`: cancela o timer pendente e, se houver patch pendente, chama `save` e retorna a Promise; se não houver, resolve sem chamar a API
- [x] 1.2 `src/sheet/useListSection.ts` — adicionar `flushAll(): Promise<Item[]>` equivalente, cobrindo os timers de edição de campo por linha
- [x] 1.3 Testes dos dois hooks: flush com patch pendente envia e resolve; flush sem pendência não chama a API; flush propaga rejeição em caso de erro

## 2. Etapas do assistente

- [x] 2.1 `RacaClasseStep.tsx` — `confirmar()` chama `flush()` de `geral` antes de `onConcluir()`; estado local `confirmando` desabilita o botão e troca o texto para "Salvando…" enquanto pendente
- [x] 2.2 `AtributosStep.tsx` — mesmo padrão para `geral`
- [x] 2.3 `EquipamentoStep.tsx` — `confirmar()` chama `flush()` de `moedas` antes de `onConcluir()` (itens usam CRUD imediato, sem flush necessário)
- [x] 2.4 `MagiasStep.tsx` — `confirmar()` chama `flush()` de `magias-config` antes de `onConcluir()`
- [x] 2.5 `PericiasStep.tsx` — `confirmar()` chama `flushAll()` da lista de perícias antes de `onConcluir()`
- [x] 2.6 `TalentosStep.tsx` — aplicar o mesmo estado `confirmando`/desabilitado no botão de confirmação (lista de talentos não tem edição de campo debounced, então sem flush a fazer)
- [x] 2.7 Em cada etapa, quando `confirmar()` rejeita, permanecer na etapa atual sem chamar `onConcluir()`, deixando visível o indicador de erro já existente (`SaveStatusBadge`/status por linha)

## 3. Estilo

- [x] 3.1 `src/styles.css` — adicionar `.ficha-sheet .wizard-step-actions button:disabled { opacity: 0.4; cursor: not-allowed; }`

## 4. Testes de integração

- [x] 4.1 Atualizar/estender `CharacterWizardPage.test.tsx`: digitar nome, escolher raça/classe, clicar em confirmar imediatamente (antes de 1s) e verificar que `atualizarSecao` foi chamado com o patch pendente antes da troca para a etapa Atributos
- [x] 4.2 Novo teste: mock de `atualizarSecao` rejeitando no clique de confirmar mantém a etapa atual e não avança
- [x] 4.3 Novo teste: botão de confirmação com `podeConcluir` falso tem o atributo `disabled` (já coberto indiretamente, mas sem asserção visual — usar `toBeDisabled()` explicitamente numa etapa)
