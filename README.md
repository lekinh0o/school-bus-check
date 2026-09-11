# School Bus Check

App para motoristas e monitores de transporte escolar: cadastro da operação, chamada na van e histórico das viagens. Roda em **React Native + Expo SDK 57**, com persistência **100% local** (sem backend).

## Status atual

Entregue e em `main`:

- **Cadastros** de veículos, escolas, rotas e alunos (fotos, mapa de assentos, pontos de embarque com GPS, horários de Ida e Volta).
- **Início** com escolha de rota, Ida/Volta, banner de ciclo incompleto e atalho para retomar execução em andamento.
- **Execução** da rota (tabs Execução/Resumo): parada atual, distância ao vivo, geofence de 50 m com som, Maps/Waze, presente/ausente/desembarque, pular ponto e encerrar só com a van vazia.
- **Ciclo Ida/Volta:** justificativa para Ida sem Volta (não inicia trajeto sozinho) e para Volta sem Ida no dia.
- **Histórico** somente leitura, com filtro por data inicial e final.
- **Abas:** Início, Cadastros, Histórico, Config.
- **Visual** alinhado ao design system verde institucional (NativeWind).

Ainda **não** há API, contas reais nem rastreio para os pais. O login é fictício (`hooks/useAuth.tsx`).

## Fluxo de presença na van

Manhã (Ida) e tarde (Volta) são independentes. Ausência encerra só aquele trecho.

| Turno | Ações |
| --- | --- |
| Manhã | Ingresso em casa → ausente (aviso prévio) → desembarque na escola |
| Tarde | Ingresso na escola → ausente (volta por outros meios) → desembarque em casa |

Na execução da rota o status da sessão é `PENDING` / `PRESENT` / `ABSENT` / `DROPPED_OFF`, persistido com a viagem no histórico.

## Stack

| Peça | Uso |
| --- | --- |
| Expo SDK 57 + Expo Router | App e rotas em `app/` |
| TypeScript | Tipos de domínio em `types/` |
| NativeWind 4 + Tailwind 3 | UI (`className`) |
| Redux Toolkit + redux-persist | Estado offline (AsyncStorage em `store/storage.ts`) |

GPS (`expo-location`), mapas, fotos e som de chegada entram só na execução. Notificação de execução em segundo plano **não** roda no Expo Go (só em build nativo).

## Como rodar

1. Node.js instalado.
2. `npm install`
3. `npx expo start`
4. Abra no **Expo Go** (Android/iOS) ou emulador.

Build interno de APK (EAS): perfil `preview` em `eas.json`.

## Onde está o código

```text
app/            Telas (auth, tabs, cadastros, execução, histórico)
components/     UI reutilizável
hooks/          Auth fictício, GPS da execução, confirmação ao sair
lib/            Máscaras, geo, ciclo Ida/Volta, datas
store/          Slices RTK + persist
openspec/specs/ Contrato de comportamento (fonte das regras já implementadas)
```

Regras de negócio e persistência: `.cursorrules` e `store/attendanceSlice.ts`. Não inventar backend: o adapter de storage é o único ponto a trocar se for migrar de AsyncStorage.
