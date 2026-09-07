import { Stack } from 'expo-router';

export default function SchoolsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Escolas',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Escola',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack>
  );
}
