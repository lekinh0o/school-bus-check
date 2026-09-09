## Why

A execução hoje começa em Cadastros, numa tela única, sem tabs, sem fotos na chamada, sem mapa com alerta de falta e sem escolher sentido antes de entrar. No painel da van o motorista precisa partir do Início, confirmar IDA/VOLTA e operar passo a passo com identificação visual.

## What Changes

- **BREAKING (fluxo):** o ponto de partida da execução passa a ser a aba Início (`app/(tabs)/index.tsx`). Tocar a rota abre um bottom sheet (sentido + Iniciar Trajeto); a sessão Redux só começa nesse botão, depois navega para `execute/[id]`.
- Tela de execução com tabs **Execução** e **Resumo**.
- Tab Execução: cabeçalho fixo (contadores + timeline de ícones por sentido), foto do aluno, Presente/Ausente (rótulos de embarque/desembarque), contato do responsável, Anterior / Concluir / Próximo, auto-avanço e travas.
- Tab Resumo: planta do ônibus com foto no assento e borda amarela se ausente; lista geral para corrigir status e ligar.
- NativeWind, área de toque ampla. Git no apply: `fix/ui-execucao-rota-completa` a partir de `main`.

## Capabilities

### New Capabilities
- _(nenhuma)_

### Modified Capabilities
- `route-execution`: partida no dashboard, sheet de sentido, tabs, cabeçalho, chamada com foto/contato, travas, resumo.
- `seat-map`: na execução, foto no assento e borda amarela para aluno ausente.

## Impact

- `app/(tabs)/index.tsx`, novo sheet de sentido, `app/routes/execute/[id].tsx`.
- `components/BusSeatMap.tsx` (modo execução: foto + `absentStudentIds`).
- Seletores já existentes em `attendanceSlice` / `executionSession`; possível `goToPreviousPoint` e `markStudentStatus` permitindo voltar a `PENDING`.
- `Linking` para telefone/`wa.me` com `contactPhones` do aluno.
- Listagem em Cadastros: Executar deve abrir o mesmo sheet, não a tela vazia de sentido.
