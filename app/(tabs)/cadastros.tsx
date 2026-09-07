import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { VehicleListModal } from '@/components/VehicleListModal';

const MENU = [
  { key: 'vehicles', title: 'Veículos', hint: 'Vans e mapa de assentos', enabled: true },
  { key: 'schools', title: 'Escolas', hint: 'Em breve', enabled: false },
  { key: 'routes', title: 'Rotas', hint: 'Em breve', enabled: false },
  { key: 'students', title: 'Alunos', hint: 'Em breve', enabled: false },
] as const;

export default function CadastrosScreen() {
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);

  function handlePress(key: (typeof MENU)[number]['key'], enabled: boolean) {
    if (!enabled) {
      Alert.alert('Em breve', 'Este cadastro ainda não está disponível.');
      return;
    }
    if (key === 'vehicles') {
      setVehicleModalVisible(true);
    }
  }

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold text-slate-900">Cadastros</Text>
      <Text className="mt-1 text-sm text-slate-500">
        Gerencie os dados mestres do transporte escolar.
      </Text>

      <View className="mt-6 flex-row flex-wrap justify-between">
        {MENU.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => handlePress(item.key, item.enabled)}
            className={`mb-4 w-[48%] rounded-2xl border p-5 ${
              item.enabled
                ? 'border-brand bg-brand-light'
                : 'border-slate-200 bg-white'
            }`}>
            <Text
              className={`text-lg font-bold ${
                item.enabled ? 'text-brand-dark' : 'text-slate-400'
              }`}>
              {item.title}
            </Text>
            <Text
              className={`mt-2 text-sm ${
                item.enabled ? 'text-slate-600' : 'text-slate-400'
              }`}>
              {item.hint}
            </Text>
          </Pressable>
        ))}
      </View>

      <VehicleListModal
        visible={vehicleModalVisible}
        onClose={() => setVehicleModalVisible(false)}
        onSelect={() => setVehicleModalVisible(false)}
      />
    </View>
  );
}
