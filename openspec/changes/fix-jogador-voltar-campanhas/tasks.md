## 1. Ficha do jogador

- [x] 1.1 `src/routes/CharacterSheetPage.tsx`: trocar o `Link` "Voltar à campanha" (`to={`/campanhas/${id}`}`) por `to="/campanhas"` com o texto "Voltar às campanhas"

## 2. Trilha de criação de personagem

- [x] 2.1 `src/wizard/CharacterWizardPage.tsx`: trocar o `Link` "Voltar à campanha" (`to={`/campanhas/${id}`}`) por `to="/campanhas"` com o texto "Voltar às campanhas"

## 3. História da campanha

- [x] 3.1 `src/routes/CampaignLorePage.tsx`: trocar o `Link` "Voltar à campanha" (`to={`/campanhas/${id}`}`) por `to="/campanhas"` com o texto "Voltar às campanhas"

## 4. Testes

- [x] 4.1 Atualizar `CharacterSheetPage.test.tsx` (ou `CampaignFlow.test.tsx`, onde estiver a cobertura) para verificar o novo destino/texto do link
- [x] 4.2 Atualizar `CampaignLorePage.test.tsx` para verificar o novo destino/texto do link
- [x] 4.3 Verificar se há teste equivalente para `CharacterWizardPage.tsx`; se não houver cobertura desse link, não é necessário criar uma só para isso
- [x] 4.4 Rodar a suíte completa (`npm test` ou equivalente) e confirmar que tudo passa

## 5. Verificação manual

- [x] 5.1 Logar como jogador, abrir a ficha, clicar em "Voltar às campanhas" e confirmar que cai em `/campanhas` (não num loop de volta à ficha)
- [x] 5.2 Repetir o mesmo teste a partir da trilha de criação de personagem e da história da campanha
- [x] 5.3 Confirmar que o mestre continua conseguindo voltar normalmente pelo `MasterDashboard` (não deve ter mudado)
