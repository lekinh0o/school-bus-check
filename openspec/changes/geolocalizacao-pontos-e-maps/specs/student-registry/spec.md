## MODIFIED Requirements

### Requirement: Rua de embarque a partir da rota
O sistema SHALL tratar o ponto de embarque do aluno como texto livre (o **nome** do ponto), com rótulo “Ponto de embarque”. Após escolher a rota, MUST mostrar os pontos já existentes na rota como sugestões tocáveis, usando o nome de cada ponto. O usuário MUST conseguir digitar um ponto que ainda não está na lista. Ponto em branco MUST NOT ser aceito. Se o texto salvo ainda não existir na rota (comparando pelo nome), o sistema MUST acrescentar um ponto estruturado ao final de `boardingPoints` (sem coordenadas) e persistir a rota.

#### Scenario: Sugestão da rota
- **WHEN** o usuário escolhe uma rota que já tem pontos e toca uma sugestão
- **THEN** o campo de ponto de embarque fica com aquele nome

#### Scenario: Digitar rua nova
- **WHEN** o usuário digita um ponto que não está em `boardingPoints` e salva o aluno
- **THEN** o aluno fica com esse `boardingPoint` e a rota passa a incluir esse ponto no fim da lista, sem latitude/longitude

#### Scenario: Rua em branco
- **WHEN** o campo de ponto de embarque está vazio
- **THEN** o sistema MUST NOT persistir o aluno
