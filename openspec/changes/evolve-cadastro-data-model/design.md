## Context

Hoje `School` e `Student` em `types/index.ts` têm quase todos os campos de texto e número obrigatórios. Os formulários em `app/schools/[id].tsx` e `app/students/[id].tsx` bloqueiam o save se endereço, diretor, telefone, idade, responsável, dois telefones ou série estiverem vazios. Persistência é `redux-persist` na raiz (`store/store.ts`, versão 7), com `createEntityAdapter` selecionando por `id`. Não há importação Excel ainda. O `Student` em `types/attendance.ts` é outro tipo e não entra neste desenho.

Campos já opcionais no domínio: `photoUri`, coordenadas. Padrão de ausência: propriedade omitida (`undefined`), não `null` nem `""`.

## Goals / Non-Goals

**Goals:**

- Acrescentar identificadores de negócio opcionais sem trocar a chave dos adapters.
- Relaxar descritivos de escola/aluno na UI e no tipo, preservando vínculos estruturais do cadastro de aluno.
- Reabrir dados antigos sem migração destrutiva.
- Deixar o modelo alinhado a um futuro Excel (vazio → omitido).

**Non-Goals:**

- Implementar importação/exportação Excel.
- Tornar opcionais `schoolId`, `routeId`, `boardingPoint`, `vehicleId` ou `seatNumber` no fluxo de cadastro da UI.
- Relaxar obrigatoriedade de veículo ou rota.
- Alterar o `Student` de `types/attendance.ts`.
- Unicidade de registro/matrícula (podem repetir até o Excel exigir regras).

## Decisions

### 1. Nomes técnicos vs rótulos

| UI | Campo | Por quê |
|----|--------|---------|
| Registro | `School.registry?: string` | Demais campos da escola estão em inglês (`name`, `address`, `principal`). `registry` é curto e não colide com `id`. |
| Carteirinha / Matrícula | `Student.enrollmentCode?: string` | Um único identificador de negócio do aluno; `enrollmentCode` evita `id`/`studentId` e não parece chave interna. |

Alternativas rejeitadas: `registro`/`matricula` (quebra o inglês do tipo); `externalId` genérico demais; reutilizar `id` (proibido pelo issue).

### 2. O que fica obrigatório

```
School                          Student
+----------------------+        +---------------------------+
| id          required |        | id             required   |
| name        required |        | name           required   |
| studentIds  []       |        | schoolId       required   |
| routeIds    []       |        | routeId        required   |
| registry    optional |        | boardingPoint  required   |
| address     optional |        | vehicleId      required   |
| principal   optional |        | seatNumber     required   |
| phone       optional |        | enrollmentCode optional   |
| photoUri    optional |        | age            optional   |
| lat/lng     optional |        | responsible    optional   |
+----------------------+        | contactPhones  optional[] |
                                | grade          optional   |
                                | photoUri       optional   |
                                +---------------------------+
```

Nome continua obrigatório para a lista ter um título. Vínculos do aluno continuam obrigatórios na UI porque execução, mapa de assentos e `studentIds` dependem deles; esvaziar FKs seria outra change.

Telefone/idade/série vazios: omitir. Se preenchidos, as máscaras atuais valem.

### 3. Vazio → `undefined`

Helper único (ex. `lib/optionalFields.ts`) que faz trim e devolve `undefined` se vazio. Formulários usam isso ao montar o payload. `contactPhones` vira array só com números válidos (0..n).

Não persistir `""`. Na leitura, `?? ''` no `useState`.

### 4. Persistência

Campos novos opcionais não exigem migração: entidades antigas sem a chave já são válidas em TypeScript.

Se for desejável limpar `""` já gravados ao relaxar tipos, acrescentar migration **8** não destrutiva que apaga chaves descritivas vazias e não mexe em `ids`/vínculos. Sem essa limpeza, strings vazias antigas só afetam a UI (tratar `trim() === ''` como ausente na listagem). Preferência: migration 8 leve, para o estado ficar no mesmo padrão do Excel futuro.

Rollback: reverter o app; dados com `registry`/`enrollmentCode` são ignorados pelo código antigo.

### 5. Relacionamento inválido vs campo vazio

- Vazio em `registry`, `enrollmentCode`, telefone, idade, etc. → válido.
- `schoolId` apontando para escola inexistente, rota de outra escola, veículo inexistente ou assento ocupado → inválido (já é o comportamento estrutural; manter).
- Escola sem rotas → continua sem persistir aluno (vínculo incompleto, não descritivo).

## Risks / Trade-offs

- [Listas com “Diretor(a): ” vazio] → omitir linha ou placeholder, nunca concatenar texto cego.
- [Idade `number` vira `number \| undefined`] → callers (cards, execução) MUST usar optional chaining; auditar usos de `student.age` e `school.principal`.
- [Dois telefones deixam de ser obrigatórios] → contato do responsável na execução pode ficar sem número; aceitável para importação parcial; UI de contato já precisa lidar com lista vazia.
- [Sem unicidade de matrícula] → dois alunos podem ter o mesmo código até o Excel definir a regra.

## Migration Plan

1. Estender tipos.
2. Ajustar formulários, checklists e listas.
3. (Opcional recomendado) `persistConfig.version` 8: normalizar strings vazias em escola/aluno.
4. Rodar TypeScript; o único teste automatizado atual (`lib/geo.test.ts`) não cobre cadastro — validar formulários manualmente e grep nos tipos.

## Open Questions

Nenhum que altere spec ou tarefas: Excel fica para change futura.
