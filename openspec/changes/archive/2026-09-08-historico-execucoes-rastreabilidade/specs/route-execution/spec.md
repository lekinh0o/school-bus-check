## ADDED Requirements

### Requirement: Timestamps da sessão em andamento
Ao iniciar o trajeto, o sistema SHALL gravar `startedAt` como instante ISO daquele clique. Cada vez que o status de um aluno da sessão mudar (presente, ausente, desembarcado ou volta a pendente), o sistema MUST gravar `recordedAt` com o instante ISO daquele clique. Ao concluir um ponto (incluindo auto-avanço) ou pulá-lo, o sistema MUST acrescentar um log daquele ponto com status `COMPLETED` ou `SKIPPED` e o instante ISO do clique. Ao encerrar a rota, MUST gravar `finishedAt`.

#### Scenario: Início com horário
- **WHEN** o usuário toca Iniciar Trajeto
- **THEN** a sessão em andamento tem `startedAt` no instante da ação

#### Scenario: Marcação do aluno
- **WHEN** o usuário marca um aluno como presente, ausente ou desembarcado
- **THEN** aquele aluno fica com `recordedAt` no instante da marcação

#### Scenario: Ponto concluído
- **WHEN** o ponto atual é concluído (botão Concluir ou auto-avanço)
- **THEN** o log daquele ponto fica `COMPLETED` com o horário da conclusão

#### Scenario: Ponto pulado
- **WHEN** o usuário pula um ponto
- **THEN** o log daquele ponto fica `SKIPPED` com o horário do pulo

### Requirement: Encerrar grava a viagem no histórico
Quando a rota é encerrada com sucesso, o sistema SHALL persistir um registro somente leitura da viagem (sentido, horários de início e fim, logs de ponto, marcações dos alunos e métricas de presentes, ausentes e pontos pulados). Iniciar uma nova execução MUST NOT apagar esse registro.

#### Scenario: Viagem disponível depois de encerrar
- **WHEN** o usuário encerra a rota com a van vazia no último ponto
- **THEN** a viagem aparece no histórico com `finishedAt` e permanece após iniciar outro trajeto
