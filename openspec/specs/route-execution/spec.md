# route-execution Specification

## Purpose

Permite ao motorista ou monitor escolher o sentido da viagem no momento de executar a rota, iniciar uma sessão de execução e acompanhar o percurso (timeline visual e paradas operacionais) na ordem ida ou invertida na volta, sem gravar esse sentido no cadastro da linha.

## Requirements

### Requirement: Acesso à execução a partir da listagem de rotas
O sistema SHALL listar as rotas disponíveis para execução na tela inicial (aba Início). Cada item MUST mostrar as duas janelas de horário cadastradas (ida e volta). Ao tocar uma rota, MUST abrir um painel (modal ou bottom sheet) com o seletor de sentido e o botão Iniciar Trajeto, sem iniciar a sessão ainda. Enquanto o usuário escolhe o sentido, o painel MUST exibir o par início–término correspondente àquela escolha. O mesmo painel MUST ser usado se o usuário tocar Executar na listagem de Cadastros.

#### Scenario: Abrir execução
- **WHEN** o usuário está no Início e toca uma rota da lista de execução
- **THEN** o sistema abre o painel de sentido, sem navegar ainda para a tela de execução e sem gravar sessão

#### Scenario: Iniciar trajeto
- **WHEN** o usuário escolhe IDA ou VOLTA e toca Iniciar Trajeto
- **THEN** o sistema inicia a sessão daquela rota e daquele sentido e abre a tela de execução

#### Scenario: Horário no card do Início
- **WHEN** a rota tem ida 06:00–07:10 e volta 11:00–12:10
- **THEN** o card no Início mostra as duas janelas, sem um único intervalo estático

### Requirement: Janela de horário do sentido em execução
Enquanto o painel de sentido estiver aberto, o sistema SHALL mostrar o bloco da ida (`início às fim` da ida) se IDA estiver selecionado, e o bloco da volta se VOLTA estiver selecionado. Na tela de execução em andamento, o sistema MUST exibir o mesmo par correspondente ao sentido da sessão. Trocar IDA/VOLTA no painel (antes de iniciar) MUST atualizar o horário mostrado; depois que a sessão começou, o horário MUST permanecer o do sentido da sessão.

#### Scenario: Painel com IDA
- **WHEN** o usuário seleciona IDA no painel de uma rota com ida 06:00–07:10
- **THEN** o painel mostra 06:00 às 07:10 (e não a janela da volta)

#### Scenario: Painel com VOLTA
- **WHEN** o usuário seleciona VOLTA no painel da mesma rota com volta 11:00–12:10
- **THEN** o painel mostra 11:00 às 12:10

#### Scenario: Tela de execução
- **WHEN** a sessão está em andamento no sentido VOLTA
- **THEN** a tela de execução mostra a janela de volta cadastrada, não a de ida

### Requirement: Seleção de sentido na execução
O sentido MUST ser escolhido no painel antes de Iniciar Trajeto. IDA (Casa → Escola) ou VOLTA (Escola → Casa). Depois que a sessão estiver em andamento, o sentido MUST NOT mudar. A timeline visual da execução MUST seguir o sentido: na ida, ponto inicial da van, pontos de embarque, escola; na volta, escola, pontos invertidos, ponto inicial.

#### Scenario: Escolher ida
- **WHEN** o usuário escolhe IDA e inicia o trajeto
- **THEN** a sessão e a timeline usam a ordem de ida (início da van → pontos → escola)

#### Scenario: Escolher volta
- **WHEN** o usuário escolhe VOLTA e inicia o trajeto
- **THEN** a sessão e a timeline usam a ordem de volta (escola → pontos invertidos → início da van)

#### Scenario: Trocar sentido
- **WHEN** o painel ainda está aberto e a sessão não começou, e o usuário troca IDA por VOLTA (ou o contrário)
- **THEN** o sentido do próximo Iniciar Trajeto é o último escolhido, sem sessão criada

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

### Requirement: Tabs Execução e Resumo
A tela de execução SHALL ter duas abas: Execução (passo do ponto atual) e Resumo (mapa de assentos e lista geral). Trocar de aba MUST NOT encerrar a sessão nem resetar o ponto atual.

#### Scenario: Alternar abas
- **WHEN** o usuário está na execução em andamento e toca Resumo, depois Execução
- **THEN** volta ao mesmo ponto atual com os mesmos status

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

### Requirement: Tab Resumo com mapa e correção
Na tab Resumo o sistema SHALL mostrar a planta do veículo da rota com a foto de cada aluno no assento. Aluno ausente na sessão MUST ter o assento com borda amarela evidenciada. A tab MUST listar todos os alunos da sessão com foto, permitir corrigir status (presente, ausente ou pendente) e oferecer o mesmo contato, sem voltar ao passo a passo.

#### Scenario: Ausente no mapa
- **WHEN** um aluno da sessão está ausente e ocupa um assento no veículo
- **THEN** o assento correspondente aparece com borda amarela grossa

#### Scenario: Corrigir na lista geral
- **WHEN** o usuário altera o status de um aluno na lista do Resumo
- **THEN** o status da sessão atualiza na hora e a tab Execução passa a refletir a correção

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

### Requirement: Alerta de falta na ida durante a VOLTA
Na execução em andamento no sentido VOLTA, o sistema SHALL destacar de forma visível (junto da foto e do nome) cada aluno cujo status na IDA encerrada daquela rota no mesmo dia foi `ABSENT`. O destaque MUST usar o tipo visual ALERTA. O destaque MUST ser só informativo: presente e ausente MUST permanecer acionáveis. Se não houver IDA do dia ou o aluno não esteve ausente nela, MUST NOT mostrar o alerta de falta na ida.

#### Scenario: Badge na lista da execução
- **WHEN** a sessão é VOLTA e o aluno esteve ausente na IDA do dia
- **THEN** as tabs Execução e Resumo mostram o aviso de que faltou na ida, e os botões de status continuam ativos

#### Scenario: Sem falta na ida
- **WHEN** o aluno não esteve ausente na IDA do dia (ou não há IDA)
- **THEN** o aviso de falta na ida não aparece para esse aluno

### Requirement: Atalho de navegação na parada atual
Na tab Execução, o sistema SHALL oferecer um atalho visível de navegação junto ao destaque da parada atual. O atalho MUST permitir abrir o Google Maps ou o Waze no destino daquela parada. Se a parada for um ponto de embarque, o ponto de início da rota ou a escola, e houver latitude e longitude cadastradas, MUST abrir o aplicativo escolhido nessas coordenadas. Se a parada não tiver coordenadas, MUST bloquear a abertura e mostrar um alerta. Se o aplicativo escolhido não puder ser aberto, MUST informar o usuário sem encerrar a sessão.

#### Scenario: Abrir Maps com GPS
- **WHEN** a parada atual tem coordenadas (embarque, início ou escola) e o usuário escolhe Google Maps
- **THEN** o sistema dispara a abertura do Maps nesse destino e a sessão de execução permanece em andamento

#### Scenario: Abrir Waze com GPS
- **WHEN** a parada atual tem coordenadas e o usuário escolhe Waze
- **THEN** o sistema dispara a abertura do Waze nesse destino

#### Scenario: Sem coordenadas
- **WHEN** o usuário aciona a navegação e a parada atual não tem latitude/longitude
- **THEN** o sistema mostra um alerta e não tenta abrir o mapa

#### Scenario: App indisponível
- **WHEN** o deep link do app escolhido falha
- **THEN** o usuário vê um aviso e a execução não é interrompida

### Requirement: Card em destaque da parada atual
Na tab Execução, o sistema SHALL destacar a parada atual acima da lista de alunos, com o nome do ponto, a quantidade de alunos exigidos naquela parada, a distância quando houver, o estado de aproximação e uma ação de navegação. O atalho MUST reutilizar a abertura já existente de Google Maps e Waze nas coordenadas da parada (embarque, início ou escola). A execução MUST continuar se a localização do aparelho ou do ponto faltar.

#### Scenario: Hero com alunos
- **WHEN** a sessão está em andamento na tab Execução
- **THEN** o card mostra o nome da parada atual e quantos alunos exigem ação naquele ponto

#### Scenario: Navegar reutiliza Maps e Waze
- **WHEN** o usuário escolhe Navegar e a parada tem coordenadas
- **THEN** o sistema oferece Google Maps e Waze pelo mesmo mecanismo já usado na execução

#### Scenario: Ponto sem coordenadas
- **WHEN** a parada atual não tem latitude/longitude
- **THEN** o card informa que o local do ponto não está cadastrado e a marcação de presença permanece disponível

### Requirement: Distância em tempo real na execução
Enquanto a sessão estiver em andamento e a tab Execução visível, o sistema SHALL acompanhar a localização em primeiro plano (após permissão) e calcular a distância até as coordenadas já persistidas da parada atual. Coordenadas inválidas ou ausentes MUST produzir distância indefinida, sem quebrar a sessão. Recusa de permissão ou GPS indisponível MUST mostrar estado amigável (indisponível ou carregando) e MUST NOT bloquear presença, pulo, conclusão ou encerramento. O acompanhamento MUST parar ao sair da tela de execução. A posição atual MUST NOT ser persistida.

#### Scenario: Distância disponível
- **WHEN** há permissão, posição do aparelho e coordenadas da parada
- **THEN** o card mostra a distância aproximada em metros ou quilômetros

#### Scenario: Sem permissão
- **WHEN** o usuário recusa a localização
- **THEN** o card indica localização indisponível e a execução segue utilizável

#### Scenario: Encerrar acompanhamento
- **WHEN** o usuário sai da tela de execução
- **THEN** o watcher de localização é removido

### Requirement: Chegada no raio de 50 metros
Quando a distância até a parada atual passar de maior que 50 m para menor ou igual a 50 m, o sistema SHALL indicar chegada com texto e destaque visual no card e tentar um som curto. Enquanto a distância permanecer ≤ 50 m na mesma parada, MUST NOT repetir o som. Ao mudar o índice da parada, o estado de geofence MUST ser reiniciado. Entrar no raio MUST NOT marcar alunos nem concluir o ponto. Se o som falhar, o destaque visual MUST permanecer.

#### Scenario: Entra no raio
- **WHEN** a distância vai de acima de 50 m para 50 m ou menos na mesma parada
- **THEN** o card mostra chegada e o som dispara no máximo uma vez nessa transição

#### Scenario: Permanece no raio
- **WHEN** atualizações seguintes ainda estão a 50 m ou menos da mesma parada
- **THEN** o sistema não dispara o som novamente

#### Scenario: Nova parada
- **WHEN** a sessão avança para outra parada
- **THEN** o geofence da parada anterior não impede um novo alerta na nova parada

### Requirement: Lista touch-first e barra inferior
Na tab Execução, cada aluno da parada atual MUST aparecer com foto maior que o avatar compacto anterior (ou placeholder), nome, ponto, status e contato do responsável pelo fluxo já existente. Presente, ausente e desembarque MUST permanecer as mesmas ações de sessão, com área de toque ampla, texto e ícone (não só cor). Anterior, Concluir/Encerrar e Próximo MUST permanecer com as mesmas travas. Se concluir estiver bloqueado por alunos ainda exigidos, o sistema MUST informar a quantidade. A aba Resumo MUST continuar com mapa de assentos e correção de status.

#### Scenario: Foto grande
- **WHEN** o aluno tem foto
- **THEN** a lista da execução mostra essa foto em tamanho maior que 64 px de lado

#### Scenario: Concluir bloqueado com motivo
- **WHEN** ainda há alunos exigidos sem ação na parada e o usuário tenta concluir
- **THEN** o sistema não avança e informa quantos ainda precisam ser avaliados

#### Scenario: Resumo intacto
- **WHEN** o usuário abre a aba Resumo durante a sessão
- **THEN** o mapa de assentos e a lista geral continuam disponíveis sem resetar o ponto atual

### Requirement: Timeline em S na execução
A timeline de percurso da execução SHALL dispor os pontos em linhas de “S”, com conectores visíveis na ordem da viagem. Muitos pontos MUST permanecer visíveis sem uma única faixa horizontal que corte o percurso fora da tela.

#### Scenario: Muitas paradas
- **WHEN** a rota tem mais paradas do que cabem numa linha
- **THEN** a timeline continua na linha de baixo no sentido inverso, com conector entre as linhas

### Requirement: Apresentação do Início alinhada ao Design System
A tela inicial SHALL seguir a composição do mockup de Início: cabeçalho com título Início; data por extenso e turno na mesma linha; controles de sino e de alerta no canto (sino MAY mostrar indicador visual; MUST NOT inventar store de notificações). Se houver ciclo Ida/Volta incompleto, MUST mostrar banner de atenção compacto (alerta + texto + chevron) com ação de justificar no próprio banner, sem botão primário gigante separado, e sem mudar as regras de justificativa. A seção de rotas MUST usar título de seção; cada rota MUST ser um card branco com ícone em poço, nome, escola, status operacional, dois CTAs lado a lado (Iniciar Ida / Iniciar Volta, primária verde da família Cadastros/Execução, não azul/amarelo do print) e janelas de horário abaixo de cada CTA. Timeline de paradas MUST NOT ocupar o card do Início. Histórico recente MUST ser um card (ou lista compacta na mesma família) com linhas de data/hora, rota e sentido, presentes/ausentes/pulados e duração, e atalho para o Histórico existente. Ações de sentido MUST continuar abrindo o fluxo existente de iniciar trajeto.

#### Scenario: Card com Ida e Volta independentes
- **WHEN** o usuário está no Início e a rota permite os dois sentidos
- **THEN** o card mostra as duas janelas abaixo dos CTAs e oferece ação separada de Ida e de Volta, ambas levando ao fluxo já existente de iniciar trajeto

#### Scenario: Pendência visível
- **WHEN** existe ciclo incompleto que o app já sabe justificar
- **THEN** o Início destaca essa pendência num banner de atenção e oferece a ação de justificar, sem iniciar a sessão sozinho

### Requirement: Cockpit visual sem mudar a operação
A tab Execução e a tab Resumo SHALL seguir a composição dos mockups sobre o cockpit já entregue: header claro com voltar, nome da rota e turno/janela; abas Execução/Resumo; na Execução, hero claro/mint da parada atual (rótulo, nome, ponto, índice N de M, ação de próxima parada se já existir na #19), timeline de paradas, métricas presentes/ausentes/pulados, anterior/concluir/próximo, card do aluno (foto, contato, Presente/Ausente/Pular conforme regras atuais). Na Resumo: card da rota e status, métricas, mapa de assentos, lista de alunos, ações finais já existentes. GPS, geofence, Maps/Waze, fotos, travas e marcação MUST permanecer acionáveis. Estados de distância MUST continuar distinguíveis por texto, não só por cor. MUST NOT reimplementar a #19; alteração permitida é apresentação (incluindo hero claro em vez de painel escuro, se isso alinhar o mockup).

#### Scenario: Hero permanece o foco
- **WHEN** a sessão está em andamento na tab Execução
- **THEN** o card da parada atual continua no topo com nome, alunos, distância ou estado de GPS e navegação, só com apresentação alinhada ao mockup e ao Design System

#### Scenario: Travas iguais
- **WHEN** ainda há alunos exigidos sem ação
- **THEN** concluir permanece bloqueado e o motivo continua compreensível
