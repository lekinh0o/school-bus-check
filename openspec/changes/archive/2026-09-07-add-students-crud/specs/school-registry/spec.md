## MODIFIED Requirements

### Requirement: Listagem de escolas cadastradas
O sistema SHALL exibir todas as escolas persistidas. Cada item MUST mostrar o nome da escola, o nome do diretor(a) e um resumo com a quantidade de alunos vinculados e a quantidade de rotas vinculadas. A quantidade de rotas MUST refletir os identificadores de rota realmente associados à escola após criar, reatribuir ou excluir rotas. A quantidade de alunos MUST refletir os identificadores de aluno realmente associados à escola após criar, reatribuir ou excluir alunos.

#### Scenario: Lista com escolas
- **WHEN** existem uma ou mais escolas cadastradas
- **THEN** cada escola aparece em um card com nome, diretor(a) e o texto no formato `N Alunos | M Rotas` usando as quantidades de vínculos armazenados

#### Scenario: Lista vazia
- **WHEN** não há escolas cadastradas
- **THEN** o sistema mostra um estado vazio compreensível e ainda oferece ação para adicionar uma escola

#### Scenario: Contagem após cadastro de rota
- **WHEN** o usuário cadastra uma rota vinculada a uma escola e volta à listagem de escolas
- **THEN** o resumo daquela escola mostra uma rota a mais do que antes do cadastro

#### Scenario: Contagem após cadastro de aluno
- **WHEN** o usuário cadastra um aluno vinculado a uma escola e volta à listagem de escolas
- **THEN** o resumo daquela escola mostra um aluno a mais do que antes do cadastro
