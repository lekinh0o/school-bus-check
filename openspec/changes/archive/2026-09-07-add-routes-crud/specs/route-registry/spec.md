## Purpose

Permite cadastrar, listar, editar e excluir rotas de transporte escolar, vinculando cada rota a uma escola já cadastrada e mantendo a lista de ruas percorridas, a partir do dashboard de Cadastros.

## ADDED Requirements

### Requirement: Acesso às rotas a partir de Cadastros
O sistema SHALL permitir que o usuário abra a listagem de rotas a partir do card Rotas no dashboard de Cadastros.

#### Scenario: Card Rotas habilitado
- **WHEN** o usuário está em Cadastros e toca o card Rotas
- **THEN** o sistema navega para a tela de listagem de rotas

### Requirement: Listagem de rotas cadastradas
O sistema SHALL exibir todas as rotas persistidas. Cada item MUST mostrar o ponto de início, o período, o intervalo de horário e o nome da escola de destino resolvido pelo vínculo da rota.

#### Scenario: Lista com rotas
- **WHEN** existem uma ou mais rotas cadastradas
- **THEN** cada rota aparece em um card com ponto de início, período, horário no formato `início às fim` e o nome da escola correspondente ao vínculo

#### Scenario: Escola de destino ausente
- **WHEN** o vínculo da rota não corresponde a nenhuma escola persistida
- **THEN** o card ainda lista a rota e indica que a escola não foi encontrada, sem impedir edição ou exclusão

#### Scenario: Lista vazia
- **WHEN** não há rotas cadastradas
- **THEN** o sistema mostra um estado vazio compreensível e ainda oferece ação para adicionar uma rota

### Requirement: Criar rota
O sistema SHALL permitir criar uma rota informando responsável, monitor, ponto de início, horário de início, horário de fim, período (Manhã, Tarde ou Noite) e escola de destino obrigatória. Na criação, a lista de ruas percorridas MUST ser a lista montada no formulário (podendo estar vazia). O identificador MUST ser gerado no cliente. O sistema MUST registrar o identificador da rota nova na lista de rotas da escola escolhida.

#### Scenario: Salvamento de nova rota
- **WHEN** o usuário abre o formulário de nova rota, preenche os campos obrigatórios, escolhe uma escola, opcionalmente adiciona ruas e salva
- **THEN** o sistema persiste a rota com identificador único, inclui o id da rota na escola escolhida e retorna à tela anterior

#### Scenario: Formulário incompleto
- **WHEN** responsável, monitor, ponto de início, horários, período ou escola de destino está vazio
- **THEN** o sistema MUST NOT persistir a rota

#### Scenario: Nenhuma escola cadastrada
- **WHEN** não há escolas persistidas
- **THEN** o usuário não consegue escolher uma escola de destino e o sistema MUST NOT persistir a rota

### Requirement: Editar rota
O sistema SHALL permitir abrir uma rota existente no formulário, com os campos e a lista de ruas preenchidos, e salvar alterações sem perder ruas que o usuário não removeu. Se a escola de destino mudar, o sistema MUST retirar o id da rota da escola anterior e incluí-lo na nova.

#### Scenario: Abrir edição
- **WHEN** o usuário escolhe editar uma rota da lista
- **THEN** o sistema abre o formulário com os dados atuais daquela rota, incluindo as ruas já cadastradas

#### Scenario: Salvar edição
- **WHEN** o usuário altera campos, ruas ou escola e salva
- **THEN** o sistema atualiza a rota, ajusta os vínculos nas escolas quando a escola muda, e retorna à tela anterior

### Requirement: Excluir rota
O sistema SHALL exigir confirmação explícita antes de excluir uma rota. Após confirmação, a rota MUST ser removida da listagem e o identificador MUST ser retirado da lista de rotas da escola vinculada.

#### Scenario: Cancelar exclusão
- **WHEN** o usuário inicia exclusão e cancela na confirmação
- **THEN** a rota permanece cadastrada e o vínculo na escola não muda

#### Scenario: Confirmar exclusão
- **WHEN** o usuário confirma a exclusão
- **THEN** a rota deixa de aparecer na listagem e deixa de contar como rota vinculada na escola

### Requirement: Lista dinâmica de ruas no formulário
O sistema SHALL permitir adicionar ruas pelo nome e removê-las individualmente antes de salvar. Uma rua em branco MUST NOT ser adicionada.

#### Scenario: Adicionar rua
- **WHEN** o usuário informa um nome de rua não vazio e confirma a adição
- **THEN** a rua aparece na lista do formulário e o campo de nome é limpo

#### Scenario: Remover rua
- **WHEN** o usuário remove uma rua da lista do formulário
- **THEN** aquela rua deixa de aparecer na lista; as demais permanecem

#### Scenario: Nome vazio
- **WHEN** o usuário tenta adicionar uma rua sem nome
- **THEN** a lista de ruas não muda
