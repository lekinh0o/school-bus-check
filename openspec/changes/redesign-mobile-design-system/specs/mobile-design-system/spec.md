## Purpose

Define a linguagem visual única do School Bus Check (tokens, tipografia, espaçamento, cards e botões) para que Início, Cadastros, Execução, Resumo e Histórico reproduzam a composição dos mockups aprovados, sem criar um segundo tema nem um produto azul paralelo.

## ADDED Requirements

### Requirement: Tokens visuais únicos
O aplicativo SHALL expor um conjunto único de tokens semânticos de cor (primária e variantes, sucesso, aviso, perigo, erro, informação, fundo quase branco, superfície branca, textos escuros, borda quase imperceptível, desabilitado, e poços pastel suaves para ícones de cadastro). Telas MUST NOT introduzir uma paleta paralela (incluindo o azul/amarelo do mockup de Início de outra família). A identidade verde existente MUST permanecer a base da primária e do estado ativo da navegação.

#### Scenario: Mesma primária no Início e na Execução
- **WHEN** o usuário compara o destaque de ação no Início e na Execução
- **THEN** ambos usam a mesma cor primária verde do Design System, não uma tab azul no Início e verde na Execução

### Requirement: Hierarquia tipográfica e espaçamento
Títulos de tela, seção e card, corpo e texto auxiliar MUST seguir uma hierarquia estável (tela maior e em negrito; auxiliar menor). Espaçamento de layout MUST usar a escala 4, 8, 12, 16, 20, 24, 32, 40, salvo ajuste pontual de safe area. Raios MUST permanecer na escala 12, 16, 20, 24 (cards 16–24, botões 12–20, poços de ícone 16–20). Sombras MUST ser sutis; MUST NOT haver borda verde grossa em cards.

#### Scenario: Título de tela maior que seção
- **WHEN** uma tela operacional mostra título de tela e título de seção
- **THEN** o título de tela é visualmente maior e mais pesado que o de seção

### Requirement: Superfícies alinhadas
Cards e botões das cinco superfícies (Início, Cadastros, Execução, Resumo, Histórico) MUST compartilhar raio, preenchimento claro e estados pressed/disabled reconhecíveis. Informação crítica MUST NÃO depender só de cor (ícone ou texto junto). Cards operacionais MUST parecer superfície branca sobre fundo cinza muito claro, não painéis preenchidos com a primária.

#### Scenario: Botão desabilitado reconhecível
- **WHEN** uma ação está desabilitada
- **THEN** o controle mostra estado disabled por contraste e, quando couber, texto, não apenas uma cor mais fraca sem contexto

### Requirement: Cadastros como hub visual
A tela de Cadastros SHALL apresentar Veículos, Escolas, Rotas e Alunos em grid 2×2. Cada item MUST ser um card branco com: (1) ícone em container pastel (veículos verde, escolas azul/lilás, rotas amarelo, alunos lilás; tons suaves, não neon); (2) título escuro; (3) descrição cinza; (4) faixa ou pílula própria em verde-claro com quantidade real e seta. Destinos de navegação MUST permanecer os atuais. MUST NOT usar o card inteiro preenchido de verde nem borda verde pesada.

#### Scenario: Contadores reais
- **WHEN** existem N escolas cadastradas
- **THEN** o item Escolas mostra essa quantidade, não um valor fictício

#### Scenario: Card branco com faixa de contador
- **WHEN** o usuário abre Cadastros com cadastros habilitados
- **THEN** cada card tem fundo branco, ícone em poço pastel e o contador aparece numa área visual distinta (faixa ou pílula), não solto no mesmo bloco do título
