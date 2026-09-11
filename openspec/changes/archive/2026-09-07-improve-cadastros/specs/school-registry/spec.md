## MODIFIED Requirements

### Requirement: Listagem de escolas cadastradas
O sistema SHALL exibir todas as escolas persistidas. Cada item MUST mostrar o nome da escola, o nome do diretor(a) e um resumo com a quantidade de alunos vinculados e a quantidade de rotas vinculadas. A quantidade de rotas MUST refletir os identificadores de rota realmente associados à escola após criar, reatribuir ou excluir rotas. A quantidade de alunos MUST refletir os identificadores de aluno realmente associados à escola após criar, reatribuir ou excluir alunos. Se a escola tiver foto, o card MUST mostrar a miniatura; se não tiver, MUST mostrar um espaço visual vazio ou placeholder sem quebrar o layout.

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

#### Scenario: Card com foto
- **WHEN** a escola persistida tem foto
- **THEN** o card exibe a miniatura dessa foto junto do nome

### Requirement: Criar escola
O sistema SHALL permitir criar uma escola informando nome, endereço, diretor(a) e telefone válido no padrão brasileiro. A foto da escola é opcional. Na criação, as listas de alunos e rotas vinculadas MUST iniciar vazias. O identificador MUST ser gerado no cliente.

#### Scenario: Salvamento de nova escola
- **WHEN** o usuário abre o formulário de nova escola, preenche nome, endereço, diretor(a) e telefone válido e salva
- **THEN** o sistema persiste a escola com identificador único, `studentIds` e `routeIds` vazios, e retorna à tela anterior

#### Scenario: Formulário incompleto
- **WHEN** nome, endereço, diretor(a) está vazio ou o telefone não atende a validação brasileira
- **THEN** o sistema MUST NOT persistir a escola

#### Scenario: Salvar com foto
- **WHEN** o usuário escolhe uma foto da escola e salva com os demais campos válidos
- **THEN** a escola persistida guarda a referência da foto

### Requirement: Editar escola
O sistema SHALL permitir abrir uma escola existente no formulário, com os campos e a foto atuais, e salvar alterações de nome, endereço, diretor(a), telefone e foto sem apagar os vínculos de alunos e rotas já existentes.

#### Scenario: Abrir edição
- **WHEN** o usuário escolhe editar uma escola da lista
- **THEN** o sistema abre o formulário com os dados atuais daquela escola, incluindo a foto se houver

#### Scenario: Salvar edição
- **WHEN** o usuário altera campos de texto ou a foto e salva
- **THEN** o sistema atualiza esses campos, preserva `studentIds` e `routeIds`, e retorna à tela anterior
