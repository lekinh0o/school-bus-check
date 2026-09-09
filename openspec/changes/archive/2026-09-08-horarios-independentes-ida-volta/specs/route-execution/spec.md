## MODIFIED Requirements

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

## ADDED Requirements

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
