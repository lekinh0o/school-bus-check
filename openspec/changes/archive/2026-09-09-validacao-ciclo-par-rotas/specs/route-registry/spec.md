## ADDED Requirements

### Requirement: Tipo de operação da rota
O sistema SHALL persistir em cada rota um tipo de operação: Ida e Volta obrigatórias, apenas Ida, ou apenas Volta. O cadastro MUST oferecer essa escolha no formulário. Na criação, o valor padrão MUST ser Ida e Volta obrigatórias. Rotas já persistidas sem o campo MUST ser tratadas como Ida e Volta obrigatórias. O tipo de operação MUST NOT ser confundido com o sentido da sessão (IDA/VOLTA).

#### Scenario: Nova rota com padrão
- **WHEN** o usuário cria uma rota e não altera o tipo de operação
- **THEN** a rota é persistida como Ida e Volta obrigatórias

#### Scenario: Escolher apenas Ida
- **WHEN** o usuário salva a rota como apenas Ida
- **THEN** o valor persistido é apenas Ida e permanece ao reabrir o formulário

#### Scenario: Lista mostra o tipo
- **WHEN** a listagem de rotas está visível
- **THEN** cada card indica o tipo de operação daquela rota
