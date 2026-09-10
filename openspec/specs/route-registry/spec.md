# route-registry Specification

## Purpose

Permite cadastrar, listar, editar e excluir rotas de transporte escolar, vinculando cada rota a uma escola já cadastrada e mantendo a lista de pontos de embarque, a partir do dashboard de Cadastros.

## Requirements

### Requirement: Acesso às rotas a partir de Cadastros
O sistema SHALL permitir que o usuário abra a listagem de rotas a partir do card Rotas no dashboard de Cadastros.

#### Scenario: Card Rotas habilitado
- **WHEN** o usuário está em Cadastros e toca o card Rotas
- **THEN** o sistema navega para a tela de listagem de rotas

### Requirement: Listagem de rotas cadastradas
O sistema SHALL exibir todas as rotas persistidas. Cada item MUST mostrar o título, o ponto de início, o período, as duas janelas de horário (ida e volta) e o nome da escola de destino resolvido pelo vínculo da rota, além da timeline do percurso na ordem cadastrada (ponto inicial → pontos de embarque → escola). O cadastro MUST NOT exibir um sentido persistido IDA/VOLTA.

#### Scenario: Lista com rotas
- **WHEN** existem uma ou mais rotas cadastradas
- **THEN** cada rota aparece em um card com título, ponto de início, período, horário de ida e horário de volta no formato `início às fim` para cada sentido, e o nome da escola correspondente ao vínculo, sem rótulo de sentido IDA/VOLTA gravado na rota

#### Scenario: Escola de destino ausente
- **WHEN** o vínculo da rota não corresponde a nenhuma escola persistida
- **THEN** o card ainda lista a rota e indica que a escola não foi encontrada, sem impedir edição ou exclusão

#### Scenario: Lista vazia
- **WHEN** não há rotas cadastradas
- **THEN** o sistema mostra um estado vazio compreensível e ainda oferece ação para adicionar uma rota

### Requirement: Criar rota
O sistema SHALL permitir criar uma rota informando título, responsável, monitor, ponto de início, quatro horários no formato `HH:MM` (início e término da ida; início e término da volta), período (Manhã, Tarde ou Noite) e escola de destino obrigatória. Na criação, a lista de pontos de embarque MUST ser a lista montada no formulário (podendo estar vazia), na ordem definida pelo usuário. O identificador MUST ser gerado no cliente. O sistema MUST registrar o identificador da rota nova na lista de rotas da escola escolhida. O sistema MUST NOT exigir nem persistir sentido IDA/VOLTA neste cadastro. O período MUST permanecer como classificação da linha e MUST NOT substituir os pares de horário.

#### Scenario: Salvamento de nova rota
- **WHEN** o usuário abre o formulário de nova rota, preenche os campos obrigatórios (sem sentido), informa os quatro horários, escolhe uma escola, opcionalmente adiciona e ordena pontos de embarque e salva
- **THEN** o sistema persiste a rota com identificador único, `boardingPoints` na ordem do formulário, os quatro horários independentes, inclui o id da rota na escola escolhida e retorna à tela anterior

#### Scenario: Formulário incompleto
- **WHEN** título, responsável, monitor, ponto de início, qualquer um dos quatro horários, período ou escola de destino está vazio ou inválido
- **THEN** o sistema MUST NOT persistir a rota

#### Scenario: Nenhuma escola cadastrada
- **WHEN** não há escolas persistidas
- **THEN** o usuário não consegue escolher uma escola de destino e o sistema MUST NOT persistir a rota

### Requirement: Editar rota
O sistema SHALL permitir abrir uma rota existente no formulário, com os campos, a foto, os quatro horários e a lista de pontos de embarque na ordem atual, e salvar alterações sem perder pontos que o usuário não removeu. Se a escola de destino mudar, o sistema MUST retirar o id da rota da escola anterior e incluí-lo na nova.

#### Scenario: Abrir edição
- **WHEN** o usuário escolhe editar uma rota da lista
- **THEN** o sistema abre o formulário com os dados atuais daquela rota, incluindo os pontos de embarque já cadastrados na ordem persistida, os horários de ida e de volta, e sem exigir sentido IDA/VOLTA

#### Scenario: Salvar edição
- **WHEN** o usuário altera campos, horários de um sentido, pontos, ordem dos pontos ou escola e salva
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
O sistema SHALL permitir adicionar pontos de embarque pelo nome, removê-los individualmente e reordenar (subir/descer) antes de salvar. Um ponto em branco MUST NOT ser adicionado. A ordem da lista MUST ser a ordem persistida em `boardingPoints`. Os rótulos da interface MUST usar “Ponto de embarque”, não “rua”.

#### Scenario: Adicionar rua
- **WHEN** o usuário informa um nome de ponto não vazio e confirma a adição
- **THEN** o ponto aparece na lista do formulário e o campo de nome é limpo

#### Scenario: Remover rua
- **WHEN** o usuário remove um ponto da lista do formulário
- **THEN** aquele ponto deixa de aparecer na lista; os demais permanecem na ordem relativa

#### Scenario: Nome vazio
- **WHEN** o usuário tenta adicionar um ponto sem nome
- **THEN** a lista de pontos não muda

#### Scenario: Subir rua
- **WHEN** o usuário sobe um ponto que não é o primeiro
- **THEN** ele troca de posição com o anterior na lista

#### Scenario: Descer rua
- **WHEN** o usuário desce um ponto que não é o último
- **THEN** ele troca de posição com o seguinte na lista

### Requirement: Título e sentido da rota
O sistema SHALL exigir um título da rota na criação e na edição. O sistema MUST NOT exigir nem persistir sentido `IDA` ou `VOLTA` no cadastro da rota.

#### Scenario: Salvar com título e sentido
- **WHEN** o usuário informa título e os demais campos obrigatórios e salva (sem escolher sentido)
- **THEN** o sistema persiste o título e não grava sentido na rota

#### Scenario: Sem título ou sentido
- **WHEN** o título está vazio
- **THEN** o sistema MUST NOT persistir a rota

### Requirement: Foto do responsável da rota
O sistema SHALL permitir anexar uma foto opcional do responsável pela rota. Se houver foto, o formulário MUST exibi-la.

#### Scenario: Anexar foto
- **WHEN** o usuário escolhe uma imagem e salva a rota
- **THEN** a rota persistida guarda a referência da foto do responsável

### Requirement: Timeline horizontal do percurso
O sistema SHALL exibir, na listagem de rotas, uma timeline horizontal com o ponto inicial, os pontos de embarque na ordem persistida e a escola de destino (ou indicação se a escola não existir), em scroll horizontal.

#### Scenario: Percurso com ruas
- **WHEN** a rota tem ponto inicial, um ou mais pontos de embarque e escola válida
- **THEN** a timeline mostra início, depois cada ponto na ordem, depois o nome da escola

#### Scenario: Sem ruas
- **WHEN** a rota não tem pontos de embarque cadastrados
- **THEN** a timeline ainda mostra ponto inicial e escola de destino

### Requirement: Formulário com horários de ida e volta
O formulário de rota SHALL apresentar duas seções distintas: Turno da Ida (horário de início e horário de término na escola) e Turno da Volta (horário de início na escola e horário de término). Os dois pares MUST ser persistidos de forma independente. Uma janela MUST NOT sobrescrever a outra.

#### Scenario: Pares independentes
- **WHEN** o usuário cadastra ida 06:00–07:10 e volta 11:00–12:10 e salva
- **THEN** a rota persistida guarda os quatro valores e a listagem mostra as duas janelas

#### Scenario: Alterar só a volta
- **WHEN** o usuário edita apenas os horários da volta e salva
- **THEN** os horários da ida permanecem os que já estavam persistidos

### Requirement: Tipo de operação da rota
O sistema SHALL persistir em cada rota um tipo de operação: Ida e Volta obrigatórias, apenas Ida, ou apenas Volta. O cadastro MUST oferecer essa escolha no formulário. Na criação, o valor padrão MUST ser Ida e Volta obrigatórias. Rotas já persistidas sem o campo MUST ser tratadas como Ida e Volta obrigatórias. O tipo de operação MUST NOT ser confundido com o sentido da sessão (IDA/VOLTA).

#### Scenario: Nova rota com padrão
- **WHEN** o usuário cria uma rota e não altera o tipo de operação
- **THEN** a rota é persistida como Ida e Volta obrigatórias

#### Scenario: Escolher apenas Ida
- **WHEN** o usuário salva a rota como apenas Ida
- **THEN** o valor persistido é apenas Ida e permanece ao reabrir o formulário

#### Scenario: Lista mostra o tipo
- **WHEN** a listagem de rotas está visível
- **THEN** cada card indica o tipo de operação daquela rota
