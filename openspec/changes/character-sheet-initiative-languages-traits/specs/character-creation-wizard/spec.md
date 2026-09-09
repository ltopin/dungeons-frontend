## ADDED Requirements

### Requirement: Qualidades especiais de raça e classe gravadas automaticamente

Ao confirmar a etapa Raça e Classe com uma raça e uma classe escolhidas, o sistema SHALL gravar automaticamente, como linhas de talentos com categoria `qualidade_especial`, cada traço de `raca.tracos` e cada característica de `classe.caracteristicas` com `nivel === 1`, usando o nome e a descrição vindos do compêndio. O sistema SHALL NOT criar uma linha duplicada quando já existir uma linha de talento com o mesmo nome. O sistema SHALL NOT remover ou ressincronizar automaticamente linhas já gravadas quando o jogador trocar de raça ou classe depois de confirmar a etapa.

#### Scenario: Confirmar raça e classe pela primeira vez

- **WHEN** o jogador escolhe uma raça e uma classe e confirma a etapa Raça e Classe
- **THEN** o sistema grava uma linha de qualidade especial para cada traço da raça e para cada característica de nível 1 da classe, visível na aba Talentos e Qualidades Especiais da ficha

#### Scenario: Confirmar novamente sem mudanças

- **WHEN** o jogador retorna à etapa Raça e Classe (sem trocar raça nem classe) e confirma de novo
- **THEN** o sistema não duplica nenhuma linha de qualidade especial já existente com o mesmo nome

#### Scenario: Trocar de raça ou classe após já ter confirmado

- **WHEN** o jogador troca a raça ou a classe escolhida e confirma novamente a etapa
- **THEN** o sistema grava as qualidades especiais da nova raça/classe que ainda não existem como linha, e mantém as linhas já gravadas anteriormente (inclusive as da escolha anterior), sem removê-las automaticamente
