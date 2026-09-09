## ADDED Requirements

### Requirement: Início da sessão após escolher o sentido
Depois que o sentido estiver escolhido, o sistema SHALL iniciar uma sessão de execução daquela rota e daquele sentido. A sessão MUST incluir a lista operacional de paradas na ordem da viagem, o índice da parada atual em zero, e um registro por aluno da rota, todos em `PENDING`. Enquanto a sessão estiver `IN_PROGRESS`, o sentido daquela sessão MUST NOT mudar.

#### Scenario: Começar ida
- **WHEN** o usuário confirma Sentido IDA e inicia a execução
- **THEN** a sessão fica em andamento, a primeira parada operacional é o primeiro ponto de embarque da rota, e o último passo da lista é a escola

#### Scenario: Começar volta
- **WHEN** o usuário confirma Sentido VOLTA e inicia a execução
- **THEN** a sessão fica em andamento, a primeira parada operacional é a escola, e as paradas seguintes são os pontos de embarque da rota do último para o primeiro

### Requirement: Alunos do ponto atual
Em cada parada, o sistema SHALL mostrar só os alunos que precisam de ação naquela parada. Em parada de embarque, MUST listar os alunos `PENDING` daquele ponto (na volta, o ponto escola lista todos os `PENDING` da rota). Em parada de desembarque, MUST listar os alunos `PRESENT` (na ida, o ponto escola lista todos os `PRESENT`; nos pontos da volta, só os `PRESENT` cujo ponto de embarque é aquele).

#### Scenario: Embarque na ida
- **WHEN** a parada atual é um ponto de embarque na ida
- **THEN** a lista mostra os alunos da rota com aquele ponto ainda em pendente, para marcar embarque ou falta

#### Scenario: Desembarque na escola na ida
- **WHEN** a parada atual é a escola na ida
- **THEN** a lista mostra todos os alunos com status presente (dentro da van), para marcar desembarque

#### Scenario: Embarque na escola na volta
- **WHEN** a parada atual é a escola na volta
- **THEN** a lista mostra os alunos da rota ainda pendentes, para marcar embarque na escola ou falta

#### Scenario: Desembarque no ponto na volta
- **WHEN** a parada atual é um ponto de desembarque na volta
- **THEN** a lista mostra os alunos presentes cujo ponto de embarque é aquele ponto, para marcar desembarque

### Requirement: Marcação de embarque, falta e desembarque
O sistema SHALL permitir marcar um aluno pendente como presente (embarcou) ou ausente (faltou), e um aluno presente como desembarcado. Ausente MUST NOT exigir desembarque. Presente MUST exigir desembarque antes de a rota poder ser concluída.

#### Scenario: Embarcou
- **WHEN** o usuário marca um aluno pendente como presente
- **THEN** o aluno passa a contar como dentro da van

#### Scenario: Faltou
- **WHEN** o usuário marca um aluno pendente como ausente
- **THEN** o aluno deixa a lista daquela parada de embarque e não conta como dentro da van

#### Scenario: Desembarcou
- **WHEN** o usuário marca um aluno presente como desembarcado
- **THEN** o aluno deixa de contar como dentro da van

### Requirement: Concluir ou pular o ponto atual
O sistema SHALL oferecer concluir o ponto atual somente quando todos os alunos exigidos naquela parada já tiverem ação (embarque/falta ou desembarque, conforme o tipo da parada). Pular o ponto MUST avançar o índice e registrar a parada como pulada, sem marcar automaticamente os pendentes como ausentes. Pular MUST NOT ser permitido na última parada se ainda houver algum aluno presente na van.

#### Scenario: Concluir ponto liberado
- **WHEN** todos os alunos exigidos na parada atual já foram processados e o usuário conclui o ponto
- **THEN** a sessão avança para a próxima parada, se houver

#### Scenario: Concluir ponto bloqueado
- **WHEN** ainda há aluno exigido sem ação na parada atual
- **THEN** o sistema MUST NOT avançar como se o ponto estivesse concluído

#### Scenario: Pular ponto de embarque
- **WHEN** o usuário pula um ponto que não é o último e ainda havia pendentes
- **THEN** a sessão avança, a parada entra na lista de puladas, e esses alunos permanecem pendentes (não presentes)

### Requirement: Encerrar a rota sem criança na van
O sistema SHALL permitir encerrar a sessão somente no último ponto e somente se nenhum aluno da sessão estiver presente (dentro da van). Encerrar MUST marcar a sessão como concluída. Se houver pelo menos um presente, o encerramento MUST permanecer bloqueado.

#### Scenario: Encerrar com van vazia
- **WHEN** a parada atual é a última, todos os presentes já desembarcaram (os demais estão ausentes ou desembarcados) e o usuário encerra
- **THEN** a sessão passa a concluída

#### Scenario: Encerrar bloqueado com aluno na van
- **WHEN** ainda existe aluno com status presente
- **THEN** o sistema MUST NOT concluir a rota
