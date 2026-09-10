## ADDED Requirements

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
