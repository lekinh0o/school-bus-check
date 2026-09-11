## Purpose

Define formatos aceitos nos campos de cadastro para placa, telefone brasileiro, horário e quantidades inteiras, de modo que o sistema recuse valores inválidos antes de persistir.

## ADDED Requirements

### Requirement: Placa de veículo em formato brasileiro
O sistema SHALL aceitar placa apenas no padrão antigo `ABC-1234` ou Mercosul `ABC1D23`, sempre em maiúsculas. Outros formatos MUST NOT ser persistidos.

#### Scenario: Placa Mercosul válida
- **WHEN** o usuário informa uma placa no formato Mercosul com letras maiúsculas e salva
- **THEN** o sistema persiste a placa normalizada

#### Scenario: Placa inválida
- **WHEN** a placa não casa com antigo nem Mercosul
- **THEN** o sistema MUST NOT persistir o veículo

### Requirement: Telefone brasileiro com DDD
O sistema SHALL mascarar telefones no padrão `(DD) 9XXXX-XXXX` ou `(DD) XXXX-XXXX` e MUST exigir pelo menos 10 dígitos. Valor com menos dígitos MUST NOT ser persistido.

#### Scenario: Telefone válido
- **WHEN** o usuário informa um número com DDD e pelo menos 10 dígitos e salva
- **THEN** o sistema persiste o telefone mascarado

#### Scenario: Poucos dígitos
- **WHEN** o telefone tem menos de 10 dígitos
- **THEN** o sistema MUST NOT persistir o registro

### Requirement: Horário no formato HH:MM
O sistema SHALL aceitar `startTime` e `endTime` apenas como hora `HH:MM` com hora 00–23 e minuto 00–59.

#### Scenario: Horário válido
- **WHEN** início e fim estão em `HH:MM` válido e o usuário salva a rota
- **THEN** o sistema persiste esses horários

#### Scenario: Horário inválido
- **WHEN** o texto não é `HH:MM` válido
- **THEN** o sistema MUST NOT persistir a rota

### Requirement: Inteiros positivos em idade e assentos
O sistema SHALL aceitar idade do aluno e quantidade de assentos do veículo apenas como inteiros maiores que zero.

#### Scenario: Quantidade válida
- **WHEN** o usuário informa um inteiro positivo e salva
- **THEN** o sistema persiste o número

#### Scenario: Zero ou não numérico
- **WHEN** o valor é zero, negativo ou não é inteiro
- **THEN** o sistema MUST NOT persistir
