## 1. API client

- [x] 1.1 Em `src/api/types.ts`, `CampanhaDisponivel` ganha `descricao?: string` e `mestre_nome?: string`
- [x] 1.2 Em `src/api/campaigns.ts`, `criarCampanha` passa a aceitar um segundo parâmetro opcional `descricao?: string` e enviá-lo no corpo do `POST /campanhas`
- [x] 1.3 Atualizar `src/api/campaigns.test.ts` para cobrir `criarCampanha` com e sem descrição

## 2. Formulário de criar campanha (NewCampaignPage)

- [x] 2.1 Adicionar campo "Descrição" (textarea, opcional) abaixo de "Nome da campanha"
- [x] 2.2 Enviar a descrição preenchida (ou `undefined` se vazia) para `criarCampanha` ao submeter

## 3. Lista de campanhas abertas (CampaignsListPage)

- [x] 3.1 Exibir `mestre_nome` em cada card de campanha aberta (ex.: "Mestre: {nome}")
- [x] 3.2 Exibir `descricao` quando presente; omitir a linha inteira quando ausente, sem placeholder do tipo "Sem descrição"
- [x] 3.3 Ajustar `.campaigns-screen__campaign-info` / `.campaigns-screen__campaign-meta` em `src/styles.css` para acomodar até duas linhas de metadado sem quebrar o alinhamento do botão "Entrar"

## 4. Testes

- [x] 4.1 Em `CampaignFlow.test.tsx`, atualizar o mock de `listarCampanhasAbertas` para incluir `mestre_nome`/`descricao` e verificar que aparecem na tela
- [x] 4.2 Teste: campanha aberta sem descrição não mostra placeholder de "sem descrição"
