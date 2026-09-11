## Purpose

Permite cadastrar, listar, editar e excluir alunos no aplicativo de transporte escolar, vinculando cada aluno a escola, rota, rua de embarque, veículo e assento, a partir do dashboard de Cadastros.

## ADDED Requirements

### Requirement: Acesso aos alunos a partir de Cadastros
O sistema SHALL permitir que o usuário abra a listagem de alunos a partir do card Alunos no dashboard de Cadastros.

#### Scenario: Card Alunos habilitado
- **WHEN** o usuário está em Cadastros e toca o card Alunos
- **THEN** o sistema navega para a tela de listagem de alunos

### Requirement: Listagem de alunos cadastrados
O sistema SHALL exibir todos os alunos persistidos. Cada item MUST mostrar o nome, a série, o nome da escola, a identificação da rota e o assento no veículo.

#### Scenario: Lista com alunos
- **WHEN** existem um ou mais alunos cadastrados
- **THEN** cada aluno aparece em um card com nome, série, nome da escola (ou indicação de escola ausente), identificação da rota (ou indicação de rota ausente) e o número do assento

#### Scenario: Lista vazia
- **WHEN** não há alunos cadastrados
- **THEN** o sistema mostra um estado vazio compreensível e ainda oferece ação para adicionar um aluno

### Requirement: Criar aluno com vínculos em cadeia
O sistema SHALL permitir criar um aluno informando nome, idade numérica, responsável, no mínimo dois telefones de contato, série, escola, rota daquela escola, rua de embarque, veículo e um assento livre. O identificador MUST ser gerado no cliente. O sistema MUST incluir o id do aluno em `studentIds` da escola escolhida e MUST ocupar o assento escolhido no veículo.

#### Scenario: Salvamento de novo aluno
- **WHEN** o usuário preenche os campos obrigatórios, escolhe escola, rota, rua, veículo e um assento livre e salva
- **THEN** o sistema persiste o aluno, ocupa o assento com o id do aluno, inclui o id na escola e retorna à tela anterior

#### Scenario: Formulário incompleto
- **WHEN** falta nome, idade válida, responsável, dois telefones não vazios, série, escola, rota, rua de embarque, veículo ou assento válido
- **THEN** o sistema MUST NOT persistir o aluno nem ocupar assento

### Requirement: Seleção de rota filtrada pela escola
Após escolher a escola, o sistema SHALL oferecer apenas rotas vinculadas àquela escola. Sem escola, o usuário MUST NOT conseguir escolher rota.

#### Scenario: Rotas da escola
- **WHEN** o usuário seleciona uma escola que possui rotas
- **THEN** somente essas rotas aparecem para escolha

#### Scenario: Escola sem rotas
- **WHEN** a escola selecionada não tem rotas vinculadas
- **THEN** o sistema informa que não há rotas e MUST NOT persistir o aluno

### Requirement: Rua de embarque a partir da rota
O sistema SHALL oferecer as ruas em `streetsCovered` da rota escolhida e SHALL permitir informar uma rua nova. Rua em branco MUST NOT ser aceita. Rua nova MUST passar a constar na lista de ruas daquela rota após salvar.

#### Scenario: Escolher rua existente
- **WHEN** o usuário escolhe uma rua da lista da rota e salva
- **THEN** o aluno fica com essa rua de embarque

#### Scenario: Rua nova
- **WHEN** o usuário informa uma rua que ainda não está na rota e salva o aluno
- **THEN** essa rua passa a aparecer nas ruas da rota

### Requirement: Mapa de assentos do veículo
O sistema SHALL exibir os assentos do veículo escolhido. Assentos ocupados por outro aluno MUST estar visualmente distintos e MUST NOT ser selecionáveis. Assentos livres MUST ser selecionáveis. Na edição, o assento já ocupado pelo próprio aluno MUST permanecer selecionável.

#### Scenario: Escolher assento livre
- **WHEN** o usuário toca um assento com ocupação vazia
- **THEN** aquele assento fica selecionado para o aluno

#### Scenario: Assento ocupado por outro
- **WHEN** o usuário tenta um assento já ocupado por outro aluno
- **THEN** a seleção não muda para aquele assento

### Requirement: Editar aluno
O sistema SHALL abrir o formulário com os dados atuais. Ao salvar, MUST atualizar o aluno. Se escola, veículo ou assento mudarem, MUST ajustar `studentIds` da escola e liberar o assento anterior antes de ocupar o novo.

#### Scenario: Abrir edição
- **WHEN** o usuário escolhe editar um aluno da lista
- **THEN** o sistema abre o formulário com os dados, vínculos e assento atuais

#### Scenario: Trocar assento ou veículo
- **WHEN** o usuário escolhe outro assento livre (no mesmo veículo ou em outro) e salva
- **THEN** o assento anterior fica livre e o novo fica ocupado pelo aluno

#### Scenario: Trocar escola
- **WHEN** o usuário salva com outra escola
- **THEN** o id do aluno sai da escola anterior e entra na nova

### Requirement: Excluir aluno
O sistema SHALL exigir confirmação explícita. Após confirmação, o aluno MUST sair da listagem, o assento MUST ficar livre e o id MUST sair de `studentIds` da escola.

#### Scenario: Cancelar exclusão
- **WHEN** o usuário inicia exclusão e cancela
- **THEN** o aluno, o assento e o vínculo na escola não mudam

#### Scenario: Confirmar exclusão
- **WHEN** o usuário confirma a exclusão
- **THEN** o aluno some da listagem, o assento fica disponível e deixa de contar na escola
