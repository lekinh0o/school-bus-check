## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Formulário com horários de ida e volta
O formulário de rota SHALL apresentar duas seções distintas: Turno da Ida (horário de início e horário de término na escola) e Turno da Volta (horário de início na escola e horário de término). Os dois pares MUST ser persistidos de forma independente. Uma janela MUST NOT sobrescrever a outra.

#### Scenario: Pares independentes
- **WHEN** o usuário cadastra ida 06:00–07:10 e volta 11:00–12:10 e salva
- **THEN** a rota persistida guarda os quatro valores e a listagem mostra as duas janelas

#### Scenario: Alterar só a volta
- **WHEN** o usuário edita apenas os horários da volta e salva
- **THEN** os horários da ida permanecem os que já estavam persistidos
