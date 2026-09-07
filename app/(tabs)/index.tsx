import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-6">
      <Text className="text-3xl font-bold text-brand-dark">School Bus Check</Text>
      <Text className="mt-3 text-center text-base text-slate-500">
        Bem-vindo. Use a aba Cadastros para gerenciar veículos, escolas, rotas e
        alunos.
      </Text>
    </View>
  );
}
