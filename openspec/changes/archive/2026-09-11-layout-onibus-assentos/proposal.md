## Why

O mapa de assentos hoje é uma colmeia em wrap (`SeatMapPicker`): os números seguem a ordem linear do `seatsMap`, sem corredor nem lados janela/corredor. Motorista e monitor não reconhecem a planta do ônibus (2+2) na hora de cadastrar o veículo ou alocar o aluno.

## What Changes

- Introduzir um mapa reutilizável em planta baixa (frente no topo, quatro colunas por fileira e corredor central).
- Agrupar visualmente o `seatsMap` linear em fileiras de até 4 poltronas, com ímpares nas janelas e pares no corredor (ordem esquerda→direita: ímpar, par, corredor, par, ímpar).
- Tela de veículo: mapa estático após informar a quantidade de assentos.
- Tela de aluno: mapa interativo (livre clicável; ocupado por outro bloqueado).
- Substituir o grid wrap nessas telas. O `seatsMap` persistido permanece lista linear 1…N; sem mudança de tipo `Vehicle`/`Student`.
- O modal de veículos em Cadastros usa o mesmo componente estático, para não ficar um layout antigo ao lado do novo.

## Capabilities

### New Capabilities
- `seat-map`: planta de ônibus 2x2 (janela | corredor | corredor | janela), estados visual livre/ocupado/selecionado e regras de toque na alocação do aluno.

### Modified Capabilities
- *(nenhuma em `openspec/specs/` — `student-registry` ainda só existe como delta de outras changes)*

## Impact

- Novo arquivo em `components/` (não `src/`; o app usa `@/components`).
- Telas `app/vehicles/[id].tsx` e `app/students/[id].tsx`; `components/VehicleListModal.tsx`.
- `components/SeatMapPicker.tsx` deixa de ser o grid das telas de cadastro (pode ser removido se não restar uso).
- `store/vehicleSlice.ts` e o formato de `seatsMap` não mudam.
- Branch de implementação: `feat/layout-onibus-assentos` a partir de `main` atualizado (pré-requisito do apply, não deste planning).
