import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-brand-light px-6">
      <Text className="text-3xl font-bold text-brand-dark">School Bus Check</Text>
      <Text className="mt-2 text-center text-base text-slate-600">
        Autenticação fictícia para o motorista ou monitor da van.
      </Text>
      <Pressable
        className="mt-8 rounded-xl bg-brand px-8 py-4"
        onPress={() => {
          login();
          router.replace('/(tabs)');
        }}>
        <Text className="text-base font-semibold text-white">Entrar no painel</Text>
      </Pressable>
    </View>
  );
}
