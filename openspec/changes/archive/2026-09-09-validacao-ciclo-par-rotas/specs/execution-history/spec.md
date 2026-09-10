## ADDED Requirements

### Requirement: Justificativa de volta omitida na Ida do histórico
Quando o motorista justificar um ciclo incompleto (Ida encerrada sem Volta posterior), o sistema SHALL persistir o motivo nessa viagem de **IDA** do histórico, de forma auditável no detalhe. A nova viagem iniciada depois MUST NOT substituir esse registro. Viagens sem esse caso MUST NOT exigir o campo.

#### Scenario: Detalhe da Ida justificada
- **WHEN** o motorista confirma o motivo da volta omitida e abre o detalhe daquela Ida
- **THEN** o registro mostra a justificativa (chip ou texto livre)

## MODIFIED Requirements

### Requirement: Justificativa de ciclo no registro da viagem
Quando uma VOLTA for iniciada com justificativa de ciclo (não havia IDA encerrada da rota no dia, em rota Ida e Volta), o sistema SHALL persistir essa justificativa no registro da sessão e da viagem encerrada, de forma auditável. Quando uma Ida incompleta for encerrada com justificativa de volta omitida, essa justificativa SHALL permanecer naquela Ida. Viagens sem esses casos MUST NOT exigir o campo.

#### Scenario: Histórico com motivo
- **WHEN** o usuário confirma a justificativa, conclui a VOLTA e abre o detalhe da viagem
- **THEN** o registro da viagem contém a justificativa escolhida ou o texto livre
