# student-registry Specification

## Purpose

Permite cadastrar, listar, editar e excluir alunos no aplicativo de transporte escolar, vinculando cada aluno a escola, rota, ponto de embarque, veículo e assento, a partir do dashboard de Cadastros.

## Requirements

### Requirement: Acesso aos alunos a partir de Cadastros
O sistema SHALL permitir que o usuário abra a listagem de alunos a partir do card Alunos no dashboard de Cadastros.

#### Scenario: Card Alunos habilitado
- **WHEN** o usuário está em Cadastros e toca o card Alunos
- **THEN** o sistema navega para a tela de listagem de alunos

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

### Requirement: Aluno visível após salvar
O sistema SHALL persistir o aluno no estado global ao salvar o formulário válido. Após voltar da tela de criação ou edição, a listagem MUST mostrar esse aluno. O assento escolhido MUST aparecer ocupado por esse aluno no mapa do veículo.

#### Scenario: Criar aluno e ver na lista
- **WHEN** o usuário preenche o formulário válido, escolhe assento livre e salva
- **THEN** o aluno aparece na listagem de alunos após o retorno

#### Scenario: Assento ocupado após salvar
- **WHEN** o aluno foi salvo com um assento
- **THEN** esse assento fica associado ao id do aluno no veículo e não pode ser escolhido por outro aluno

### Requirement: Seleção de rota filtrada pela escola
Após escolher a escola, o sistema SHALL oferecer apenas rotas vinculadas àquela escola. Sem escola, o usuário MUST NOT conseguir escolher rota.

#### Scenario: Rotas da escola
- **WHEN** o usuário seleciona uma escola que possui rotas
- **THEN** somente essas rotas aparecem para escolha

#### Scenario: Escola sem rotas
- **WHEN** a escola selecionada não tem rotas vinculadas
- **THEN** o sistema informa que não há rotas e MUST NOT persistir o aluno

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

### Requirement: Mapa de assentos do veículo
O sistema SHALL exibir os assentos do veículo escolhido. Assentos ocupados por outro aluno MUST estar visualmente distintos e MUST NOT ser selecionáveis. Assentos livres MUST ser selecionáveis. Na edição, o assento já ocupado pelo próprio aluno MUST permanecer selecionável.

#### Scenario: Escolher assento livre
- **WHEN** o usuário toca um assento com ocupação vazia
- **THEN** aquele assento fica selecionado para o aluno

#### Scenario: Assento ocupado por outro
- **WHEN** o usuário tenta um assento já ocupado por outro aluno
- **THEN** a seleção não muda para aquele assento

### Requirement: Foto do aluno
O sistema SHALL permitir anexar uma foto opcional do aluno. O formulário MUST mostrar a foto quando houver. Cada card da listagem MUST mostrar um avatar circular com a foto ou um placeholder se não houver foto.

#### Scenario: Salvar com foto
- **WHEN** o usuário escolhe uma foto e salva o aluno com os demais campos válidos
- **THEN** o aluno persistido guarda a referência da foto

#### Scenario: Card com avatar
- **WHEN** o aluno tem foto
- **THEN** o card da listagem exibe a foto em destaque circular

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
