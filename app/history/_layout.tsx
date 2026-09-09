import { Stack } from 'expo-router';

export default function HistoryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Histórico',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Viagem',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack>
  );
}
