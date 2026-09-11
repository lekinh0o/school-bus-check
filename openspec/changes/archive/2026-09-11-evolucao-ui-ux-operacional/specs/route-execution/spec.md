## MODIFIED Requirements

### Requirement: Cabeçalho fixo da tab Execução
Na tab Execução, o sistema SHALL manter no topo (fixo ao rolar a lista) os contadores de presentes, ausentes e pontos pulados, um card em destaque da parada atual (nome do ponto e se é embarque ou desembarque) e uma timeline de ícones do percurso em formato de “S” (linhas alternadas esquerda–direita e direita–esquerda, com conectores). Ícones da timeline e áreas de toque relacionadas MUST ter no mínimo 48px (`h-12 w-12`). Pontos ainda não concluídos MUST aparecer como pendentes; pontos já passados MUST aparecer como concluídos; o ponto atual MUST ficar visualmente distinto. Na ida, o primeiro ícone é o ponto inicial da van e o último é a escola. Na volta, o primeiro ícone é a escola e o último é o ponto inicial da van.

#### Scenario: Contadores visíveis
- **WHEN** a sessão está em andamento
- **THEN** o cabeçalho mostra quantos estão presentes, ausentes e quantos pontos foram pulados

#### Scenario: Timeline na ida
- **WHEN** o sentido é IDA
- **THEN** a timeline começa no ponto inicial, mostra cada ponto de embarque como pendente ou concluído, e termina na escola

#### Scenario: Timeline na volta
- **WHEN** o sentido é VOLTA
- **THEN** a timeline começa na escola, mostra os pontos invertidos como pendente ou concluído, e termina no ponto inicial

#### Scenario: Parada atual em destaque
- **WHEN** a sessão está em um ponto que não é o último
- **THEN** o card da parada atual mostra o nome desse ponto de forma destacada, sem depender de scroll horizontal para identificá-lo

### Requirement: Passo a passo com foto, status e contato
Na tab Execução o sistema SHALL mostrar a lista de alunos do ponto atual, cada um com foto (`photoUri`) em avatar circular ou placeholder, botões de presente e ausente com área de toque ampla, e um controle para contatar o responsável. Os rótulos MUST ser embarque ou desembarque conforme o ponto: na ida, desembarque só na escola; na volta, embarque na escola e desembarque nos pontos da criança. Segurar a foto MUST abrir a foto ampliada com o nome do aluno. Contato com um único telefone MUST abrir o WhatsApp; com dois ou mais MUST abrir um seletor e, após a escolha, permitir WhatsApp ou ligação.

#### Scenario: Foto na lista
- **WHEN** o aluno tem foto
- **THEN** a lista mostra essa foto no avatar; se não houver foto, mostra placeholder

#### Scenario: Ampliar foto
- **WHEN** o usuário faz long press na foto de um aluno que tem `photoUri`
- **THEN** o sistema mostra a foto ampliada e o nome completo; fechar o modal volta à lista

#### Scenario: Contato
- **WHEN** o usuário aciona o contato do responsável com um único telefone cadastrado
- **THEN** o sistema abre o WhatsApp daquele número

#### Scenario: Vários telefones
- **WHEN** o aluno tem mais de um telefone e o usuário aciona contato
- **THEN** o sistema lista os números para escolha e só então abre WhatsApp ou ligação do número escolhido

#### Scenario: Rótulos na escola na ida
- **WHEN** o ponto atual é a escola na ida
- **THEN** os botões de ação usam a nomenclatura de desembarque para quem está na van

### Requirement: Anterior, concluir, próximo e auto-avanço
O sistema SHALL oferecer Anterior (volta um ponto se não for o primeiro), Concluir (avança só se todos os alunos exigidos do ponto já tiverem status) e Próximo (pular o ponto só se nenhum aluno da lista atual tiver sido marcado neste ponto). Ao marcar o último aluno ainda pendente da lista do ponto, o sistema MUST concluir o ponto sozinho e avançar, se houver próximo ponto. Encerrar a rota no último ponto continua bloqueado se houver aluno presente na van. Tocar Concluir sem poder avançar MUST mostrar um aviso ERRO padronizado, sem avançar o ponto.

#### Scenario: Concluir bloqueado
- **WHEN** ainda há aluno do ponto sem status
- **THEN** Concluir não avança o ponto

#### Scenario: Aviso ao concluir inválido
- **WHEN** o usuário toca Concluir com aluno do ponto ainda pendente
- **THEN** o sistema mostra um alerta do tipo ERRO e permanece no mesmo ponto

#### Scenario: Próximo só sem marcações
- **WHEN** pelo menos um aluno da lista do ponto já foi marcado
- **THEN** Próximo permanece desabilitado

#### Scenario: Auto-avanço
- **WHEN** o usuário marca o último aluno que faltava no ponto e existe próximo ponto
- **THEN** o ponto é concluído e a sessão vai para o próximo

### Requirement: Alerta de falta na ida durante a VOLTA
Na execução em andamento no sentido VOLTA, o sistema SHALL destacar de forma visível (junto da foto e do nome) cada aluno cujo status na IDA encerrada daquela rota no mesmo dia foi `ABSENT`. O destaque MUST usar o tipo visual ALERTA. O destaque MUST ser só informativo: presente e ausente MUST permanecer acionáveis. Se não houver IDA do dia ou o aluno não esteve ausente nela, MUST NOT mostrar o alerta de falta na ida.

#### Scenario: Badge na lista da execução
- **WHEN** a sessão é VOLTA e o aluno esteve ausente na IDA do dia
- **THEN** as tabs Execução e Resumo mostram o aviso de que faltou na ida, e os botões de status continuam ativos

#### Scenario: Sem falta na ida
- **WHEN** o aluno não esteve ausente na IDA do dia (ou não há IDA)
- **THEN** o aviso de falta na ida não aparece para esse aluno

## ADDED Requirements

### Requirement: Timeline em S na execução
A timeline de percurso da execução SHALL dispor os pontos em linhas de “S”, com conectores visíveis na ordem da viagem. Muitos pontos MUST permanecer visíveis sem uma única faixa horizontal que corte o percurso fora da tela.

#### Scenario: Muitas paradas
- **WHEN** a rota tem mais paradas do que cabem numa linha
- **THEN** a timeline continua na linha de baixo no sentido inverso, com conector entre as linhas
