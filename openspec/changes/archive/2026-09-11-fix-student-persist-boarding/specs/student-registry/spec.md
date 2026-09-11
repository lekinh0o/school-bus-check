## ADDED Requirements

### Requirement: Aluno visível após salvar
O sistema SHALL persistir o aluno no estado global ao salvar o formulário válido. Após voltar da tela de criação ou edição, a listagem MUST mostrar esse aluno. O assento escolhido MUST aparecer ocupado por esse aluno no mapa do veículo.

#### Scenario: Criar aluno e ver na lista
- **WHEN** o usuário preenche o formulário válido, escolhe assento livre e salva
- **THEN** o aluno aparece na listagem de alunos após o retorno

#### Scenario: Assento ocupado após salvar
- **WHEN** o aluno foi salvo com um assento
- **THEN** esse assento fica associado ao id do aluno no veículo e não pode ser escolhido por outro aluno

## MODIFIED Requirements

### Requirement: Rua de embarque a partir da rota
O sistema SHALL tratar a rua de embarque como texto livre. Após escolher a rota, MUST mostrar as ruas já existentes em `streetsCovered` como sugestões tocáveis. O usuário MUST conseguir digitar uma rua que ainda não está na lista. Rua em branco MUST NOT ser aceita. Se a rua salva ainda não existir na rota, o sistema MUST acrescentá-la ao final de `streetsCovered`.

#### Scenario: Sugestão da rota
- **WHEN** o usuário escolhe uma rota que já tem ruas e toca uma sugestão
- **THEN** o campo de rua de embarque fica com aquele nome

#### Scenario: Digitar rua nova
- **WHEN** o usuário digita uma rua que não está em `streetsCovered` e salva o aluno
- **THEN** o aluno fica com essa rua e a rota passa a incluir essa rua no fim da lista

#### Scenario: Rua em branco
- **WHEN** o campo de rua está vazio
- **THEN** o sistema MUST NOT persistir o aluno
