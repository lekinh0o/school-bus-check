## Purpose

Permite cadastrar, listar, editar e excluir escolas no aplicativo de transporte escolar, a partir do dashboard de Cadastros, com persistência local do estado.

## ADDED Requirements

### Requirement: Acesso às escolas a partir de Cadastros
O sistema SHALL permitir que o usuário abra a listagem de escolas a partir do card Escolas no dashboard de Cadastros.

#### Scenario: Card Escolas habilitado
- **WHEN** o usuário está em Cadastros e toca o card Escolas
- **THEN** o sistema navega para a tela de listagem de escolas

### Requirement: Listagem de escolas cadastradas
O sistema SHALL exibir todas as escolas persistidas. Cada item MUST mostrar o nome da escola, o nome do diretor(a) e um resumo com a quantidade de alunos vinculados e a quantidade de rotas vinculadas.

#### Scenario: Lista com escolas
- **WHEN** existem uma ou mais escolas cadastradas
- **THEN** cada escola aparece em um card com nome, diretor(a) e o texto no formato `N Alunos | M Rotas` usando as quantidades de vínculos armazenados

#### Scenario: Lista vazia
- **WHEN** não há escolas cadastradas
- **THEN** o sistema mostra um estado vazio compreensível e ainda oferece ação para adicionar uma escola

### Requirement: Criar escola
O sistema SHALL permitir criar uma escola informando nome, endereço, diretor(a) e telefone. Na criação, as listas de alunos e rotas vinculadas MUST iniciar vazias. O identificador MUST ser gerado no cliente.

#### Scenario: Salvamento de nova escola
- **WHEN** o usuário abre o formulário de nova escola, preenche nome, endereço, diretor(a) e telefone e salva
- **THEN** o sistema persiste a escola com identificador único, `studentIds` e `routeIds` vazios, e retorna à tela anterior

#### Scenario: Formulário incompleto
- **WHEN** nome, endereço, diretor(a) ou telefone está vazio
- **THEN** o sistema MUST NOT persistir a escola

### Requirement: Editar escola
O sistema SHALL permitir abrir uma escola existente no formulário, com os campos preenchidos, e salvar alterações de nome, endereço, diretor(a) e telefone sem apagar os vínculos de alunos e rotas já existentes.

#### Scenario: Abrir edição
- **WHEN** o usuário escolhe editar uma escola da lista
- **THEN** o sistema abre o formulário com os dados atuais daquela escola

#### Scenario: Salvar edição
- **WHEN** o usuário altera campos de texto e salva
- **THEN** o sistema atualiza apenas esses campos, preserva `studentIds` e `routeIds`, e retorna à tela anterior

### Requirement: Excluir escola
O sistema SHALL exigir confirmação explícita antes de excluir uma escola. Após confirmação, a escola MUST ser removida da listagem.

#### Scenario: Cancelar exclusão
- **WHEN** o usuário inicia exclusão e cancela na confirmação
- **THEN** a escola permanece cadastrada

#### Scenario: Confirmar exclusão
- **WHEN** o usuário confirma a exclusão
- **THEN** a escola deixa de aparecer na listagem
