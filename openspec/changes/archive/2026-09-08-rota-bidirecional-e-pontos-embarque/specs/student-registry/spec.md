## MODIFIED Requirements

### Requirement: Criar aluno com vínculos em cadeia
O sistema SHALL permitir criar um aluno informando nome, idade numérica, responsável, no mínimo dois telefones de contato, série, escola, rota daquela escola, ponto de embarque, veículo e um assento livre. O identificador MUST ser gerado no cliente. O sistema MUST incluir o id do aluno em `studentIds` da escola escolhida e MUST ocupar o assento escolhido no veículo. O ponto escolhido MUST ser persistido no aluno como `boardingPoint`.

#### Scenario: Salvamento de novo aluno
- **WHEN** o usuário preenche os campos obrigatórios, escolhe escola, rota, ponto de embarque, veículo e um assento livre e salva
- **THEN** o sistema persiste o aluno com `boardingPoint`, ocupa o assento com o id do aluno, inclui o id na escola e retorna à tela anterior

#### Scenario: Formulário incompleto
- **WHEN** falta nome, idade válida, responsável, dois telefones não vazios, série, escola, rota, ponto de embarque, veículo ou assento válido
- **THEN** o sistema MUST NOT persistir o aluno nem ocupar assento

### Requirement: Rua de embarque a partir da rota
O sistema SHALL tratar o ponto de embarque como texto livre, com rótulo “Ponto de embarque”. Após escolher a rota, MUST mostrar os `boardingPoints` já existentes como sugestões tocáveis. O usuário MUST conseguir digitar um ponto que ainda não está na lista. Ponto em branco MUST NOT ser aceito. Se o texto salvo ainda não existir na rota, o sistema MUST acrescentá-lo ao final de `boardingPoints` e persistir a rota.

#### Scenario: Sugestão da rota
- **WHEN** o usuário escolhe uma rota que já tem pontos e toca uma sugestão
- **THEN** o campo de ponto de embarque fica com aquele nome

#### Scenario: Digitar rua nova
- **WHEN** o usuário digita um ponto que não está em `boardingPoints` e salva o aluno
- **THEN** o aluno fica com esse `boardingPoint` e a rota passa a incluir esse ponto no fim da lista

#### Scenario: Rua em branco
- **WHEN** o campo de ponto de embarque está vazio
- **THEN** o sistema MUST NOT persistir o aluno
