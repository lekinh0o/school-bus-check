## ADDED Requirements

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
