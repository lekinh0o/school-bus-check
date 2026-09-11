import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VehicleListModal } from '@/components/VehicleListModal';
import { cardShadow, palette } from '@/constants/Colors';
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
    icon: 'truck' as const,
    well: 'bg-pastel-vehicle',
    iconColor: palette.iconVehicle,
  },
  {
    key: 'schools',
    title: 'Escolas',
    hint: 'Unidades e diretoria',
    icon: 'home' as const,
    well: 'bg-pastel-school',
    iconColor: palette.iconSchool,
  },
  {
    key: 'routes',
    title: 'Rotas',
    hint: 'Percursos e escolas',
    icon: 'map' as const,
    well: 'bg-pastel-route',
    iconColor: palette.iconRoute,
  },
  {
    key: 'students',
    title: 'Alunos',
    hint: 'Vínculos, pontos e assentos',
    icon: 'users' as const,
    well: 'bg-pastel-student',
    iconColor: palette.iconStudent,
  },
] as const;

export default function CadastrosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  function handlePress(key: (typeof MENU)[number]['key']) {
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
    <View className="flex-1 bg-background px-4" style={{ paddingTop: insets.top + 8 }}>
      <Text className="text-[30px] font-bold text-ink">Cadastros</Text>
      <Text className="mt-2 text-[15px] text-ink-muted">
        Gerencie os dados mestres do transporte escolar.
      </Text>

      <View className="mt-6 flex-row flex-wrap justify-between">
        {MENU.map((item) => {
          const count = counts[item.key];
          return (
            <Pressable
              key={item.key}
              onPress={() => handlePress(item.key)}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${count} cadastrados`}
              style={cardShadow}
              className="mb-4 w-[48%] rounded-card border border-[#EEF2F6] bg-surface p-4">
              <View
                className={`h-11 w-11 items-center justify-center rounded-2xl ${item.well}`}>
                <Feather name={item.icon} size={20} color={item.iconColor} />
              </View>
              <Text className="mt-4 text-[18px] font-bold text-ink">{item.title}</Text>
              <Text className="mt-1 min-h-[36px] text-[13px] text-ink-muted">
                {item.hint}
              </Text>
              <View className="mt-4 flex-row items-center justify-between rounded-full bg-primary-light px-3 py-2">
                <Text className="text-[12px] font-semibold text-primary">
                  {count} cadastrado{count === 1 ? '' : 's'}
                </Text>
                <Feather name="chevron-right" size={16} color={palette.primary} />
              </View>
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
