## ADDED Requirements

### Requirement: Justificativa de ciclo no registro da viagem
Quando uma VOLTA for iniciada com justificativa de ciclo (não havia IDA encerrada da rota no dia), o sistema SHALL persistir essa justificativa no registro da sessão e da viagem encerrada, de forma auditável. Viagens sem esse caso MUST NOT exigir o campo.

#### Scenario: Histórico com motivo
- **WHEN** o usuário confirma a justificativa, conclui a VOLTA e abre o detalhe da viagem
- **THEN** o registro da viagem contém a justificativa escolhida ou o texto livre
