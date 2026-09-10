## MODIFIED Requirements

### Requirement: Entrada no assistente para ficha nova

O sistema SHALL direcionar o jogador ao assistente de criação quando, na carga inicial da ficha, o nome do personagem, a classe e a raça estiverem todos vazios ou nulos, e SHALL manter essa decisão de roteamento fixa durante a sessão de edição (sem recomputar a cada sincronização de autosave).

Quando a campanha tem um mundo vinculado, antes de direcionar ao assistente o sistema SHALL buscar os elementos de história publicados desse mundo. Havendo pelo menos um elemento publicado, o sistema SHALL exibir uma tela de boas-vindas com essa história em vez de ir direto ao assistente, e só SHALL navegar ao assistente depois que o jogador confirmar nessa tela. Sem mundo vinculado, com mundo vinculado mas sem nenhum elemento publicado, ou se a busca da história falhar, o sistema SHALL manter o comportamento direto de ir ao assistente sem tela intermediária.

#### Scenario: Jogador entra numa campanha com ficha em branco
- **WHEN** um jogador acessa a ficha de uma campanha sem mundo vinculado e nome do personagem, classe e raça estão todos vazios ou nulos
- **THEN** o sistema exibe o assistente de criação de personagem diretamente, sem tela intermediária

#### Scenario: Jogador com personagem já iniciado acessa a ficha
- **WHEN** um jogador acessa a ficha de uma campanha e nome do personagem, classe ou raça já têm algum valor
- **THEN** o sistema exibe a ficha manual diretamente, sem redirecionar para o assistente e sem buscar história do mundo

#### Scenario: Ficha em branco numa campanha com mundo sem história publicada
- **WHEN** um jogador acessa a ficha em branco de uma campanha cujo mundo vinculado não tem nenhum elemento de história publicado
- **THEN** o sistema exibe o assistente de criação de personagem diretamente, sem tela intermediária

#### Scenario: Falha ao buscar a história publicada
- **WHEN** um jogador acessa a ficha em branco de uma campanha com mundo vinculado e a busca dos elementos publicados falha
- **THEN** o sistema exibe o assistente de criação de personagem diretamente, sem bloquear o jogador por causa do erro

## ADDED Requirements

### Requirement: Tela de boas-vindas com a história do mundo antes do assistente

Quando há pelo menos um elemento de história publicado, o sistema SHALL exibir, antes do assistente, uma tela listando esses elementos agrupados por categoria, e SHALL oferecer uma ação explícita para prosseguir à criação do personagem.

#### Scenario: Jogador lê a história e prossegue
- **WHEN** o jogador está na tela de boas-vindas de uma campanha com história publicada e aciona a ação de prosseguir
- **THEN** o sistema navega para o assistente de criação de personagem

#### Scenario: Jogador sai sem prosseguir
- **WHEN** o jogador sai da tela de boas-vindas sem acionar a ação de prosseguir
- **THEN** o sistema não avança para o assistente, e a ficha permanece em branco para ser retomada depois (inclusive vendo a mesma tela de boas-vindas novamente, já que a ficha continua sem nome, classe ou raça)
