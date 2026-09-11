## Context

Ver proposal.md. Hoje `components/SeatMapPicker.tsx` faz `flex-wrap` na ordem do array. `app/vehicles/[id].tsx` e `VehicleListModal` usam o picker sem `onSelect`; `app/students/[id].tsx` passa `onSelect`, `selectedSeat` e `currentStudentId`. `seatsMap` continua `{ seatNumber, studentId }[]` gerado 1…N em `buildSeatsMap`. Não há pasta `src/`.

## Goals / Non-Goals

**Goals:**
- Um componente de planta 2x2 (NativeWind) compartilhado nas três superfícies.
- Agrupar só na UI: chunk de 4 na ordem linear, desenhar `[a, b, d, c]`.
- Interação só no formulário do aluno; veículo e modal são leitura.

**Non-Goals:**
- Regravar ou reordenar `seatsMap` no Redux.
- Motorista clicável, andares, 3+2, ou mudar `assignSeat`.
- Nova paleta fora do Tailwind já usado (`brand`, `slate`, `red` só se já existir no projeto).

## Decisions

1. **Arquivo `components/BusSeatMap.tsx`**  
   Props: `seatsMap`, `selectedSeat?`, `currentStudentId?`, `onSelectSeat?`. Sem callback = estático (toque ignorado).  
   Alternativa: manter `SeatMapPicker` e só mudar o wrap. Rejeitada — o container de ônibus e o corredor pedem um layout próprio. Remover `SeatMapPicker` quando não restar import.

2. **Ordem visual `[a, b, d, c]`**  
   Fileira completa: 1, 2, 4, 3 (ímpar janela, par corredor, par corredor, ímpar janela). Fileira com 3: 13, 14, (vazio), 15. Slots vazios são `View` invisível da mesma largura para o corredor não colapsar.  
   Alternativa: 1, 2, 3, 4 da esquerda para a direita. Rejeitada — o 3 (ímpar) cairia no corredor direito.

3. **Layout NativeWind**  
   Casco: `rounded-t-3xl border`, rótulo “Frente” no topo. Cada fileira: `flex-row items-center justify-between`; dois pares `flex-row gap-2`; entre os pares `w-8` (corredor). Poltrona `h-14 w-14 rounded-xl`.  
   Selecionado / próprio aluno: `bg-brand` (verde da identidade). Livre: `border-slate-200 bg-white`. Ocupado por outro: `bg-slate-200` + “✕”, sem `Pressable`.  
   Alternativa: rosa/vermelho no selecionado. Rejeitada como cor nova; o spec aceita destaque da marca.

4. **Git no apply**  
   Primeira tarefa: `checkout main`, `pull origin main`, `checkout -b feat/layout-onibus-assentos` (ou usar a branch se já existir). Planning não mexe em git de código.

## Risks / Trade-offs

- [Total ímpar de assentos] → última fileira com slot vazio à direita do corredor; não inventar poltrona.
- [Mapa largo no modal] → `max-w` no casco e scroll já existente no sheet.
- [Toque no mapa estático] → não passar `onSelectSeat` no veículo/modal.

## Migration Plan

Nenhuma migração de persistência. Rollback = voltar ao `SeatMapPicker` wrap.

## Open Questions

Nenhuma. Numeração `[a,b,d,c]` e cores de marca ficam fechadas neste design.
