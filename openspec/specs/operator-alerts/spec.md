# operator-alerts Specification

## Purpose

Padroniza avisos visuais ao operador (informação, alerta e erro) para que bloqueios e avisos críticos não passem como texto solto na tela.

## Requirements

### Requirement: Tipos visuais de alerta
O sistema SHALL apresentar avisos operacionais com um de três tipos: INFO (azul), ALERTA (âmbar) e ERRO (vermelho). Cada tipo MUST ter ícone e fundo compatíveis com o tipo. O operador MUST conseguir dispensar o aviso.

#### Scenario: INFO
- **WHEN** o sistema mostra um aviso informativo
- **THEN** o aviso usa o tipo INFO (azul)

#### Scenario: ALERTA
- **WHEN** o sistema mostra um aviso de atenção (incluindo falta na ida na VOLTA)
- **THEN** o aviso usa o tipo ALERTA (âmbar)

#### Scenario: ERRO
- **WHEN** o sistema recusa uma ação inválida (ex.: concluir ponto com aluno pendente)
- **THEN** o aviso usa o tipo ERRO (vermelho)
