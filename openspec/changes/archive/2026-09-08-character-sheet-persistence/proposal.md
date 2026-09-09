## Why

Hoje `dungeons-frontend` não tem código de aplicação — o único artefato existente é um protótipo de ficha de D&D 3.5 em React com estado local e export/import manual de JSON, sem noção de campanha, convite ou múltiplas contas. Em paralelo, `dungeons-api` definiu (change `character-sheet-persistence` nesse repositório) o modelo de campanhas/membership e o schema normalizado por seção da ficha, com endpoints REST granulares por seção. Este change adapta o protótipo para consumir esse contrato: criar/entrar em campanha por código, editar a ficha com autosave por seção contra a API, e eliminar qualquer persistência client-side.

## What Changes

- Introduz as telas de campanha: mestre cria campanha e gera/revoga código de convite; jogador entra numa campanha usando um código.
- Introduz um dashboard do mestre listando o resumo das fichas registradas na sua campanha.
- Adapta o protótipo de ficha existente para carregar e salvar cada seção (Geral, Combate, Talentos, Ataques, Perícias, Magias, Inventário, Notas) via chamadas à API, com autosave debounced por seção — substituindo o `useState` local como fonte de verdade.
- **BREAKING**: remove os botões "Exportar" e "Importar" e todo o código de leitura/escrita de arquivo JSON — a API passa a ser a única fonte de verdade da ficha.
- Fica fora de escopo: telas de login/cadastro e o mecanismo de autenticação em si — assume-se uma sessão autenticada via um placeholder/mock, até que autenticação seja definida em um change dedicado (ver design.md).

## Capabilities

### New Capabilities
- `campaigns`: telas de criação de campanha, geração/uso de convite por código, e dashboard do mestre com as fichas da campanha.
- `character-sheets`: adaptação do editor de ficha existente para carregar e persistir cada seção via API, com autosave debounced e sem nenhuma persistência local.

### Modified Capabilities
(nenhuma — repositório não tinha specs anteriores)

## Impact

- Substitui a única fonte de estado do protótipo (`useState(emptySheet())` + export/import JSON) por chamadas HTTP à API definida em `dungeons-api`.
- Introduz a necessidade de um roteador (múltiplas telas: campanha, dashboard, ficha) onde hoje existe um único componente de página.
- Depende do contrato de `dungeons-api` (change `character-sheet-persistence` naquele repositório) para os endpoints de campanha/convite e de seção da ficha; qualquer mudança de forma nesse contrato impacta diretamente este change.
- Autenticação real é uma dependência externa ainda não definida; este change usa um placeholder de sessão para não bloquear o desenvolvimento da UI de campanha/ficha.
