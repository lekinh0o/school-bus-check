## ADDED Requirements

### Requirement: Painel de sentido conforme o tipo de operação
No painel de iniciar trajeto, o sistema SHALL oferecer só os sentidos permitidos pelo tipo de operação da rota. Ida e Volta obrigatórias: IDA e VOLTA. Apenas Ida: só IDA. Apenas Volta: só VOLTA. O sentido efetivo MUST ser um dos permitidos.

#### Scenario: Rota só de Ida
- **WHEN** o motorista abre o painel de uma rota apenas Ida
- **THEN** não consegue escolher VOLTA e inicia no sentido IDA

#### Scenario: Rota só de Volta
- **WHEN** o motorista abre o painel de uma rota apenas Volta
- **THEN** não consegue escolher IDA e inicia no sentido VOLTA

### Requirement: Justificativa ao iniciar IDA com volta anterior omitida
Para rota de Ida e Volta obrigatórias, ao tocar Iniciar Trajeto no sentido **IDA**, o sistema SHALL verificar o histórico encerrado daquela rota (ordenado por início). Se a viagem encerrada mais recente dessa rota for uma **IDA** e não existir **VOLTA** encerrada da mesma rota com início posterior a essa Ida, o ciclo está incompleto. Nesse caso o sistema MUST bloquear o novo trajeto e mostrar um modal com título “Ciclo Anterior Incompleto”, o nome da rota e a data local da Ida pendente, exigindo justificativa: “Volta realizada sem o app”, “Período cancelado/Feriado”, ou “Outro” com texto. Só depois de confirmar, o sistema MUST registrar a justificativa naquela Ida do histórico e então iniciar a nova IDA. Iniciar **VOLTA** (fechar o par) MUST NOT exigir esse modal. Rotas apenas Ida ou apenas Volta MUST NOT usar essa trava.

#### Scenario: Ciclo fechado
- **WHEN** a última viagem da rota é VOLTA, ou a última Ida já tem Volta posterior, e o motorista inicia IDA
- **THEN** o trajeto inicia sem o modal de ciclo incompleto

#### Scenario: Ida antiga sem Volta
- **WHEN** a rota é Ida e Volta, a última viagem encerrada é IDA sem VOLTA depois, e o motorista tenta iniciar IDA
- **THEN** o sistema mostra o modal bloqueante e não inicia até a justificativa

#### Scenario: Completar a Volta pendente
- **WHEN** há Ida sem Volta posterior e o motorista inicia VOLTA
- **THEN** a VOLTA inicia sem o modal de ciclo incompleto (a regra de VOLTA sem IDA do dia continua valendo se aplicável)

#### Scenario: Confirmar motivo
- **WHEN** o motorista escolhe um motivo rápido ou texto em “Outro” e confirma
- **THEN** a Ida incompleta no histórico passa a ter a justificativa e a nova IDA pode começar

## MODIFIED Requirements

### Requirement: Justificativa de ciclo ao iniciar VOLTA sem IDA do dia
Ao tocar Iniciar Trajeto no sentido VOLTA em rota de **Ida e Volta obrigatórias**, o sistema SHALL verificar se existe pelo menos uma viagem **encerrada** da mesma rota no sentido IDA no mesmo dia local. Se existir, MUST iniciar a VOLTA sem esse modal. Se não existir, MUST bloquear o início até o usuário confirmar uma justificativa: esqueci de iniciar de manhã, período exclusivo à tarde, ou texto livre. A sessão só MUST começar depois da justificativa. Iniciar IDA MUST NOT exigir **esse** passo (a trava de volta omitida de ciclo anterior é outra regra). Rota **apenas Volta** MUST iniciar VOLTA sem este modal. Rota **apenas Ida** MUST NOT oferecer VOLTA.

#### Scenario: VOLTA com IDA no dia
- **WHEN** o usuário escolhe VOLTA numa rota Ida e Volta e já há IDA encerrada daquela rota no dia local
- **THEN** o trajeto inicia sem pedir justificativa de “nenhuma IDA hoje”

#### Scenario: VOLTA sem IDA no dia
- **WHEN** o usuário escolhe VOLTA numa rota Ida e Volta e não há IDA encerrada daquela rota no dia local
- **THEN** o sistema mostra um modal bloqueante e não inicia a sessão até uma justificativa ser confirmada

#### Scenario: IDA sem extra
- **WHEN** o usuário inicia IDA
- **THEN** o trajeto não pede a justificativa de “nenhuma IDA hoje”; se a rota for Ida e Volta com ciclo incompleto, vale a regra de volta omitida, não este modal

#### Scenario: Rota apenas Volta
- **WHEN** o usuário inicia o trajeto de uma rota apenas Volta
- **THEN** o sistema não exige justificativa de ausência de IDA no dia
