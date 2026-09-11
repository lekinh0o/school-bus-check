## ADDED Requirements

### Requirement: Local da escola no mapa
O cadastro da escola SHALL permitir marcar a localização da escola no mapa (busca pelo endereço ou toque/arraste do pino). Coordenadas MUST NOT ser obrigatórias para salvar. Se marcadas, MUST persistir com a escola e permanecer ao reabrir o formulário.

#### Scenario: Marcar escola no mapa
- **WHEN** o usuário confirma um pino no mapa da escola e salva
- **THEN** a escola persiste latitude e longitude e o formulário mostra que o local está marcado
