## Why

Os cadastros já existem no app, mas cargas iniciais e atualizações em lote ainda passam só pelos formulários. Administradores precisam importar e exportar alunos, escolas, rotas e veículos em Excel — um tipo por arquivo ou vários no mesmo workbook — sem depender de IDs internos e sem apagar o que não veio no arquivo.

## What Changes

- Introduzir um motor de Excel reutilizável: detectar abas pelo nome do contrato, não pela posição; ausência de aba não é erro.
- Importar e exportar `Alunos`, `Escolas`, `Rotas` e `Veículos` isoladamente ou juntos, com o mesmo contrato nos dois sentidos (arquivo exportado reimportável).
- Resolver vínculos por identificadores de negócio (placa; registro da escola quando houver; carteirinha/matrícula quando houver; título da rota + escola). IDs internos ficam só na persistência.
- Planejar a importação (novo, existente/atualização, duplicidade, conflito, referência ausente, erro de campo) e persistir só depois da confirmação na UI.
- Importação parcial não reescreve entidades cujas abas não vieram; célula vazia em atualização não apaga o valor persistido.
- Não incluir fotos, matching aproximado, quinta aba de pontos de embarque, nem um código novo de rota.

## Capabilities

### New Capabilities

- `cadastro-excel`: contrato das abas, importação/exportação parcial ou conjunta, preview, matching e persistência confirmada dos quatro cadastros.

### Modified Capabilities

- (nenhuma) As regras de cadastro em `school-registry`, `student-registry`, `route-registry` e `cadastro-input-validation` continuam valendo; o Excel as reutiliza, não as relaxa nem as substitui.

## Impact

- Novo módulo de parsing/planejamento (fora das telas), apply via slices Redux já existentes (`vehicles`, `schools`, `routes`, `students`) e `redux-persist`.
- UI de entrada em Cadastros: escolher arquivo, preview, confirmar; exportar todos, um tipo ou combinação.
- Dependências de leitura/escrita XLSX e picking/sharing de arquivo no Expo SDK 57.
- Testes Node do contrato e do planner (abas únicas/múltiplas, ordem, ausências, round-trip).
- GitHub: [issue #30](https://github.com/lekinh0o/school-bus-check/issues/30). Pré-requisito já em main: [issue #29](https://github.com/lekinh0o/school-bus-check/issues/29) (`registry`, `enrollmentCode`).
