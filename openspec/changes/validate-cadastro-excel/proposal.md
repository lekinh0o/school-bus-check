## Why

O motor e a central de revisão Excel já estão em `main` (issues 01–03), mas a issue 04 exige prova de que importação e exportação isoladas ou conjuntas não corrompem cadastros. Sem essa matriz e um relatório de auditoria, o módulo não pode ser considerado pronto para uso em produção.

## What Changes

- Completar testes Node do contrato `cadastro-excel` onde a issue 04 pede cobertura que ainda não existe (isolamento das quatro entidades, conjunto 2/3/4 abas, arquivo vazio/ilegível, exportação individual e completa, reimportação sem duplicar).
- Executar a validação técnica existente (`npx tsc --noEmit`, `npm test`) e documentar que não há script de lint.
- Percorrer a matriz manual mínima no fluxo Cadastros (importar/exportar), sem reabrir o recorte da issue 05 (lote, sugestão fuzzy, criar dependência).
- Produzir o relatório de auditoria pedido pela issue 04. Se o código divergir da spec principal, corrigir a implementação para a spec — não relaxar o contrato.
- Tratar “código da rota” da issue como o identificador já documentado: título exato + escola resolvida. Não introduzir coluna nova.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

(nenhuma) O contrato permanece em `cadastro-excel`. Esta change não altera requisitos; `skip_specs: true`.

## Impact

- Testes em `lib/excel/*.test.ts` e o script `npm test`.
- Relatório de auditoria (artefato da change / issue), não um backend nem dependência nova.
- UI só se a auditoria achar regressão visível no `CadastroExcelPanel`; issue 05 continua fora.
- GitHub: [issue #32](https://github.com/lekinh0o/school-bus-check/issues/32). Pré-requisitos em main: issues [#29](https://github.com/lekinh0o/school-bus-check/issues/29), [#30](https://github.com/lekinh0o/school-bus-check/issues/30), [#31](https://github.com/lekinh0o/school-bus-check/issues/31).
