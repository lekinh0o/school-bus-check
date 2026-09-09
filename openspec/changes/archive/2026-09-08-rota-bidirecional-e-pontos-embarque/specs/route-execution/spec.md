## Purpose

Permite ao motorista ou monitor escolher o sentido da viagem no momento de executar a rota e ver a timeline na ordem ida ou invertida na volta, sem gravar esse sentido no cadastro da linha.

## ADDED Requirements

### Requirement: Acesso à execução a partir da listagem de rotas
O sistema SHALL oferecer, em cada rota da listagem, uma ação para executar a rota. Ao tocar, MUST abrir a tela de execução daquela rota.

#### Scenario: Abrir execução
- **WHEN** o usuário está na listagem de rotas e toca executar em uma rota
- **THEN** o sistema abre a tela de execução daquela rota

### Requirement: Seleção de sentido na execução
Ao abrir a execução, o sistema SHALL exigir a escolha de sentido antes de mostrar o percurso operacional: IDA (Casa → Escola) ou VOLTA (Escola → Casa). Enquanto o sentido não for escolhido, o percurso operacional MUST NOT aparecer como se o sentido já estivesse definido.

#### Scenario: Escolher ida
- **WHEN** o usuário escolhe Sentido IDA
- **THEN** a timeline usa a ordem cadastrada: ponto inicial, depois `boardingPoints` na ordem salva, depois a escola

#### Scenario: Escolher volta
- **WHEN** o usuário escolhe Sentido VOLTA
- **THEN** a timeline usa a ordem invertida: escola, depois `boardingPoints` do último ao primeiro, depois o ponto inicial (retorno)

#### Scenario: Trocar sentido
- **WHEN** o usuário já escolheu um sentido e escolhe o outro
- **THEN** a timeline atualiza na hora para a nova ordem
