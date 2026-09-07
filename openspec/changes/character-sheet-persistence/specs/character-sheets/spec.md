## Purpose

Define o comportamento observável do editor de ficha ao consumir a API por seção — carregamento, autosave com indicador de status, CRUD de linhas de lista, e a ausência total de qualquer persistência local.

## ADDED Requirements

### Requirement: Carregamento inicial via API
Ao abrir o editor de uma ficha, a UI SHALL carregar todas as suas seções a partir da API antes de exibir os campos como editáveis.

#### Scenario: Carregamento bem-sucedido
- **WHEN** o usuário abre o editor de uma ficha existente
- **THEN** a UI exibe um estado de carregamento e, ao concluir, preenche todas as seções com os dados retornados pela API

#### Scenario: Falha ao carregar
- **WHEN** a requisição de carregamento da ficha falha
- **THEN** a UI exibe uma mensagem de erro e não apresenta um formulário vazio como se fosse uma ficha nova

### Requirement: Autosave por seção com indicador de status
Ao editar um campo de uma seção 1:1 (Geral, Combate, configuração de Magias, Moedas, Notas), a UI SHALL persistir a mudança após uma pausa na digitação e exibir um indicador de status (salvando / salvo / erro) específico daquela seção.

#### Scenario: Edição salva com sucesso
- **WHEN** o usuário edita um campo de uma seção e para de digitar
- **THEN** a UI envia a atualização daquela seção e, ao confirmar, mostra um indicador de "salvo" para ela

#### Scenario: Falha ao salvar
- **WHEN** a atualização de uma seção falha ao ser enviada
- **THEN** a UI mostra um indicador de erro para aquela seção, mantém o valor editado no campo e permite tentar novamente

### Requirement: CRUD imediato em linhas de seções de lista
Nas seções de lista (Talentos, Ataques, Perícias, Magias, Itens de inventário), a UI SHALL persistir imediatamente a criação e a remoção de uma linha, e persistir a edição de campos de uma linha existente com o mesmo comportamento de autosave com indicador por linha.

#### Scenario: Adicionar linha
- **WHEN** o usuário adiciona uma nova linha a uma seção de lista
- **THEN** a UI persiste a criação imediatamente e passa a exibir a linha com o identificador retornado pela API

#### Scenario: Remover linha
- **WHEN** o usuário remove uma linha existente
- **THEN** a UI persiste a remoção imediatamente e deixa de exibir aquela linha

#### Scenario: Editar campo de linha existente
- **WHEN** o usuário edita um campo de uma linha existente e para de digitar
- **THEN** a UI envia a atualização daquela linha e mostra um indicador de status específico dela

### Requirement: Nenhuma opção de exportar/importar arquivo
A UI SHALL NOT oferecer nenhum controle para exportar a ficha como arquivo ou importar uma ficha a partir de um arquivo local.

#### Scenario: Controles legados ausentes
- **WHEN** o usuário está no editor de ficha
- **THEN** não existem botões ou fluxos de "Exportar" ou "Importar" — qualquer cópia dos dados só é obtida através da API
