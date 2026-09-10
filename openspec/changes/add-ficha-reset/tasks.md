## 1. API

- [ ] 1.1 Adicionar `resetarFicha(fichaId: string): Promise<Ficha>` em `src/api/sheets.ts`, chamando `POST /fichas/:fichaId/reset` e mapeando a resposta com o mesmo padrão de `obterFicha`

## 2. GeralTab

- [ ] 2.1 Adicionar botão "Reiniciar ficha" em `GeralTab`, visível apenas quando o novo prop `onReset` é passado (assim a visão do mestre, que não passa esse prop, nunca exibe o botão)
- [ ] 2.2 Adicionar modal de confirmação (texto explicando irreversibilidade, ações Cancelar/Confirmar), sem chamar `onReset` até a confirmação
- [ ] 2.3 Exibir estado de carregamento no botão de confirmar enquanto `onReset` está em andamento, e mensagem de erro no próprio modal se a promise rejeitar (mantendo o modal aberto)

## 3. CharacterSheetPage

- [ ] 3.1 Implementar o handler passado como `onReset` para `GeralTab`: chama `resetarFicha(ficha.id)`, atualiza o estado local `ficha`/`geralAoVivo` com o resultado e, em caso de sucesso, navega para `/campanhas/${id}/ficha/criar`
- [ ] 3.2 Não passar `onReset` para `GeralTab` quando a página estiver em modo de visualização do mestre (se aplicável ao componente usado nesse modo)

## 4. Testes

- [ ] 4.1 Teste: clicar em "Reiniciar ficha" abre o modal sem chamar a API
- [ ] 4.2 Teste: cancelar o modal não chama a API e não altera a ficha
- [ ] 4.3 Teste: confirmar o modal com sucesso navega para a rota da trilha de criação
- [ ] 4.4 Teste: confirmar o modal com falha na API mantém o modal aberto com mensagem de erro e não navega
