## ADDED Requirements

### Requirement: Justificativa de ciclo ao iniciar VOLTA sem IDA do dia
Ao tocar Iniciar Trajeto no sentido VOLTA, o sistema SHALL verificar se existe pelo menos uma viagem **encerrada** da mesma rota no sentido IDA no mesmo dia local. Se existir, MUST iniciar a VOLTA sem modal extra. Se não existir, MUST bloquear o início até o usuário confirmar uma justificativa: esqueci de iniciar de manhã, período exclusivo à tarde, ou texto livre. A sessão só MUST começar depois da justificativa. Iniciar IDA MUST NOT exigir esse passo.

#### Scenario: VOLTA com IDA no dia
- **WHEN** o usuário escolhe VOLTA e já há IDA encerrada daquela rota no dia local
- **THEN** o trajeto inicia sem pedir justificativa

#### Scenario: VOLTA sem IDA no dia
- **WHEN** o usuário escolhe VOLTA e não há IDA encerrada daquela rota no dia local
- **THEN** o sistema mostra um modal bloqueante e não inicia a sessão até uma justificativa ser confirmada

#### Scenario: IDA sem extra
- **WHEN** o usuário inicia IDA
- **THEN** o trajeto inicia sem validação de ciclo par

### Requirement: Alerta de falta na ida durante a VOLTA
Na execução em andamento no sentido VOLTA, o sistema SHALL destacar de forma visível (junto da foto e do nome) cada aluno cujo status na IDA encerrada daquela rota no mesmo dia foi `ABSENT`. O destaque MUST ser só informativo: presente e ausente MUST permanecer acionáveis. Se não houver IDA do dia ou o aluno não esteve ausente nela, MUST NOT mostrar o alerta de falta na ida.

#### Scenario: Badge na lista da execução
- **WHEN** a sessão é VOLTA e o aluno esteve ausente na IDA do dia
- **THEN** as tabs Execução e Resumo mostram o aviso de que faltou na ida, e os botões de status continuam ativos

#### Scenario: Sem falta na ida
- **WHEN** o aluno não esteve ausente na IDA do dia (ou não há IDA)
- **THEN** o aviso de falta na ida não aparece para esse aluno
