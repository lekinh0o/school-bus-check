## ADDED Requirements

### Requirement: Carteirinha ou matrícula opcional do aluno
O sistema SHALL permitir informar um identificador de negócio opcional de carteirinha/matrícula no cadastro do aluno. O valor MUST NOT substituir o identificador interno nem os vínculos por `id` (escola, rota, veículo, ponto de embarque). Campo em branco MUST ser omitido (ausente), não persistido como string vazia.

#### Scenario: Salvar com carteirinha
- **WHEN** o usuário informa carteirinha/matrícula junto com nome e vínculos estruturais válidos e salva
- **THEN** o aluno persistido guarda esse código e um identificador interno distinto, e os vínculos continuam usando os ids internos

#### Scenario: Salvar sem carteirinha
- **WHEN** o campo de carteirinha/matrícula está vazio e o restante obrigatório está válido e o usuário salva
- **THEN** o sistema persiste o aluno sem esse código

#### Scenario: Reabrir aluno sem carteirinha
- **WHEN** um aluno persistido antes desta alteração é aberto para edição
- **THEN** o formulário carrega os dados existentes, o campo permanece vazio e o usuário consegue salvar sem preenchê-lo

## MODIFIED Requirements

### Requirement: Listagem de alunos cadastrados
O sistema SHALL exibir todos os alunos persistidos. Cada item MUST mostrar o nome, o nome da escola, a identificação da rota e o assento no veículo. Série e carteirinha/matrícula MUST aparecer apenas quando preenchidas. Aluno sem série MUST continuar listável. Escola ou rota ausente MUST ser indicada sem impedir a listagem.

#### Scenario: Lista com alunos
- **WHEN** existem um ou mais alunos cadastrados
- **THEN** cada aluno aparece em um card com nome, nome da escola (ou indicação de escola ausente), identificação da rota (ou indicação de rota ausente) e o número do assento

#### Scenario: Aluno sem série
- **WHEN** o aluno não tem série preenchida
- **THEN** o card omite a série ou mostra indicação de ausência, sem impedir edição ou exclusão

#### Scenario: Lista vazia
- **WHEN** não há alunos cadastrados
- **THEN** o sistema mostra um estado vazio compreensível e ainda oferece ação para adicionar um aluno

### Requirement: Criar aluno com vínculos em cadeia
O sistema SHALL permitir criar um aluno informando nome, escola, rota daquela escola, ponto de embarque, veículo e um assento livre. Idade, responsável, telefones de contato, série e carteirinha/matrícula são opcionais. O identificador MUST ser gerado no cliente. O sistema MUST incluir o id do aluno em `studentIds` da escola escolhida e MUST ocupar o assento escolhido no veículo. O ponto escolhido MUST ser persistido no aluno como `boardingPoint`. Relacionamento com escola, rota ou veículo inexistente MUST impedir o persistir; campo descritivo vazio MUST NOT ser tratado como relacionamento inválido.

#### Scenario: Salvamento de novo aluno
- **WHEN** o usuário preenche o nome, escolhe escola, rota, ponto de embarque, veículo e um assento livre e salva
- **THEN** o sistema persiste o aluno com `boardingPoint`, ocupa o assento com o id do aluno, inclui o id na escola e retorna à tela anterior

#### Scenario: Salvamento sem descritivos
- **WHEN** idade, responsável, telefones, série e carteirinha/matrícula estão vazios, o nome e os vínculos estruturais são válidos e o usuário salva
- **THEN** o sistema persiste o aluno e MUST NOT recusar o salvamento por esses campos descritivos vazios

#### Scenario: Formulário incompleto
- **WHEN** falta nome, escola, rota, ponto de embarque, veículo ou assento válido
- **THEN** o sistema MUST NOT persistir o aluno nem ocupar assento

#### Scenario: Relacionamento inválido
- **WHEN** a escola, a rota ou o veículo escolhido não existe no estado persistido
- **THEN** o sistema MUST NOT persistir o aluno, mesmo que os campos descritivos estejam preenchidos

### Requirement: Telefones do aluno com máscara brasileira
Quando um telefone de contato do aluno está preenchido, ele MUST seguir a validação e máscara de telefone brasileiro com DDD e pelo menos 10 dígitos. Telefone vazio MUST ser omitido da lista persistida e MUST NOT impedir o salvamento. O sistema MUST NOT exigir dois telefones.

#### Scenario: Sem telefones
- **WHEN** os telefones estão vazios e o restante obrigatório do formulário é válido
- **THEN** o sistema persiste o aluno sem telefones de contato

#### Scenario: Um telefone válido
- **WHEN** um telefone tem pelo menos 10 dígitos, o outro está vazio e o restante do formulário obrigatório é válido
- **THEN** o sistema persiste somente o telefone mascarado preenchido

#### Scenario: Telefone curto
- **WHEN** algum telefone preenchido tem menos de 10 dígitos
- **THEN** o sistema MUST NOT persistir o aluno
