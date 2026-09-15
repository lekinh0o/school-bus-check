# school-registry Specification

## Purpose

Permite cadastrar, listar, editar e excluir escolas no aplicativo de transporte escolar, a partir do dashboard de Cadastros, com persistência local do estado.

## Requirements

### Requirement: Acesso às escolas a partir de Cadastros
O sistema SHALL permitir que o usuário abra a listagem de escolas a partir do card Escolas no dashboard de Cadastros.

#### Scenario: Card Escolas habilitado
- **WHEN** o usuário está em Cadastros e toca o card Escolas
- **THEN** o sistema navega para a tela de listagem de escolas

### Requirement: Listagem de escolas cadastradas
O sistema SHALL exibir todas as escolas persistidas. Cada item MUST mostrar o nome da escola e um resumo com a quantidade de alunos vinculados e a quantidade de rotas vinculadas. A quantidade de rotas MUST refletir os identificadores de rota realmente associados à escola após criar, reatribuir ou excluir rotas. Diretor(a) e registro MUST aparecer apenas quando estiverem preenchidos. Escola sem nome de diretor MUST continuar listável.

#### Scenario: Lista com escolas
- **WHEN** existem uma ou mais escolas cadastradas
- **THEN** cada escola aparece em um card com nome e o texto no formato `N Alunos | M Rotas` usando as quantidades de vínculos armazenados

#### Scenario: Escola sem diretor
- **WHEN** a escola não tem diretor(a) preenchido
- **THEN** o card omite a linha de diretor ou mostra indicação de ausência, sem impedir edição ou exclusão

#### Scenario: Lista vazia
- **WHEN** não há escolas cadastradas
- **THEN** o sistema mostra um estado vazio compreensível e ainda oferece ação para adicionar uma escola

#### Scenario: Contagem após cadastro de rota
- **WHEN** o usuário cadastra uma rota vinculada a uma escola e volta à listagem de escolas
- **THEN** o resumo daquela escola mostra uma rota a mais do que antes do cadastro

### Requirement: Criar escola
O sistema SHALL permitir criar uma escola informando no mínimo o nome. Endereço, diretor(a), telefone e registro são opcionais. Na criação, as listas de alunos e rotas vinculadas MUST iniciar vazias. O identificador MUST ser gerado no cliente. Telefone preenchido MUST seguir a validação de telefone brasileiro; telefone vazio MUST NOT impedir o salvamento.

#### Scenario: Salvamento de nova escola
- **WHEN** o usuário abre o formulário de nova escola, preenche o nome (e opcionalmente os demais campos) e salva
- **THEN** o sistema persiste a escola com identificador único, `studentIds` e `routeIds` vazios, e retorna à tela anterior

#### Scenario: Salvamento só com nome
- **WHEN** o usuário preenche apenas o nome e deixa endereço, diretor(a), telefone e registro vazios e salva
- **THEN** o sistema persiste a escola e MUST NOT recusar o salvamento por campos descritivos vazios

#### Scenario: Formulário incompleto
- **WHEN** o nome está vazio
- **THEN** o sistema MUST NOT persistir a escola

#### Scenario: Telefone preenchido inválido
- **WHEN** o telefone está preenchido mas não é um telefone brasileiro válido
- **THEN** o sistema MUST NOT persistir a escola

### Requirement: Registro opcional da escola
O sistema SHALL permitir informar um registro de negócio opcional no cadastro da escola. O valor MUST NOT substituir o identificador interno. Campo em branco MUST ser omitido (ausente), não persistido como string vazia. O identificador interno MUST continuar sendo gerado no cliente na criação.

#### Scenario: Salvar com registro
- **WHEN** o usuário informa um registro e o nome da escola e salva
- **THEN** a escola persistida guarda o registro e um identificador interno distinto desse valor

#### Scenario: Salvar sem registro
- **WHEN** o campo de registro está vazio e o nome está preenchido e o usuário salva
- **THEN** o sistema persiste a escola sem registro e com identificador interno gerado pelo aplicativo

#### Scenario: Reabrir escola sem registro
- **WHEN** uma escola persistida antes desta alteração é aberta para edição
- **THEN** o formulário carrega os dados existentes, o registro permanece vazio e o usuário consegue salvar sem preencher registro

### Requirement: Editar escola
O sistema SHALL permitir abrir uma escola existente no formulário, com os campos preenchidos, e salvar alterações de nome, endereço, diretor(a) e telefone sem apagar os vínculos de alunos e rotas já existentes.

#### Scenario: Abrir edição
- **WHEN** o usuário escolhe editar uma escola da lista
- **THEN** o sistema abre o formulário com os dados atuais daquela escola

#### Scenario: Salvar edição
- **WHEN** o usuário altera campos de texto e salva
- **THEN** o sistema atualiza apenas esses campos, preserva `studentIds` e `routeIds`, e retorna à tela anterior

### Requirement: Local da escola no mapa
O cadastro da escola SHALL permitir marcar a localização da escola no mapa (busca pelo endereço ou toque/arraste do pino). Coordenadas MUST NOT ser obrigatórias para salvar. Se marcadas, MUST persistir com a escola e permanecer ao reabrir o formulário.

#### Scenario: Marcar escola no mapa
- **WHEN** o usuário confirma um pino no mapa da escola e salva
- **THEN** a escola persiste latitude e longitude e o formulário mostra que o local está marcado

### Requirement: Excluir escola
O sistema SHALL exigir confirmação explícita antes de excluir uma escola. Após confirmação, a escola MUST ser removida da listagem.

#### Scenario: Cancelar exclusão
- **WHEN** o usuário inicia exclusão e cancela na confirmação
- **THEN** a escola permanece cadastrada

#### Scenario: Confirmar exclusão
- **WHEN** o usuário confirma a exclusão
- **THEN** a escola deixa de aparecer na listagem
