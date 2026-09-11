## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Timeline em S no detalhe da viagem
Além da timeline de auditoria cronológica, o detalhe da viagem SHALL mostrar o percurso visual em formato de “S”, na ordem daquela viagem (ida ou volta), com o mesmo componente usado na execução.

#### Scenario: Percurso visível
- **WHEN** o usuário abre o detalhe de uma viagem com vários pontos
- **THEN** vê o caminho em “S” daquela ordem, sem substituir os horários da auditoria
