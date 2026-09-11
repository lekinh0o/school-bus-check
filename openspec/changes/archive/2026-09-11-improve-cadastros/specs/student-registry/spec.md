## ADDED Requirements

### Requirement: Foto do aluno
O sistema SHALL permitir anexar uma foto opcional do aluno. O formulário MUST mostrar a foto quando houver. Cada card da listagem MUST mostrar um avatar circular com a foto ou um placeholder se não houver foto.

#### Scenario: Salvar com foto
- **WHEN** o usuário escolhe uma foto e salva o aluno com os demais campos válidos
- **THEN** o aluno persistido guarda a referência da foto

#### Scenario: Card com avatar
- **WHEN** o aluno tem foto
- **THEN** o card da listagem exibe a foto em destaque circular

### Requirement: Telefones do aluno com máscara brasileira
Os telefones de contato do aluno MUST seguir a validação e máscara de telefone brasileiro com DDD e pelo menos 10 dígitos cada um.

#### Scenario: Dois telefones válidos
- **WHEN** os dois telefones obrigatórios têm pelo menos 10 dígitos e o restante do formulário é válido
- **THEN** o sistema persiste os telefones mascarados

#### Scenario: Telefone curto
- **WHEN** algum telefone obrigatório tem menos de 10 dígitos
- **THEN** o sistema MUST NOT persistir o aluno
