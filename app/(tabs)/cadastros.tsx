import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { VehicleListModal } from '@/components/VehicleListModal';
import { selectAllRoutes } from '@/store/routeSlice';
import { selectAllSchools } from '@/store/schoolSlice';
import { selectAllStudents } from '@/store/studentSlice';
import { useAppSelector } from '@/store/store';
import { selectAllVehicles } from '@/store/vehicleSlice';

const MENU = [
  {
    key: 'vehicles',
    title: 'Veículos',
    hint: 'Vans e mapa de assentos',
    icon: 'truck',
    enabled: true,
  },
  {
    key: 'schools',
    title: 'Escolas',
    hint: 'Unidades e diretoria',
    icon: 'home',
    enabled: true,
  },
  {
    key: 'routes',
    title: 'Rotas',
    hint: 'Percursos e escolas',
    icon: 'map',
    enabled: true,
  },
  {
    key: 'students',
    title: 'Alunos',
    hint: 'Vínculos, ruas e assentos',
    icon: 'users',
    enabled: true,
  },
] as const;

export default function CadastrosScreen() {
  const router = useRouter();
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const vehicleCount = useAppSelector(selectAllVehicles).length;
  const schoolCount = useAppSelector(selectAllSchools).length;
  const routeCount = useAppSelector(selectAllRoutes).length;
  const studentCount = useAppSelector(selectAllStudents).length;

  const counts = {
    vehicles: vehicleCount,
    schools: schoolCount,
    routes: routeCount,
    students: studentCount,
  };

  function handlePress(key: (typeof MENU)[number]['key'], enabled: boolean) {
    if (!enabled) {
      Alert.alert('Em breve', 'Este cadastro ainda não está disponível.');
      return;
    }
    if (key === 'vehicles') {
      setVehicleModalVisible(true);
      return;
    }
    if (key === 'schools') {
      router.push('/schools' as Href);
      return;
    }
    if (key === 'routes') {
      router.push('/routes' as Href);
      return;
    }
    if (key === 'students') {
      router.push('/students' as Href);
    }
  }

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold text-slate-900">Cadastros</Text>
      <Text className="mt-1 text-sm text-slate-500">
        Gerencie os dados mestres do transporte escolar.
      </Text>

      <View className="mt-6 flex-row flex-wrap justify-between">
        {MENU.map((item) => {
          const color = item.enabled ? '#0F6B4D' : '#94A3B8';
          return (
            <Pressable
              key={item.key}
              onPress={() => handlePress(item.key, item.enabled)}
              className={`mb-4 w-[48%] rounded-2xl border p-5 ${
                item.enabled
                  ? 'border-brand bg-brand-light'
                  : 'border-slate-200 bg-white'
              }`}>
              <View
                className={`mb-3 h-12 w-12 items-center justify-center rounded-2xl ${
                  item.enabled ? 'bg-white' : 'bg-slate-100'
                }`}>
                <Feather name={item.icon} size={24} color={color} />
              </View>
              <Text
                className={`text-lg font-bold ${
                  item.enabled ? 'text-brand-dark' : 'text-slate-400'
                }`}>
                {item.title}
              </Text>
              <Text
                className={`mt-1 text-sm ${
                  item.enabled ? 'text-slate-600' : 'text-slate-400'
                }`}>
                {item.hint}
              </Text>
              <Text
                className={`mt-3 text-xs font-semibold ${
                  item.enabled ? 'text-brand' : 'text-slate-400'
                }`}>
                {counts[item.key]} cadastrado{counts[item.key] === 1 ? '' : 's'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <VehicleListModal
        visible={vehicleModalVisible}
        onClose={() => setVehicleModalVisible(false)}
        onSelect={() => setVehicleModalVisible(false)}
      />
    </View>
  );
}
