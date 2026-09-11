## Why

Na execução, o motorista precisa identificar a parada atual, a distância e os alunos em poucos segundos, no veículo e sob luz solar. As coordenadas da change de geolocalização já existem, mas a tela ainda trata Maps/Waze como um detalhe e não acompanha a posição do aparelho.

## What Changes

- A tab Execução ganha um card em destaque da parada atual (nome, alunos esperados, distância, estado de aproximação e Navegar).
- Distância em tempo real com `expo-location` em primeiro plano, Haversine contra as coordenadas já persistidas (embarque, início ou escola). Sem mock e sem persistir a posição atual.
- Geofence de 50 m: na transição fora → dentro, som discreto + destaque visual. Sem spam enquanto permanece no raio. Reset ao mudar de parada.
- Fotos maiores, botões de presença/ausência mais fáceis de tocar, barra inferior fixa (Anterior / Concluir / Próximo) com motivo de bloqueio explícito.
- Reutiliza `openNavigation` (Maps/Waze). Não altera `BoardingPoint`, presença diária, reducers de execução nem o Resumo além do necessário para não quebrar.

## Capabilities

### New Capabilities

- (nenhuma)

### Modified Capabilities

- `route-execution`: cockpit da tab Execução (hero, GPS, geofence, fotos, barra inferior). Sem mudança nas regras de Ida/Volta, conclusão, pulo ou histórico.

## Impact

- UI: `app/routes/execute/[id].tsx`, `StudentAvatar`, componentes de hero/barra se extraídos.
- `lib/geo.ts` (distância/geofence), hook local de localização, `expo-audio` só para o chime de chegada.
- Permissão foreground já usada no cadastro; texto atualizado. Sem background tracking (não há `locationAlways` / task background).
- Dependência nova: `expo-audio` (SDK 57). Sem backend, sem persistência da posição do veículo.
