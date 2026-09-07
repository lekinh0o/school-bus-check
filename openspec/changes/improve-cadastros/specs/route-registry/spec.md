## ADDED Requirements

### Requirement: Título e sentido da rota
O sistema SHALL exigir um título da rota e um sentido `IDA` ou `VOLTA` na criação e na edição.

#### Scenario: Salvar com título e sentido
- **WHEN** o usuário informa título, escolhe IDA ou VOLTA e os demais campos obrigatórios e salva
- **THEN** o sistema persiste título e sentido

#### Scenario: Sem título ou sentido
- **WHEN** o título está vazio ou o sentido não foi escolhido
- **THEN** o sistema MUST NOT persistir a rota

### Requirement: Foto do responsável da rota
O sistema SHALL permitir anexar uma foto opcional do responsável pela rota. Se houver foto, o formulário MUST exibi-la.

#### Scenario: Anexar foto
- **WHEN** o usuário escolhe uma imagem e salva a rota
- **THEN** a rota persistida guarda a referência da foto do responsável

### Requirement: Timeline horizontal do percurso
O sistema SHALL exibir, na listagem de rotas, uma timeline horizontal com o ponto inicial, as ruas na ordem persistida e a escola de destino (ou indicação se a escola não existir), em scroll horizontal.

#### Scenario: Percurso com ruas
- **WHEN** a rota tem ponto inicial, uma ou mais ruas e escola válida
- **THEN** a timeline mostra início, depois cada rua na ordem, depois o nome da escola

#### Scenario: Sem ruas
- **WHEN** a rota não tem ruas cadastradas
- **THEN** a timeline ainda mostra ponto inicial e escola de destino

## MODIFIED Requirements

### Requirement: Listagem de rotas cadastradas
O sistema SHALL exibir todas as rotas persistidas. Cada item MUST mostrar o título, o sentido, o ponto de início, o período, o intervalo de horário e o nome da escola de destino resolvido pelo vínculo da rota, além da timeline do percurso.

#### Scenario: Lista com rotas
- **WHEN** existem uma ou mais rotas cadastradas
- **THEN** cada rota aparece em um card com título, sentido, ponto de início, período, horário no formato `início às fim` e o nome da escola correspondente ao vínculo

#### Scenario: Escola de destino ausente
- **WHEN** o vínculo da rota não corresponde a nenhuma escola persistida
- **THEN** o card ainda lista a rota e indica que a escola não foi encontrada, sem impedir edição ou exclusão

#### Scenario: Lista vazia
- **WHEN** não há rotas cadastradas
- **THEN** o sistema mostra um estado vazio compreensível e ainda oferece ação para adicionar uma rota

### Requirement: Criar rota
O sistema SHALL permitir criar uma rota informando título, sentido, responsável, monitor, ponto de início, horário de início e fim no formato `HH:MM`, período (Manhã, Tarde ou Noite) e escola de destino obrigatória. Na criação, a lista de ruas percorridas MUST ser a lista montada no formulário (podendo estar vazia), na ordem definida pelo usuário. O identificador MUST ser gerado no cliente. O sistema MUST registrar o identificador da rota nova na lista de rotas da escola escolhida.

#### Scenario: Salvamento de nova rota
- **WHEN** o usuário abre o formulário de nova rota, preenche os campos obrigatórios incluindo título e sentido, escolhe uma escola, opcionalmente adiciona e ordena ruas e salva
- **THEN** o sistema persiste a rota com identificador único, inclui o id da rota na escola escolhida e retorna à tela anterior

#### Scenario: Formulário incompleto
- **WHEN** título, sentido, responsável, monitor, ponto de início, horários válidos, período ou escola de destino está vazio ou inválido
- **THEN** o sistema MUST NOT persistir a rota

#### Scenario: Nenhuma escola cadastrada
- **WHEN** não há escolas persistidas
- **THEN** o usuário não consegue escolher uma escola de destino e o sistema MUST NOT persistir a rota

### Requirement: Editar rota
O sistema SHALL permitir abrir uma rota existente no formulário, com os campos, o sentido, a foto e a lista de ruas na ordem atual, e salvar alterações sem perder ruas que o usuário não removeu. Se a escola de destino mudar, o sistema MUST retirar o id da rota da escola anterior e incluí-lo na nova.

#### Scenario: Abrir edição
- **WHEN** o usuário escolhe editar uma rota da lista
- **THEN** o sistema abre o formulário com os dados atuais daquela rota, incluindo as ruas já cadastradas na ordem persistida

#### Scenario: Salvar edição
- **WHEN** o usuário altera campos, ruas, ordem das ruas ou escola e salva
- **THEN** o sistema atualiza a rota, ajusta os vínculos nas escolas quando a escola muda, e retorna à tela anterior

### Requirement: Lista dinâmica de ruas no formulário
O sistema SHALL permitir adicionar ruas pelo nome, removê-las individualmente e reordenar (subir/descer) antes de salvar. Uma rua em branco MUST NOT ser adicionada. A ordem da lista MUST ser a ordem persistida em `streetsCovered`.

#### Scenario: Adicionar rua
- **WHEN** o usuário informa um nome de rua não vazio e confirma a adição
- **THEN** a rua aparece na lista do formulário e o campo de nome é limpo

#### Scenario: Remover rua
- **WHEN** o usuário remove uma rua da lista do formulário
- **THEN** aquela rua deixa de aparecer na lista; as demais permanecem na ordem relativa

#### Scenario: Nome vazio
- **WHEN** o usuário tenta adicionar uma rua sem nome
- **THEN** a lista de ruas não muda

#### Scenario: Subir rua
- **WHEN** o usuário sobe uma rua que não é a primeira
- **THEN** ela troca de posição com a anterior na lista

#### Scenario: Descer rua
- **WHEN** o usuário desce uma rua que não é a última
- **THEN** ela troca de posição com a seguinte na lista
