## 1. Git

- [x] 1.1 Em `main` atualizado, criar ou usar `feat/layout-onibus-assentos`; verificar `git branch --show-current` e que o working tree desta change está nessa branch

## 2. Componente

- [x] 2.1 Criar `components/BusSeatMap.tsx` com casco (frente no topo), fileiras `flex-row`, corredor `w-8` e chunk `[a,b,d,c]`; verificar fileira 1 = 1, 2, 4, 3 e fileira de 15 assentos com 13, 14, vazio, 15
- [x] 2.2 Estados: livre `slate`/branco clicável só se `onSelectSeat`; ocupado por outro cinza + ✕ sem clique; selecionado/`currentStudentId` em `bg-brand`; verificar toque em ocupado não chama o callback e toque em livre chama com o `seatNumber`

## 3. Telas

- [x] 3.1 Em `app/vehicles/[id].tsx` trocar o mapa por `BusSeatMap` sem `onSelectSeat`; verificar que alterar a quantidade redesenha a planta e que toque não muda ocupação
- [x] 3.2 Em `app/students/[id].tsx` usar `BusSeatMap` interativo (`selectedSeat`, `currentStudentId`, `onSelectSeat`); verificar livre seleciona, ocupado por outro bloqueia, assento próprio na edição fica em destaque
- [x] 3.3 Em `components/VehicleListModal.tsx` usar `BusSeatMap` estático; verificar planta 2x2 no card com ocupados cinza
- [x] 3.4 Remover `components/SeatMapPicker.tsx` se não houver imports; verificar busca sem referências e `npx tsc --noEmit` exit 0
