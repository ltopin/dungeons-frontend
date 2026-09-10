## ADDED Requirements

### Requirement: Iniciativa total
O sistema SHALL calcular a iniciativa total como `modificador de destreza + outros`.

#### Scenario: Iniciativa com modificador positivo de Destreza
- **WHEN** um personagem tem modificador de destreza +3 e outros +1
- **THEN** a iniciativa total calculada é +4

#### Scenario: Iniciativa com modificador negativo de Destreza
- **WHEN** um personagem tem modificador de destreza -1 e outros 0
- **THEN** a iniciativa total calculada é -1
