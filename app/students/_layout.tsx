import { Stack } from 'expo-router';

export default function StudentsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Alunos',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Aluno',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack>
  );
}
