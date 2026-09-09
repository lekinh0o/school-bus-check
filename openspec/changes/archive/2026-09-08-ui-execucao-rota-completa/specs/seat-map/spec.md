## ADDED Requirements

### Requirement: Foto e alerta de ausência na planta em execução
Quando a planta for exibida durante a execução da rota, cada assento ocupado MUST mostrar a foto do aluno vinculado (ou placeholder). Se esse aluno estiver ausente na sessão de execução, o assento MUST ter borda amarela grossa. A planta de cadastro de veículo e de escolha de assento do aluno MUST NOT exigir essa borda amarela.

#### Scenario: Ausente na van em execução
- **WHEN** a planta é mostrada na tab Resumo da execução e o aluno do assento está ausente
- **THEN** o assento mostra a foto (ou placeholder) com borda amarela grossa

#### Scenario: Presente ou pendente no mapa
- **WHEN** o aluno do assento não está ausente
- **THEN** o assento não usa a borda amarela de ausência
