# execution-history Specification

## Purpose

Mostra viagens de rota já encerradas no dashboard e no detalhe, só para auditoria: duração do trajeto, horário de cada ponto e horário em que cada aluno foi marcado, sem alterar a sessão depois de concluída.

## Requirements

### Requirement: Lista Últimas Viagens no Início
O sistema SHALL listar, na tela inicial, abaixo da seção de iniciar rota, as viagens encerradas em ordem da mais recente para a mais antiga. Cada item MUST mostrar o título da rota, a data, o sentido (IDA ou VOLTA), a duração total calculada entre início e fim, e o resumo de presentes, ausentes e pontos pulados. A lista MUST ser somente leitura: tocar um item abre o detalhe, sem retomar a sessão.

#### Scenario: Card com duração
- **WHEN** existe pelo menos uma viagem encerrada e o usuário está no Início
- **THEN** o card mostra título, data, sentido, duração (diferença entre início e fim) e as métricas

#### Scenario: Abrir detalhe
- **WHEN** o usuário toca um card de última viagem
- **THEN** o sistema abre o detalhe daquela viagem em modo somente leitura

### Requirement: Timeline de auditoria no detalhe
A tela de detalhe SHALL ter uma aba com timeline vertical na ordem cronológica dos pontos da viagem. Cada item MUST mostrar o nome do ponto (embarque ou escola), o horário do log e, se o ponto foi pulado, o nome tachado em cinza com indicação de pulado e o horário do pulo. Pontos concluídos MUST mostrar o horário de conclusão ao lado do nome.

#### Scenario: Ponto concluído na timeline
- **WHEN** o usuário abre o detalhe de uma viagem com um ponto concluído às 12:35
- **THEN** aquele item mostra o nome do ponto e o horário 12:35

#### Scenario: Ponto pulado na timeline
- **WHEN** o ponto foi pulado
- **THEN** o nome aparece tachado, em cinza, com indicação de pulado e o horário do pulo

### Requirement: Resumo somente leitura com mapa e horário do aluno
A tela de detalhe SHALL ter uma aba de resumo com a planta do veículo da rota e a lista de alunos da viagem. Assento de aluno ausente MUST manter a borda amarela. Cada aluno MUST mostrar o status final e, quando houver, o horário em que esse status foi marcado. Alterar status MUST NOT estar disponível. Contatar o responsável MUST permanecer disponível.

#### Scenario: Horário na lista
- **WHEN** um aluno foi marcado às 12:42
- **THEN** a lista mostra esse horário abaixo do status

#### Scenario: Sem alteração de status
- **WHEN** o usuário está no detalhe do histórico
- **THEN** não consegue mudar presente, ausente, pendente ou desembarque; o contato continua acionável

#### Scenario: Ausente no mapa
- **WHEN** um aluno da viagem está ausente e tem assento no veículo
- **THEN** o assento aparece com borda amarela e a planta não aceita troca de ocupação

### Requirement: Justificativa de ciclo no registro da viagem
Quando uma VOLTA for iniciada com justificativa de ciclo (não havia IDA encerrada da rota no dia), o sistema SHALL persistir essa justificativa no registro da sessão e da viagem encerrada, de forma auditável. Viagens sem esse caso MUST NOT exigir o campo.

#### Scenario: Histórico com motivo
- **WHEN** o usuário confirma a justificativa, conclui a VOLTA e abre o detalhe da viagem
- **THEN** o registro da viagem contém a justificativa escolhida ou o texto livre
