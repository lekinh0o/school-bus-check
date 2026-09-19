## Context

Ver `proposal.md` (Why). Não há parser Excel no app. Cadastros vivem em RTK + `redux-persist` (`store/store.ts`), adapters por `id` em `vehicleSlice`, `schoolSlice`, `routeSlice`, `studentSlice`. Tipos em `types/index.ts`: `Vehicle.plate`, `School.registry?`, `Student.enrollmentCode?`, `Route` sem código de negócio (só `title` + `schoolId`). Pontos de embarque são `Route.boardingPoints[]`; o aluno guarda o **nome** em `boardingPoint`. Validação de placa/telefone/`HH:MM`/inteiro já está em `lib/inputMasks.ts` e `lib/optionalFields.ts`. UI de cadastros: `app/(tabs)/cadastros.tsx`. O `Student` de `types/attendance.ts` não entra.

Issue 01 (registry/matrícula) já está em `main`. Unicidade desses campos no cadastro manual ainda não é regra; o Excel passa a tratar colisão como conflito **na importação**.

## Goals / Non-Goals

**Goals:**

- Pipeline de workbook → plano → confirmação → dispatch nas actions existentes.
- Contrato de abas compartilhado entre import e export.
- Resolver referências contra o store **e** contra linhas já aceitas do mesmo arquivo (ordem veículos → escolas → rotas → alunos).

**Non-Goals:**

- Nova entidade ou aba `Pontos de embarque`.
- Campo `Route.code`.
- Unicidade global no formulário manual (fora do planner Excel).
- Fotos, fuzzy match, backend, sync entre aparelhos.

## Decisions

### 1. Onde vive o motor

Módulo puro em `lib/excel/` (contrato, read/write, normalize, validate, resolve, plan). Telas só escolhem arquivo, mostram preview e disparam apply. Apply usa `add*` / `update*` / `assignSeat` já existentes — sem slice paralelo de “importação”.

Alternativa rejeitada: parse dentro de `cadastros.tsx` (duplica regra e impede teste Node).

### 2. Biblioteca e I/O Expo 57

- Planilha: SheetJS comunidade (`xlsx`) gerando/consumindo `ArrayBuffer` — os testes `tsx` atuais não precisam de runtime RN.
- Entrada: `expo-document-picker` com `copyToCacheDirectory: true`, depois `expo-file-system` para bytes.
- Saída: escrever arquivo temporário + `expo-sharing`.

Alternativa: ExcelJS (mais pesado e pior no RN). Sem CSV nesta change.

### 3. Chaves de negócio

| Entidade | Chave | Sem chave |
|----------|--------|-----------|
| Veículo | placa normalizada (`formatPlate` / `isValidPlate`) | linha inválida (placa obrigatória) |
| Escola | `registry` trim se preenchido | nome exato; 2+ nomes iguais = conflito |
| Rota | `title` trim + escola resolvida | sem escola resolvida = erro de referência |
| Aluno | `enrollmentCode` como texto (preserva zeros) | sempre **novo**; não casa por nome |

Não expor `id` no contrato. Matching de referência de escola: primeiro registro exato; se a célula não for um registro conhecido, nome exato. Nunca ambos “quase iguais”.

Alternativa rejeitada: código novo de rota (exigiria change de modelo). Fuzzy nome (issue proíbe).

### 4. Pontos de embarque e “não alterar rotas”

Aba `Rotas` é a única que cria/reordena pontos (`|` na coluna). Aba `Alunos` exige ponto **já** na rota resolvida. Isso atende “import só de alunos não modifica rotas” e diverge do formulário de aluno, que pode appendar ponto — o Excel não replica esse atalho.

Assento: import de aluno **pode** ocupar `seatsMap`; isso é vínculo, não cadastro de veículo. Não altera placa, responsável nem `totalSeats` a partir de `Alunos`.

### 5. Update vs vazio

Célula vazia em update = skip do campo. Célula preenchida = set. Nunca `removeSchool` porque a aba `Escolas` faltou.

### 6. Preview e persistência

`buildImportPlan(storeSnapshot, workbook)` é puro e testável. UI confirma → thunk/helper despacha na ordem fixa. Linhas inválidas ficam de fora; válidas podem ser confirmadas juntas.

### 7. Export

Mesmo mapa coluna ↔ campo. `seatsMap` não vira colunas; ocupação reaparece só via alunos. Combinações de entidades: checkboxes ou ações em Cadastros (todos / um / vários).

## Risks / Trade-offs

- [Alunos sem matrícula sempre novos] → duplicatas se reimportar export sem código. Mitigação: preview deixa isso explícito; recomendação de preencher carteirinha para round-trip estável.
- [Títulos de rota repetidos na mesma escola] → conflito. Mitigação: exigir título único por escola no planner; não inventar código.
- [SheetJS + arquivos grandes] → preview lento. Mitigação: fora de escopo otimizar; falhar com mensagem se o arquivo não for xlsx legível.
- [Dois veículos com a mesma placa já no store] → qualquer linha dessa placa é conflito até o dado ser limpo no app.

## Migration Plan

Sem migração de persistência. Dados antigos sem `registry`/`enrollmentCode` continuam válidos. Rollback = não confirmar o preview; código novo isolado em `lib/excel/` + tela de Cadastros.

## Open Questions

Nenhuma que altere spec ou tarefas: detalhes de copy da UI (rótulos dos botões) podem fechar na implementação.
