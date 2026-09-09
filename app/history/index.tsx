import { type Href, Stack, useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';

import { HistoryTripCard } from '@/components/HistoryTripCard';
import { selectExecutionHistory } from '@/store/attendanceSlice';
import { selectAllRoutes } from '@/store/routeSlice';
import { useAppSelector } from '@/store/store';

export default function HistoryListScreen() {
  const router = useRouter();
  const history = useAppSelector(selectExecutionHistory);
  const routes = useAppSelector(selectAllRoutes);

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ title: 'Histórico' }} />
      <FlatList
        className="flex-1"
        contentContainerClassName="p-4 pb-10"
        data={history}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-base text-slate-500">
            Nenhuma viagem encerrada ainda.
          </Text>
        }
        renderItem={({ item }) => (
          <HistoryTripCard
            item={item}
            title={
              routes.find((route) => route.id === item.routeId)?.title ??
              'Rota removida'
            }
            onPress={() => router.push(`/history/${item.id}` as Href)}
          />
        )}
      />
    </View>
  );
}
