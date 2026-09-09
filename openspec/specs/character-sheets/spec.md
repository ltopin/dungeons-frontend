## Purpose

Define o comportamento observável do editor de ficha ao consumir a API por seção — carregamento, autosave com indicador de status, CRUD de linhas de lista, e a ausência total de qualquer persistência local.

## Requirements

### Requirement: Carregamento inicial via API
Ao abrir o editor de uma ficha, a UI SHALL carregar todas as suas seções a partir da API antes de exibir os campos como editáveis.

#### Scenario: Carregamento bem-sucedido
- **WHEN** o usuário abre o editor de uma ficha existente
- **THEN** a UI exibe um estado de carregamento e, ao concluir, preenche todas as seções com os dados retornados pela API

#### Scenario: Falha ao carregar
- **WHEN** a requisição de carregamento da ficha falha
- **THEN** a UI exibe uma mensagem de erro e não apresenta um formulário vazio como se fosse uma ficha nova

### Requirement: Autosave por seção com indicador de status
Ao editar um campo de uma seção 1:1 (Geral, Combate, configuração de Magias, Moedas, Notas), a UI SHALL persistir a mudança após uma pausa na digitação e exibir um indicador de status (salvando / salvo / erro) específico daquela seção. Quando a seção tem campos derivados (ver requisito de campos derivados somente-leitura), o payload enviado SHALL incluir os valores calculados no momento do envio, não apenas os campos digitados pelo usuário. A UI SHALL manter o valor salvo mais recente disponível para aquela seção mesmo após a aba correspondente ser desmontada (por exemplo, ao trocar de aba) e remontada, sem exigir um novo carregamento de página. Ao desmontar a aba de uma seção com uma edição pendente de salvamento (ainda dentro da pausa de debounce), a UI SHALL disparar o salvamento dessa edição antes de descartar o estado local da aba.

#### Scenario: Edição salva com sucesso
- **WHEN** o usuário edita um campo de uma seção e para de digitar
- **THEN** a UI envia a atualização daquela seção e, ao confirmar, mostra um indicador de "salvo" para ela

#### Scenario: Falha ao salvar
- **WHEN** a atualização de uma seção falha ao ser enviada
- **THEN** a UI mostra um indicador de erro para aquela seção, mantém o valor editado no campo e permite tentar novamente

#### Scenario: Edição de um input recalcula e envia os derivados da seção
- **WHEN** o usuário edita força (na seção Geral) e essa mudança altera o CMB calculado (na seção Combate)
- **THEN** ao autosave da seção Combate disparar (por qualquer edição futura nela, ou por uma leitura/gravação subsequente), o CMB enviado reflete o valor de força mais recente

#### Scenario: Valor preservado ao trocar de aba e voltar
- **WHEN** o usuário edita um campo de uma seção, a edição é salva com sucesso, e o usuário troca para outra aba e depois volta para a aba original
- **THEN** a aba original exibe o valor editado, sem exigir um refresh de página

#### Scenario: Edição pendente ao trocar de aba
- **WHEN** o usuário edita um campo de uma seção e troca de aba antes da pausa de debounce disparar o salvamento automaticamente
- **THEN** a UI dispara o salvamento dessa edição pendente antes de desmontar a aba, de modo que a edição não seja perdida

### Requirement: CRUD imediato em linhas de seções de lista
Nas seções de lista (Talentos, Ataques, Perícias, Magias, Itens de inventário), a UI SHALL persistir imediatamente a criação e a remoção de uma linha, e persistir a edição de campos de uma linha existente com o mesmo comportamento de autosave com indicador por linha. Para Perícias, o payload de criação/edição SHALL incluir o total calculado da linha. A UI SHALL manter o estado mais recente da lista (incluindo linhas criadas, removidas e campos editados) disponível para aquela seção mesmo após a aba correspondente ser desmontada e remontada, sem exigir um novo carregamento de página.

#### Scenario: Adicionar linha
- **WHEN** o usuário adiciona uma nova linha a uma seção de lista
- **THEN** a UI persiste a criação imediatamente e passa a exibir a linha com o identificador retornado pela API

#### Scenario: Remover linha
- **WHEN** o usuário remove uma linha existente
- **THEN** a UI persiste a remoção imediatamente e deixa de exibir aquela linha

#### Scenario: Editar campo de linha existente
- **WHEN** o usuário edita um campo de uma linha existente e para de digitar
- **THEN** a UI envia a atualização daquela linha e mostra um indicador de status específico dela

#### Scenario: Editar perícia envia o total calculado
- **WHEN** o usuário edita as graduações de uma perícia
- **THEN** o autosave daquela linha envia também o total recalculado (graduações + modificador de atributo + bônus de classe + outros), não só o campo editado

#### Scenario: Lista preservada ao trocar de aba e voltar
- **WHEN** o usuário edita, adiciona ou remove uma linha em uma seção de lista, e depois troca para outra aba e volta para a aba original
- **THEN** a aba original exibe a lista com as mudanças persistidas, sem exigir um refresh de página

### Requirement: Campos derivados são somente-leitura e recalculam ao vivo
Os campos cujo valor é definido por uma regra do ruleset (CA total/toque/surpreendido, testes de resistência total, bônus de ataque corpo a corpo/distância, CMB, CMD, total de perícia, CD de magia, capacidade de carga) SHALL ser exibidos como somente-leitura na UI, recalculados imediatamente (sem esperar o debounce do autosave) sempre que um input do qual dependem muda.

#### Scenario: Campo derivado não aceita digitação
- **WHEN** o usuário tenta clicar/digitar em um campo derivado (ex: CA total)
- **THEN** o campo não aceita entrada direta

#### Scenario: Recalculo imediato entre seções
- **WHEN** o usuário altera o valor de destreza na seção Geral
- **THEN** a CA total e a CA de toque exibidas na seção Combate atualizam imediatamente na tela, antes mesmo do autosave da seção Geral confirmar

### Requirement: Edição da seção de familiar/companheiro animal
A UI SHALL oferecer uma aba de familiar/companheiro animal com os mesmos campos definidos no schema da API (nome, tipo, DV, iniciativa, deslocamento, CA, ataques, AE, QE, tendência, testes de resistência, os 6 atributos, CMB, CMD, face), tratada como uma seção 1:1 opcional: ausente até o jogador preencher o primeiro campo.

#### Scenario: Ficha sem familiar
- **WHEN** o jogador abre uma ficha que nunca teve familiar preenchido
- **THEN** a aba de familiar aparece com todos os campos vazios, sem erro

#### Scenario: Primeiro preenchimento cria a seção
- **WHEN** o jogador preenche e salva qualquer campo da aba de familiar pela primeira vez
- **THEN** a UI trata a resposta como sucesso e passa a tratar a seção como existente para os próximos autosaves

### Requirement: Detalhamento de magia no grimório
A UI SHALL permitir editar, por magia, escola, tempo de formulação, componentes, alcance, alvo/efeito, duração, teste de resistência, resistência à magia e descrição, além dos campos já existentes (nível, nome, preparada, notas), e exibir a CD calculada daquela magia como somente-leitura ao lado dela.

#### Scenario: Edição do detalhamento de uma magia
- **WHEN** o jogador preenche escola e componentes de uma magia existente
- **THEN** a UI persiste esses campos na mesma linha, junto com os campos que já existiam

### Requirement: Categoria de talento (talento comum ou qualidade especial)
A UI SHALL permitir marcar cada linha de talento como "talento" ou "qualidade especial", exibindo as duas categorias em listas visualmente distintas dentro da mesma aba.

#### Scenario: Criar uma qualidade especial
- **WHEN** o jogador adiciona uma linha marcada como "qualidade especial"
- **THEN** a UI exibe essa linha na lista de qualidades especiais, não na lista de talentos comuns

### Requirement: Visualização somente leitura da ficha para o mestre
O mestre de uma campanha SHALL poder visualizar a ficha completa de qualquer jogador registrado nela, em modo somente leitura, sem poder editar nenhum campo.

#### Scenario: Mestre abre a ficha de um jogador
- **WHEN** o mestre acessa a rota de uma ficha da sua campanha
- **THEN** a UI exibe todas as seções da ficha (Geral, Combate, Talentos, Ataques, Perícias, Magias, Inventário, Notas) com os valores atuais, sem nenhum campo editável nem indicador de autosave

#### Scenario: Nenhum controle de edição disponível
- **WHEN** o mestre está na visualização somente leitura de uma ficha
- **THEN** a UI não oferece nenhum controle de edição (inputs habilitados, botões de adicionar/remover linha) em nenhuma seção

### Requirement: Nenhuma opção de exportar/importar arquivo
A UI SHALL NOT oferecer nenhum controle para exportar a ficha como arquivo ou importar uma ficha a partir de um arquivo local.

#### Scenario: Controles legados ausentes
- **WHEN** o usuário está no editor de ficha
- **THEN** não existem botões ou fluxos de "Exportar" ou "Importar" — qualquer cópia dos dados só é obtida através da API
