## ADDED Requirements

### Requirement: Apresentação do Início alinhada ao Design System
A tela inicial SHALL seguir a composição do mockup de Início: cabeçalho com título Início; data por extenso e turno na mesma linha; controles de sino e de alerta no canto (sino MAY mostrar indicador visual; MUST NOT inventar store de notificações). Se houver ciclo Ida/Volta incompleto, MUST mostrar banner de atenção compacto (alerta + texto + chevron) com ação de justificar no próprio banner, sem botão primário gigante separado, e sem mudar as regras de justificativa. A seção de rotas MUST usar título de seção; cada rota MUST ser um card branco com ícone em poço, nome, escola, status operacional, dois CTAs lado a lado (Iniciar Ida / Iniciar Volta, primária verde da família Cadastros/Execução, não azul/amarelo do print) e janelas de horário abaixo de cada CTA. Timeline de paradas MUST NOT ocupar o card do Início. Histórico recente MUST ser um card (ou lista compacta na mesma família) com linhas de data/hora, rota e sentido, presentes/ausentes/pulados e duração, e atalho para o Histórico existente. Ações de sentido MUST continuar abrindo o fluxo existente de iniciar trajeto.

#### Scenario: Card com Ida e Volta independentes
- **WHEN** o usuário está no Início e a rota permite os dois sentidos
- **THEN** o card mostra as duas janelas abaixo dos CTAs e oferece ação separada de Ida e de Volta, ambas levando ao fluxo já existente de iniciar trajeto

#### Scenario: Pendência visível
- **WHEN** existe ciclo incompleto que o app já sabe justificar
- **THEN** o Início destaca essa pendência num banner de atenção e oferece a ação de justificar, sem iniciar a sessão sozinho

### Requirement: Cockpit visual sem mudar a operação
A tab Execução e a tab Resumo SHALL seguir a composição dos mockups sobre o cockpit já entregue: header claro com voltar, nome da rota e turno/janela; abas Execução/Resumo; na Execução, hero claro/mint da parada atual (rótulo, nome, ponto, índice N de M, ação de próxima parada se já existir na #19), timeline de paradas, métricas presentes/ausentes/pulados, anterior/concluir/próximo, card do aluno (foto, contato, Presente/Ausente/Pular conforme regras atuais). Na Resumo: card da rota e status, métricas, mapa de assentos, lista de alunos, ações finais já existentes. GPS, geofence, Maps/Waze, fotos, travas e marcação MUST permanecer acionáveis. Estados de distância MUST continuar distinguíveis por texto, não só por cor. MUST NOT reimplementar a #19; alteração permitida é apresentação (incluindo hero claro em vez de painel escuro, se isso alinhar o mockup).

#### Scenario: Hero permanece o foco
- **WHEN** a sessão está em andamento na tab Execução
- **THEN** o card da parada atual continua no topo com nome, alunos, distância ou estado de GPS e navegação, só com apresentação alinhada ao mockup e ao Design System

#### Scenario: Travas iguais
- **WHEN** ainda há alunos exigidos sem ação
- **THEN** concluir permanece bloqueado e o motivo continua compreensível
