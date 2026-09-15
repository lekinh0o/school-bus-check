# cadastro-input-validation Specification

## Purpose

Define formatos aceitos nos campos de cadastro para placa, telefone brasileiro, horário e quantidades inteiras, de modo que o sistema recuse valores inválidos antes de persistir.

## Requirements

### Requirement: Placa de veículo em formato brasileiro
O sistema SHALL aceitar placa apenas no padrão antigo `ABC-1234` ou Mercosul `ABC1D23`, sempre em maiúsculas. Outros formatos MUST NOT ser persistidos.

#### Scenario: Placa Mercosul válida
- **WHEN** o usuário informa uma placa no formato Mercosul com letras maiúsculas e salva
- **THEN** o sistema persiste a placa normalizada

#### Scenario: Placa inválida
- **WHEN** a placa não casa com antigo nem Mercosul
- **THEN** o sistema MUST NOT persistir o veículo

### Requirement: Telefone brasileiro com DDD
O sistema SHALL mascarar telefones no padrão `(DD) 9XXXX-XXXX` ou `(DD) XXXX-XXXX` quando o campo está preenchido e MUST exigir pelo menos 10 dígitos nesse caso. Valor preenchido com menos dígitos MUST NOT ser persistido. Em cadastros em que o telefone é opcional, campo vazio MUST NOT ser tratado como formato inválido e MUST ser omitido.

#### Scenario: Telefone válido
- **WHEN** o usuário informa um número com DDD e pelo menos 10 dígitos e salva
- **THEN** o sistema persiste o telefone mascarado

#### Scenario: Poucos dígitos
- **WHEN** o telefone está preenchido e tem menos de 10 dígitos
- **THEN** o sistema MUST NOT persistir o registro

#### Scenario: Telefone opcional vazio
- **WHEN** o telefone de um cadastro em que o campo é opcional está vazio e os demais campos obrigatórios são válidos
- **THEN** o sistema persiste o registro sem telefone

### Requirement: Horário no formato HH:MM
O sistema SHALL aceitar os horários da rota apenas como hora `HH:MM` com hora 00–23 e minuto 00–59. Isso MUST aplicar-se aos quatro campos: início e término da ida e início e término da volta.

#### Scenario: Horário válido
- **WHEN** os quatro horários estão em `HH:MM` válido e o usuário salva a rota
- **THEN** o sistema persiste esses horários

#### Scenario: Horário inválido
- **WHEN** qualquer um dos quatro horários não é `HH:MM` válido
- **THEN** o sistema MUST NOT persistir a rota

### Requirement: Inteiros positivos em idade e assentos
O sistema SHALL aceitar quantidade de assentos do veículo apenas como inteiro maior que zero. Idade do aluno, quando preenchida, MUST ser um inteiro maior que zero; idade vazia no cadastro do aluno MUST ser omitida e MUST NOT impedir o salvamento. Zero, negativo ou não inteiro em campo preenchido MUST NOT ser persistido.

#### Scenario: Quantidade válida
- **WHEN** o usuário informa um inteiro positivo de assentos e salva o veículo
- **THEN** o sistema persiste o número

#### Scenario: Idade opcional vazia
- **WHEN** a idade do aluno está vazia e os demais campos obrigatórios são válidos
- **THEN** o sistema persiste o aluno sem idade

#### Scenario: Zero ou não numérico
- **WHEN** o valor preenchido é zero, negativo ou não é inteiro
- **THEN** o sistema MUST NOT persistir
