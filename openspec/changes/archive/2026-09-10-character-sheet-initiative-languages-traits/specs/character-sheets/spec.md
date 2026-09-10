## MODIFIED Requirements

### Requirement: Campos derivados são somente-leitura e recalculam ao vivo
Os campos cujo valor é definido por uma regra do ruleset (CA total/toque/surpreendido, testes de resistência total, bônus de ataque corpo a corpo/distância, CMB, CMD, iniciativa total, total de perícia, CD de magia, capacidade de carga) SHALL ser exibidos como somente-leitura na UI, recalculados imediatamente (sem esperar o debounce do autosave) sempre que um input do qual dependem muda.

#### Scenario: Campo derivado não aceita digitação
- **WHEN** o usuário tenta clicar/digitar em um campo derivado (ex: CA total)
- **THEN** o campo não aceita entrada direta

#### Scenario: Recalculo imediato entre seções
- **WHEN** o usuário altera o valor de destreza na seção Geral
- **THEN** a CA total e a CA de toque exibidas na seção Combate atualizam imediatamente na tela, antes mesmo do autosave da seção Geral confirmar

#### Scenario: Iniciativa recalcula ao mudar Destreza
- **WHEN** o usuário altera o valor de destreza na seção Geral
- **THEN** a iniciativa total exibida na seção Combate atualiza imediatamente na tela, antes mesmo do autosave da seção Geral confirmar

## ADDED Requirements

### Requirement: Edição do campo de Idiomas na seção Geral
A UI SHALL oferecer, na seção Geral, um campo de texto livre "Idiomas" junto aos demais campos de identidade, editável pelo jogador com o mesmo comportamento de autosave das demais seções 1:1.

#### Scenario: Jogador preenche idiomas
- **WHEN** o jogador digita um texto no campo de Idiomas e para de digitar
- **THEN** a UI persiste o campo junto com a seção Geral e mostra o indicador de "salvo"

#### Scenario: Mestre vê idiomas na leitura
- **WHEN** o mestre abre a visualização somente leitura da ficha na aba Geral
- **THEN** o campo de Idiomas aparece com o valor atual, sem controle de edição
