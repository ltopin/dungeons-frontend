## 1. `src/api/worlds.ts`

- [x] 1.1 `editarElemento(mundoId, elementoId, dados)` passa a chamar `PATCH /mundos/${mundoId}/elementos/${elementoId}` (adiciona o parâmetro `mundoId`)
- [x] 1.2 `publicarElemento(mundoId, elementoId)` passa a chamar `POST /mundos/${mundoId}/elementos/${elementoId}/publicar` (adiciona o parâmetro `mundoId`)
- [x] 1.3 `listarElementosPublicadosDaCampanha(campanhaId)` passa a chamar `GET /campanhas/${campanhaId}/mundo/elementos` (era `/historia`)

## 2. `src/api/campaigns.ts`

- [x] 2.1 `criarCampanha` envia `mundo_id` (snake_case) no corpo do `POST /campanhas` em vez de `mundoId`
- [x] 2.2 `vincularMundoACampanha` passa a usar `method: 'PATCH'` (era `POST`) e enviar `{ mundo_id: mundoId }` no corpo em vez de `{ mundoId }`

## 3. Componentes consumidores

- [x] 3.1 `WorldPage.tsx`: `handleSubmit` (edição) e `handlePublicar` passam a enviar `mundoId` (já disponível via `useParams`) para `editarElemento`/`publicarElemento`

## 4. Testes

- [x] 4.1 Atualizar `src/api/worlds.test.ts`: `editarElemento`/`publicarElemento` verificam a nova URL com `mundoId`; `listarElementosPublicadosDaCampanha` verifica a URL `/campanhas/:id/mundo/elementos`
- [x] 4.2 Atualizar (ou criar, se não existir) teste de `src/api/campaigns.ts` cobrindo `criarCampanha` (corpo com `mundo_id`) e `vincularMundoACampanha` (método `PATCH`, corpo com `mundo_id`)
- [x] 4.3 Atualizar `src/routes/WorldPage.test.tsx` para as novas assinaturas/mocks de `editarElemento`/`publicarElemento`
- [x] 4.4 Atualizar `src/routes/MasterDashboard.test.tsx` se algum mock de `vincularMundoACampanha` depender do método/corpo antigo
- [x] 4.5 Rodar a suíte completa (`npm test` ou equivalente) e confirmar que tudo passa

## 5. Verificação manual

- [x] 5.1 Com o `dungeons-api` real rodando localmente, testar manualmente: editar um elemento, publicar um elemento, ver "História da campanha" como jogador, vincular/trocar mundo no `MasterDashboard` — confirmar que nenhuma dessas ações retorna 404
