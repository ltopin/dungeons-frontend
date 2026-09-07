## 1. Estrutura do app

- [x] 1.1 Inicializar o projeto (Vite + React) e dependências de roteamento
- [x] 1.2 Configurar rotas: `/login`, `/campanhas`, `/campanhas/nova`, `/campanhas/entrar`, `/campanhas/:id`, `/campanhas/:id/ficha`
- [x] 1.3 Criar módulo isolado de sessão placeholder (conta atual, sem senha) usado até a autenticação real existir
- [x] 1.4 Criar cliente HTTP fino para os endpoints de `dungeons-api`

## 2. Capacidade: campaigns

- [x] 2.1 Tela "criar campanha" (nome, validação de campo obrigatório)
- [x] 2.2 Tela de campanha: gerar convite e exibir/copiar código
- [x] 2.3 Ação de revogar convite ativo na tela da campanha
- [x] 2.4 Tela "entrar em campanha" (input de código, tratamento de erro para código inválido/inativo)
- [x] 2.5 Dashboard do mestre: lista de resumo das fichas da campanha, com estado vazio quando não há jogadores
- [x] 2.6 Roteamento condicional por papel: jogador acessando `/campanhas/:id` é redirecionado para `/campanhas/:id/ficha`

## 3. Capacidade: character-sheets — carregamento e estrutura

- [x] 3.1 Adaptar o componente de ficha existente para buscar todas as seções via `GET /fichas/:id` no lugar de `emptySheet()`
- [x] 3.2 Estado de carregamento enquanto a ficha não chegou da API
- [x] 3.3 Estado de erro de carregamento (sem cair para formulário vazio)
- [x] 3.4 Remover `exportJSON`, `handleImportFile`, `fileInputRef` e os botões "Exportar"/"Importar"

## 4. Capacidade: character-sheets — autosave

- [x] 4.1 Hook de autosave debounced por seção 1:1 (Geral, Combate, Magias-config, Moedas, Notas), com estado salvando/salvo/erro
- [x] 4.2 Indicador visual de status por seção nas abas correspondentes
- [x] 4.3 CRUD imediato de linha para seções de lista (Talentos, Ataques, Perícias, Magias, Itens): criar e remover disparam chamada imediata
- [x] 4.4 Autosave debounced por linha para edição de campos de uma linha existente, com indicador de status por linha
- [x] 4.5 Tratamento de falha de save: manter valor editado no campo e permitir nova tentativa

## 5. Testes

- [x] 5.1 Testes de fluxo: criar campanha, gerar/revogar convite, entrar com código válido/inválido
- [x] 5.2 Testes de roteamento por papel (mestre → dashboard; jogador → ficha)
- [x] 5.3 Testes de autosave por seção (sucesso e falha) e de CRUD por linha
- [x] 5.4 Teste confirmando ausência de qualquer controle de exportar/importar arquivo
