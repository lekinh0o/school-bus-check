# execution-history Specification

## Purpose

Mostra viagens de rota já encerradas no dashboard e no detalhe, só para auditoria: duração do trajeto, horário de cada ponto e horário em que cada aluno foi marcado, sem alterar a sessão depois de concluída.

## Requirements

### Requirement: Lista Últimas Viagens no Início
O sistema SHALL listar, na tela inicial, abaixo da seção de rotas para executar, um recorte das viagens encerradas (as mais recentes), em ordem da mais recente para a mais antiga. Cada item MUST mostrar o título da rota, a data, o sentido (IDA ou VOLTA), a duração total calculada entre início e fim, e o resumo de presentes, ausentes e pontos pulados. A lista MUST ser somente leitura: tocar um item abre o detalhe, sem retomar a sessão. O Início MUST oferecer ação para ver a lista completa das viagens numa tela dedicada. Rotas para executar e histórico MUST aparecer em seções distintas, para o histórico não competir visualmente com o início de rota.

#### Scenario: Card com duração
- **WHEN** existe pelo menos uma viagem encerrada e o usuário está no Início
- **THEN** o card mostra título, data, sentido, duração (diferença entre início e fim) e as métricas

#### Scenario: Abrir detalhe
- **WHEN** o usuário toca um card de última viagem
- **THEN** o sistema abre o detalhe daquela viagem em modo somente leitura

#### Scenario: Ver todos
- **WHEN** o usuário aciona Ver todos no histórico do Início
- **THEN** o sistema abre a listagem completa das viagens encerradas, na mesma ordem

### Requirement: Timeline de auditoria no detalhe
A tela de detalhe SHALL ter uma aba com timeline vertical na ordem cronológica dos pontos da viagem. Cada item MUST mostrar o nome do ponto (embarque ou escola), o horário do log e, se o ponto foi pulado, o nome tachado em cinza com indicação de pulado e o horário do pulo. Pontos concluídos MUST mostrar o horário de conclusão ao lado do nome.

#### Scenario: Ponto concluído na timeline
- **WHEN** o usuário abre o detalhe de uma viagem com um ponto concluído às 12:35
- **THEN** aquele item mostra o nome do ponto e o horário 12:35

#### Scenario: Ponto pulado na timeline
- **WHEN** o ponto foi pulado
- **THEN** o nome aparece tachado, em cinza, com indicação de pulado e o horário do pulo

### Requirement: Resumo somente leitura com mapa e horário do aluno
A tela de detalhe SHALL ter uma aba de resumo com a planta do veículo da rota e a lista de alunos da viagem. Assento de aluno ausente MUST manter a borda amarela. Cada aluno MUST mostrar o status final e, quando houver, o horário em que esse status foi marcado. Alterar status MUST NOT estar disponível. Contatar o responsável MUST permanecer disponível com a mesma regra da execução: um telefone abre WhatsApp; vários abrem seletor e depois WhatsApp ou ligação. Segurar a foto MUST ampliar a foto com o nome, quando houver `photoUri`.

#### Scenario: Horário na lista
- **WHEN** um aluno foi marcado às 12:42
- **THEN** a lista mostra esse horário abaixo do status

#### Scenario: Sem alteração de status
- **WHEN** o usuário está no detalhe do histórico
- **THEN** não consegue mudar presente, ausente, pendente ou desembarque; o contato continua acionável

#### Scenario: Ausente no mapa
- **WHEN** um aluno da viagem está ausente e tem assento no veículo
- **THEN** o assento aparece com borda amarela e a planta não aceita troca de ocupação

#### Scenario: Ampliar foto no histórico
- **WHEN** o usuário faz long press na foto de um aluno com foto no detalhe
- **THEN** o sistema mostra a foto ampliada e o nome

### Requirement: Justificativa de ciclo no registro da viagem
Quando uma VOLTA for iniciada com justificativa de ciclo (não havia IDA encerrada da rota no dia, em rota Ida e Volta), o sistema SHALL persistir essa justificativa no registro da sessão e da viagem encerrada, de forma auditável. Quando uma Ida incompleta for encerrada com justificativa de volta omitida, essa justificativa SHALL permanecer naquela Ida. Viagens sem esses casos MUST NOT exigir o campo.

#### Scenario: Histórico com motivo
- **WHEN** o usuário confirma a justificativa, conclui a VOLTA e abre o detalhe da viagem
- **THEN** o registro da viagem contém a justificativa escolhida ou o texto livre

### Requirement: Justificativa de volta omitida na Ida do histórico
Quando o motorista justificar um ciclo incompleto (Ida encerrada sem Volta posterior), o sistema SHALL persistir o motivo nessa viagem de **IDA** do histórico, de forma auditável no detalhe. A nova viagem iniciada depois MUST NOT substituir esse registro. Viagens sem esse caso MUST NOT exigir o campo.

#### Scenario: Detalhe da Ida justificada
- **WHEN** o motorista confirma o motivo da volta omitida e abre o detalhe daquela Ida
- **THEN** o registro mostra a justificativa (chip ou texto livre)

### Requirement: Timeline em S no detalhe da viagem
Além da timeline de auditoria cronológica, o detalhe da viagem SHALL mostrar o percurso visual em formato de “S”, na ordem daquela viagem (ida ou volta), com o mesmo componente usado na execução.

#### Scenario: Percurso visível
- **WHEN** o usuário abre o detalhe de uma viagem com vários pontos
- **THEN** vê o caminho em “S” daquela ordem, sem substituir os horários da auditoria

### Requirement: Histórico com a mesma linguagem visual
A listagem de viagens, o detalhe e o recorte de histórico recente no Início SHALL usar os mesmos tokens de card branco, tipografia e espaçamento das demais telas operacionais. O recorte do Início MUST ser compacto (data/hora, rota, sentido, métricas e duração em linha), na mesma família da lista completa. Dados (sentido, duração, métricas, timeline de auditoria, mapa somente leitura, justificativas) MUST permanecer os já persistidos. Tocar um item MUST continuar abrindo o detalhe somente leitura.

#### Scenario: Lista alinhada ao Início
- **WHEN** o usuário abre Histórico depois de ver o histórico recente no Início
- **THEN** os cards compartilham a mesma hierarquia visual (data, rota, sentido, presentes/ausentes/pulados, duração)

#### Scenario: Detalhe somente leitura
- **WHEN** o usuário está no detalhe de uma viagem
- **THEN** não consegue alterar status; o layout segue o Design System
