# School Bus Check 🚍

O **School Bus Check** é um aplicativo desenvolvido em **React Native com Expo** projetado para motoristas e monitores de transporte escolar. O objetivo principal é garantir a segurança dos alunos e a tranquilidade dos pais por meio de uma lista de presença inteligente, monitorando em tempo real o fluxo de embarque e desembarque de ponta a ponta.

## 📋 Funcionalidades Principais (Regras de Fluxo)

O coração do aplicativo baseia-se no controle estrito das etapas de transporte diário dos estudantes, dividido em dois turnos principais:

### 🌅 1. Turno da Manhã (Ida para a Escola)
*   **Ida (Ingresso):** Registro do momento em que o aluno entra no transporte escolar na porta de sua casa.
*   **Ida (Ausente):** Sinalização caso o aluno não vá utilizar o transporte naquele dia (aviso prévio dos pais), otimizando a rota.
*   **Escola (Desembarque):** Confirmação crucial de que o aluno saiu em segurança do veículo e adentrou as dependências da escola.

### 🌆 2. Turno da Tarde (Volta para Casa)
*   **Volta (Ingresso):** Registro do momento em que o aluno embarca no veículo na saída da escola.
*   **Volta (Ausente):** Sinalização caso o aluno retorne por outros meios (ex: pais buscaram direto na escola), evitando atrasos e esperas desnecessárias.
*   **Volta (Desembarque):** Confirmação final de que o aluno foi entregue em segurança no seu ponto de destino/residência.

---

## 🛠️ Tecnologias Utilizadas

*   **React Native** — Desenvolvimento da estrutura mobile cross-platform.
*   **Expo (Expo Router)** — Arquitetura de rotas baseada em arquivos e facilidade de deploy.
*   **TypeScript** — Tipagem estática para maior segurança no controle de estados e fluxos.
*   **NativeWind (Tailwind CSS)** — Estilização rápida, limpa e responsiva.

---

## 📂 Estrutura de Pastas Sugerida

```text
├── app/                  # Rotas e telas do aplicativo (Expo Router)
│   ├── (auth)/           # Telas de autenticação (Login)
│   ├── (tabs)/           # Telas principais de navegação (Home/Dashboard, Rotas)
│   └── _layout.tsx       # Layout raiz global
├── components/           # Componentes reutilizáveis UI (Botões, Cards de Alunos)
├── hooks/                # Hooks customizados para gerenciamento de estado
├── constants/            # Cores, estilos globais e configurações fixed
└── package.json          # Dependências do projeto
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
Antes de começar, certifique-se de ter o **Node.js** instalado em sua máquina.

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/lekinh0o/school-bus-check.git
   ```

2. **Entre no diretório do projeto:**
   ```bash
   cd school-bus-check
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

4. **Inicie o servidor de desenvolvimento do Expo:**
   ```bash
   npx expo start
   ```

5. **Para testar no celular Android:**
   Baixe o aplicativo **Expo Go** na Google Play Store e escaneie o QR Code gerado no terminal.
