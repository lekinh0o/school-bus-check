## Purpose

Garante que o chrome inferior do School Bus Check (Tab Bar, barras de ação, botões fixos e sheets de rodapé) fique acima da área reservada pelo sistema, usando os insets reais da janela em Android e iOS.

## ADDED Requirements

### Requirement: Tab Bar acima da barra de navegação do sistema
A barra de abas SHALL ocupar a altura visual atual do chrome mais o inset inferior reportado pelo sistema. Ícones e labels MUST permanecer inteiramente visíveis. A altura extra MUST vir do inset dinâmico, MUST NOT de um valor fixo por modelo ou plataforma.

#### Scenario: Android com três botões
- **WHEN** o operador usa o app num Android com navegação ◀ ● ■
- **THEN** nenhum ícone ou label da Tab Bar fica atrás dos botões do sistema

#### Scenario: Android com gestos
- **WHEN** o operador usa o app num Android com navegação por gestos
- **THEN** a Tab Bar fica acima da área de gesto e MUST NOT criar um poço vazio desproporcional além do inset reportado

#### Scenario: iOS
- **WHEN** o operador usa o app no iOS
- **THEN** a Tab Bar continua acima do home indicator e o espaçamento interno do chrome (cores, labels, ícones) permanece o mesmo da identidade atual

### Requirement: Rodapés fora das tabs respeitam o inset inferior
Telas e componentes compartilhados com ações coladas na base da janela (barra de conclusão da execução, botão flutuante de cadastro, sheet/modal de rodapé) SHALL somar o inset inferior do sistema ao recuo visual existente. MUST NOT alterar o fluxo, as cores nem os rótulos dessas ações.

#### Scenario: Barra da execução
- **WHEN** o operador está na execução da rota num Android com três botões
- **THEN** os botões Anterior / Concluir / Pular ficam acima da barra de navegação do sistema

#### Scenario: FAB de cadastro
- **WHEN** o operador está na lista de escolas, rotas ou alunos num Android com três botões
- **THEN** o botão de ação na base da tela permanece tocável e não fica atrás dos controles do sistema

#### Scenario: Gestos e iOS nos rodapés
- **WHEN** o inset inferior é pequeno (gestos) ou o de iOS (home indicator)
- **THEN** o recuo extra corresponde ao inset, sem duplicar a área da Tab Bar nessas telas de stack

### Requirement: Insets vêm do sistema, não de constantes de aparelho
O recuo inferior SHALL usar o inset inferior fornecido pelo ambiente de janela em tempo de execução. MUST NOT existir constante do tipo “Android = 48” ou “Pixel = 80” para compensar a barra de navegação.

#### Scenario: Tamanhos de barra diferentes
- **WHEN** dois dispositivos reportam insets inferiores distintos
- **THEN** o recuo aplicado em cada um coincide com o inset daquele dispositivo
