import { Stack } from 'expo-router';

export default function RoutesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Rotas',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Rota',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="execute/[id]"
        options={{
          title: 'Executar rota',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack>
  );
}
