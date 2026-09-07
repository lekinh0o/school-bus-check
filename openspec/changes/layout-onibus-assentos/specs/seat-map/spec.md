## Purpose

Mostra a planta do ônibus (duas duplas e corredor) no cadastro do veículo e na alocação do aluno, para o monitor reconhecer janela, corredor e assento ocupado.

## ADDED Requirements

### Requirement: Planta 2x2 com corredor central
O sistema SHALL exibir os assentos do veículo como planta vista de cima, com a frente do ônibus no topo. Cada fileira MUST ter até quatro poltronas: janela esquerda, corredor esquerdo, corredor direito, janela direita, com espaço visível de corredor entre os dois pares. Ímpares MUST ficar nas janelas; pares MUST ficar nos corredores. A ordem visual da esquerda para a direita em uma fileira completa de quatro números consecutivos `4k+1`…`4k+4` MUST ser `4k+1`, `4k+2`, `4k+4`, `4k+3` (exemplo: 1, 2, 4, 3). O dado persistido MUST permanecer a lista linear `seatsMap` sem reordenar IDs.

#### Scenario: Fileira completa de quatro assentos
- **WHEN** o veículo tem pelo menos quatro assentos e o mapa é exibido
- **THEN** a primeira fileira mostra da esquerda para a direita os números 1 (janela), 2 (corredor), 4 (corredor), 3 (janela), com vão central entre 2 e 4

#### Scenario: Fileira incompleta
- **WHEN** o total de assentos não é múltiplo de quatro
- **THEN** a última fileira alinha os assentos restantes nas mesmas colunas (janela/corredor), sem inventar poltronas extra nem quebrar o corredor

### Requirement: Estados visuais da poltrona
O sistema SHALL distinguir livre, ocupado por outro aluno e selecionado (incluindo o assento já do aluno em edição). Livre MUST ter aparência neutra. Ocupado por outro MUST aparecer bloqueado (cinza e indicação de bloqueio) e MUST NOT aceitar toque. Selecionado MUST usar cor de destaque da identidade (marca / vermelho de destaque). O número do assento MUST aparecer no centro da poltrona.

#### Scenario: Assento livre
- **WHEN** `studentId` do assento é nulo ou vazio e o mapa é interativo
- **THEN** a poltrona aparece neutra, mostra o número e aceita toque

#### Scenario: Assento ocupado por outro
- **WHEN** o assento tem `studentId` de outro aluno
- **THEN** a poltrona aparece bloqueada, não muda a seleção ao toque e o aluno atual não é vinculado a esse número

#### Scenario: Assento selecionado ou próprio na edição
- **WHEN** o usuário escolhe um livre, ou o assento já é o do aluno em edição
- **THEN** essa poltrona aparece em destaque e permanece escolhida para o salvamento

### Requirement: Mapa estático no veículo e interativo no aluno
No cadastro ou edição do veículo, após uma quantidade de assentos válida, o sistema SHALL mostrar a planta apenas como visualização (toque MUST NOT alterar ocupação). No cadastro ou edição do aluno, após escolher o veículo, o sistema SHALL mostrar a mesma planta de forma interativa para escolher um assento livre. Onde a listagem de veículos em Cadastros mostra o mapa, MUST usar a mesma planta estática.

#### Scenario: Veículo com quantidade definida
- **WHEN** o usuário informa um total de assentos válido no formulário do veículo
- **THEN** a planta 2x2 aparece com todas as poltronas na quantidade informada, ocupadas em cinza quando já houver `studentId`

#### Scenario: Aluno escolhe assento livre
- **WHEN** o usuário está no formulário do aluno, escolheu um veículo e toca um assento livre
- **THEN** aquele número fica selecionado para o aluno

#### Scenario: Modal de veículos em Cadastros
- **WHEN** o usuário abre a lista de veículos em Cadastros e o veículo tem `seatsMap`
- **THEN** o card mostra a planta 2x2 estática com ocupados bloqueados visualmente
