## ADDED Requirements

### Requirement: Atalho de navegação na parada atual
Na tab Execução, o sistema SHALL oferecer um atalho visível de navegação junto ao destaque da parada atual. O atalho MUST permitir abrir o Google Maps ou o Waze no destino daquela parada. Se a parada atual for um ponto de embarque com latitude e longitude, MUST abrir o aplicativo escolhido centrado nessas coordenadas. Se a parada não tiver coordenadas (ponto sem GPS, ponto inicial sem geo, ou escola), MUST bloquear a abertura e mostrar um alerta informando que não há localização cadastrada. Se o aplicativo escolhido não puder ser aberto, MUST informar o usuário sem encerrar a sessão.

#### Scenario: Abrir Maps com GPS
- **WHEN** a parada atual é um ponto de embarque com coordenadas e o usuário escolhe Google Maps
- **THEN** o sistema dispara a abertura do Maps nesse destino e a sessão de execução permanece em andamento

#### Scenario: Abrir Waze com GPS
- **WHEN** a parada atual é um ponto de embarque com coordenadas e o usuário escolhe Waze
- **THEN** o sistema dispara a abertura do Waze nesse destino

#### Scenario: Sem coordenadas
- **WHEN** o usuário aciona a navegação e a parada atual não tem latitude/longitude
- **THEN** o sistema mostra um alerta e não tenta abrir o mapa

#### Scenario: App indisponível
- **WHEN** o deep link do app escolhido falha
- **THEN** o usuário vê um aviso e a execução não é interrompida
