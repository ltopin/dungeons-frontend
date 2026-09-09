## MODIFIED Requirements

### Requirement: Autosave por seção com indicador de status
Ao editar um campo de uma seção 1:1 (Geral, Combate, configuração de Magias, Moedas, Notas), a UI SHALL persistir a mudança após uma pausa na digitação e exibir um indicador de status (salvando / salvo / erro) específico daquela seção. A UI SHALL manter o valor salvo mais recente disponível para aquela seção mesmo após a aba correspondente ser desmontada (por exemplo, ao trocar de aba) e remontada, sem exigir um novo carregamento de página. Ao desmontar a aba de uma seção com uma edição pendente de salvamento (ainda dentro da pausa de debounce), a UI SHALL disparar o salvamento dessa edição antes de descartar o estado local da aba.

#### Scenario: Edição salva com sucesso
- **WHEN** o usuário edita um campo de uma seção e para de digitar
- **THEN** a UI envia a atualização daquela seção e, ao confirmar, mostra um indicador de "salvo" para ela

#### Scenario: Falha ao salvar
- **WHEN** a atualização de uma seção falha ao ser enviada
- **THEN** a UI mostra um indicador de erro para aquela seção, mantém o valor editado no campo e permite tentar novamente

#### Scenario: Valor preservado ao trocar de aba e voltar
- **WHEN** o usuário edita um campo de uma seção, a edição é salva com sucesso, e o usuário troca para outra aba e depois volta para a aba original
- **THEN** a aba original exibe o valor editado, sem exigir um refresh de página

#### Scenario: Edição pendente ao trocar de aba
- **WHEN** o usuário edita um campo de uma seção e troca de aba antes da pausa de debounce disparar o salvamento automaticamente
- **THEN** a UI dispara o salvamento dessa edição pendente antes de desmontar a aba, de modo que a edição não seja perdida

### Requirement: CRUD imediato em linhas de seções de lista
Nas seções de lista (Talentos, Ataques, Perícias, Magias, Itens de inventário), a UI SHALL persistir imediatamente a criação e a remoção de uma linha, e persistir a edição de campos de uma linha existente com o mesmo comportamento de autosave com indicador por linha. A UI SHALL manter o estado mais recente da lista (incluindo linhas criadas, removidas e campos editados) disponível para aquela seção mesmo após a aba correspondente ser desmontada e remontada, sem exigir um novo carregamento de página.

#### Scenario: Adicionar linha
- **WHEN** o usuário adiciona uma nova linha a uma seção de lista
- **THEN** a UI persiste a criação imediatamente e passa a exibir a linha com o identificador retornado pela API

#### Scenario: Remover linha
- **WHEN** o usuário remove uma linha existente
- **THEN** a UI persiste a remoção imediatamente e deixa de exibir aquela linha

#### Scenario: Editar campo de linha existente
- **WHEN** o usuário edita um campo de uma linha existente e para de digitar
- **THEN** a UI envia a atualização daquela linha e mostra um indicador de status específico dela

#### Scenario: Lista preservada ao trocar de aba e voltar
- **WHEN** o usuário edita, adiciona ou remove uma linha em uma seção de lista, e depois troca para outra aba e volta para a aba original
- **THEN** a aba original exibe a lista com as mudanças persistidas, sem exigir um refresh de página
