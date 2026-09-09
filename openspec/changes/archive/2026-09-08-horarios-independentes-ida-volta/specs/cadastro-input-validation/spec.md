## MODIFIED Requirements

### Requirement: Horário no formato HH:MM
O sistema SHALL aceitar os horários da rota apenas como hora `HH:MM` com hora 00–23 e minuto 00–59. Isso MUST aplicar-se aos quatro campos: início e término da ida e início e término da volta.

#### Scenario: Horário válido
- **WHEN** os quatro horários estão em `HH:MM` válido e o usuário salva a rota
- **THEN** o sistema persiste esses horários

#### Scenario: Horário inválido
- **WHEN** qualquer um dos quatro horários não é `HH:MM` válido
- **THEN** o sistema MUST NOT persistir a rota
