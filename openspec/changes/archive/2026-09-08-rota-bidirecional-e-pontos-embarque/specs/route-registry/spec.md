## MODIFIED Requirements

### Requirement: Listagem de rotas cadastradas
O sistema SHALL exibir todas as rotas persistidas. Cada item MUST mostrar o título, o ponto de início, o período, o intervalo de horário e o nome da escola de destino resolvido pelo vínculo da rota, além da timeline do percurso na ordem cadastrada (ponto inicial → pontos de embarque → escola). O cadastro MUST NOT exibir um sentido persistido IDA/VOLTA.

#### Scenario: Lista com rotas
- **WHEN** existem uma ou mais rotas cadastradas
- **THEN** cada rota aparece em um card com título, ponto de início, período, horário no formato `início às fim` e o nome da escola correspondente ao vínculo, sem rótulo de sentido IDA/VOLTA gravado na rota

#### Scenario: Escola de destino ausente
- **WHEN** o vínculo da rota não corresponde a nenhuma escola persistida
- **THEN** o card ainda lista a rota e indica que a escola não foi encontrada, sem impedir edição ou exclusão

#### Scenario: Lista vazia
- **WHEN** não há rotas cadastradas
- **THEN** o sistema mostra um estado vazio compreensível e ainda oferece ação para adicionar uma rota

### Requirement: Criar rota
O sistema SHALL permitir criar uma rota informando título, responsável, monitor, ponto de início, horário de início e fim no formato `HH:MM`, período (Manhã, Tarde ou Noite) e escola de destino obrigatória. Na criação, a lista de pontos de embarque MUST ser a lista montada no formulário (podendo estar vazia), na ordem definida pelo usuário. O identificador MUST ser gerado no cliente. O sistema MUST registrar o identificador da rota nova na lista de rotas da escola escolhida. O sistema MUST NOT exigir nem persistir sentido IDA/VOLTA neste cadastro.

#### Scenario: Salvamento de nova rota
- **WHEN** o usuário abre o formulário de nova rota, preenche os campos obrigatórios (sem sentido), escolhe uma escola, opcionalmente adiciona e ordena pontos de embarque e salva
- **THEN** o sistema persiste a rota com identificador único, `boardingPoints` na ordem do formulário, inclui o id da rota na escola escolhida e retorna à tela anterior

#### Scenario: Formulário incompleto
- **WHEN** título, responsável, monitor, ponto de início, horários válidos, período ou escola de destino está vazio ou inválido
- **THEN** o sistema MUST NOT persistir a rota

#### Scenario: Nenhuma escola cadastrada
- **WHEN** não há escolas persistidas
- **THEN** o usuário não consegue escolher uma escola de destino e o sistema MUST NOT persistir a rota

### Requirement: Editar rota
O sistema SHALL permitir abrir uma rota existente no formulário, com os campos, a foto e a lista de pontos de embarque na ordem atual, e salvar alterações sem perder pontos que o usuário não removeu. Se a escola de destino mudar, o sistema MUST retirar o id da rota da escola anterior e incluí-lo na nova.

#### Scenario: Abrir edição
- **WHEN** o usuário escolhe editar uma rota da lista
- **THEN** o sistema abre o formulário com os dados atuais daquela rota, incluindo os pontos de embarque já cadastrados na ordem persistida, e sem exigir sentido IDA/VOLTA

#### Scenario: Salvar edição
- **WHEN** o usuário altera campos, pontos, ordem dos pontos ou escola e salva
- **THEN** o sistema atualiza a rota, ajusta os vínculos nas escolas quando a escola muda, e retorna à tela anterior

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

### Requirement: Timeline horizontal do percurso
O sistema SHALL exibir, na listagem de rotas, uma timeline horizontal com o ponto inicial, os pontos de embarque na ordem persistida e a escola de destino (ou indicação se a escola não existir), em scroll horizontal.

#### Scenario: Percurso com ruas
- **WHEN** a rota tem ponto inicial, um ou mais pontos de embarque e escola válida
- **THEN** a timeline mostra início, depois cada ponto na ordem, depois o nome da escola

#### Scenario: Sem ruas
- **WHEN** a rota não tem pontos de embarque cadastrados
- **THEN** a timeline ainda mostra ponto inicial e escola de destino
