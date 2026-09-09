import { Stack } from 'expo-router';

export default function HistoryLayout() {
  return (
    <Stack>
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
