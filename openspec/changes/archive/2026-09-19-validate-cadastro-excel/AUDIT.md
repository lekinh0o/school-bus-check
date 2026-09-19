# Auditoria — validate-cadastro-excel (issue 04 / GitHub #32)

Data: 2026-09-19  
Change OpenSpec: `validate-cadastro-excel` (schema spec-driven, `skip_specs: true`)

## OpenSpec usado

- Change desta auditoria: `openspec/changes/validate-cadastro-excel/` (`proposal.md`, `design.md`, `tasks.md`; specs da change puladas de propósito).
- Contrato vigente: `openspec/specs/cadastro-excel/spec.md` (sincronizado a partir das issues 01–03 / changes arquivadas de cadastro Excel).
- Pré-requisitos em `main`: issues [#29](https://github.com/lekinh0o/school-bus-check/issues/29), [#30](https://github.com/lekinh0o/school-bus-check/issues/30), [#31](https://github.com/lekinh0o/school-bus-check/issues/31).
- Fora de recorte: issue [#33](https://github.com/lekinh0o/school-bus-check/issues/33) (lote, fuzzy, criar dependência).

## Contrato (abas e chaves)

Abas canônicas: `Alunos`, `Escolas`, `Rotas`, `Veículos`. Aba ausente não é erro. Aba fora do contrato é ignorada.

Identificadores de negócio (não ID interno):

| Entidade | Chave |
| --- | --- |
| Veículo | placa normalizada (formato BR antigo ou Mercosul) |
| Escola | Registro quando preenchido; senão nome exato após trim |
| Rota | par **título exato + escola já resolvida** (o “código da rota” da issue) |
| Aluno | Carteirinha / Matrícula quando preenchida; vazio = novo, sem casar por nome |

## Arquivos alterados nesta apply

- `lib/excel/excel.test.ts` — matriz Node da issue 04: isolamento das quatro fatias, conjuntos 2/3/4 abas, vazio/ilegível, duplicidade, opcionais, erros, export individual vs completo e reimport.
- `lib/excel/controller.test.ts` — `startFromFile` com buffer ilegível zera `busy` e rejeita; `testStore` clona o snapshot.
- `lib/excel/controller.ts` — parse/create em `try`; em falha `busy: false` e relança (a UI já mostra `Alert`).
- `lib/excel/workbook.ts` — buffer que não é ZIP/OLE (xlsx/xls) lança `Arquivo Excel ilegível`; SheetJS leniente não engole lixo como planilha vazia.
- `openspec/changes/validate-cadastro-excel/AUDIT.md` — este relatório.

Não houve alteração de UI de revisão, de matching fuzzy, de lote nem de “criar dependência”.

## Testes

Comandos (2026-09-19, Windows):

```text
npx tsc --noEmit          # exit 0
npm test                  # 54/54 pass
```

`npm test` executa `lib/geo.test.ts`, `lib/optionalFields.test.ts`, `lib/excel/excel.test.ts`, `lib/excel/draft.test.ts`, `lib/excel/controller.test.ts`.

Cobertura Node alinhada à matriz da issue:

- Isolamento: só Alunos / Escolas / Rotas / Veículos; cadastro das fatias ausentes permanece; `studentIds`/assento só mudam com aba Alunos; `routeIds` só com aba Rotas.
- Conjunto: Alunos+Escolas; Alunos+Escolas+Rotas; quatro abas; `sheetsFound` segue só as abas presentes.
- Vazio: workbook sem abas do contrato → plano vazio, sem erro de aba faltante.
- Ilegível: parser lança; controller rejeita e `busy === false`.
- Duplicidade: placa, registro, matrícula, par título+escola — conflito, zero persistência dessas linhas.
- Opcionais / trim / acentos exatos / zeros à esquerda / matrícula vazia = novo.
- Aba desconhecida, cabeçalho inválido, referência inexistente, linha inválida (já no planner; reafirmados na matriz 2.3).
- `writeWorkbookBuffer` de um tipo vs os quatro; reimport marca chaves existentes como `update`.

## Lint

Não há script `lint` em `package.json` e não há ESLint no projeto. Não foi adicionado ESLint nesta change. Critério “lint passa, se configurado” = N/A, documentado.

## Matriz manual (tarefa 4.3)

Percorrido no motor (equivalente ao passeio mínimo do design):

- Exportação individual das quatro entidades (`writeWorkbookBuffer` com um `kind`).
- Exportação completa das quatro abas.
- Importação de uma aba e das quatro, inclusive ordem diferente das abas.
- Reimportação do arquivo exportado sem duplicar chaves.

Não percorrido neste apply (Expo/dispositivo):

- `CadastroExcelPanel` (picker, Alert de arquivo ilegível, tela de revisão, confirmar na UI).
- Kit `Downloads/test-bus` como substituto da matriz Node (os testes acima a cobrem).

O caminho de falha de arquivo ilegível na UI já existe: `CadastroExcelPanel.openPickedFile` captura o throw de `startFromFile` e mostra `Alert`.

## Limitações

- Sem teste de componente React Native; revisão visual e toques na central ficam para uso manual no app.
- Workbook XLSX válido sem abas do contrato é plano vazio (não é “ilegível”). Ilegível = buffer que não é planilha (ex.: bytes aleatórios).
- Isolamento de aluno permite sync estrutural (`studentIds`, assento), como a spec já exige; campos de cadastro de escola/rota/veículo não mudam.

## Critérios de aceite (issue 04)

| Critério | Resultado |
| --- | --- |
| Importação individual das quatro entidades | Atendido (Node) |
| Importação conjunta | Atendido (2/3/4 abas, Node) |
| Exportação individual | Atendido (`writeWorkbookBuffer` por tipo) |
| Exportação completa | Atendido (quatro abas) |
| Entidades ausentes não são alteradas | Atendido (snapshots das fatias) |
| Relacionamentos preservados | Atendido (placa, registro, matrícula, título+escola; IDs internos não vão no Excel) |
| Duplicidades tratadas | Atendido (arquivo e cadastro; zero persistência das linhas em conflito) |
| Campos opcionais | Atendido |
| Dados antigos compatíveis | Atendido (sem migração; matching por chaves de negócio da spec) |
| XLSX exportado pode ser reimportado | Atendido (reimport = `update` nas chaves) |
| Testes passam | `npm test` 54/54 |
| TypeScript passa | `npx tsc --noEmit` exit 0 |
| Lint passa, se configurado | N/A — sem script de lint |
| OpenSpec coerente | `skip_specs: true`; contrato em `cadastro-excel`; “código da rota” = título+escola |
| Auditoria final | Este arquivo |

## Resultado

A matriz da issue 04 está coberta no motor e documentada. A única correção de implementação exigida pela spec nesta apply foi tratar buffer ilegível de forma explícita (SheetJS aceitava lixo como `Sheet1`) e relançar a falha no controller sem deixar `busy` preso. Matching fuzzy, lote e criar dependência permanecem na issue 05.
