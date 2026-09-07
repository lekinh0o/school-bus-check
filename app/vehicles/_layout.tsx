import { Stack } from 'expo-router';

export default function VehiclesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Veículo',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack>
  );
}
