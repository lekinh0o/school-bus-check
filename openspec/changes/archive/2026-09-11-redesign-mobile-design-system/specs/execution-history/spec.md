## ADDED Requirements

### Requirement: Histórico com a mesma linguagem visual
A listagem de viagens, o detalhe e o recorte de histórico recente no Início SHALL usar os mesmos tokens de card branco, tipografia e espaçamento das demais telas operacionais. O recorte do Início MUST ser compacto (data/hora, rota, sentido, métricas e duração em linha), na mesma família da lista completa. Dados (sentido, duração, métricas, timeline de auditoria, mapa somente leitura, justificativas) MUST permanecer os já persistidos. Tocar um item MUST continuar abrindo o detalhe somente leitura.

#### Scenario: Lista alinhada ao Início
- **WHEN** o usuário abre Histórico depois de ver o histórico recente no Início
- **THEN** os cards compartilham a mesma hierarquia visual (data, rota, sentido, presentes/ausentes/pulados, duração)

#### Scenario: Detalhe somente leitura
- **WHEN** o usuário está no detalhe de uma viagem
- **THEN** não consegue alterar status; o layout segue o Design System
