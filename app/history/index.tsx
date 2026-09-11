import { type Href, Stack, useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';

import { HistoryTripCard } from '@/components/HistoryTripCard';
import { cardShadow } from '@/constants/Colors';
import { selectExecutionHistory } from '@/store/attendanceSlice';
import { selectAllRoutes } from '@/store/routeSlice';
import { useAppSelector } from '@/store/store';

export default function HistoryListScreen() {
  const router = useRouter();
  const history = useAppSelector(selectExecutionHistory);
  const routes = useAppSelector(selectAllRoutes);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Histórico' }} />
      <FlatList
        className="flex-1"
        contentContainerClassName="p-4 pb-10"
        data={history}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-base text-ink-muted">
            Nenhuma viagem encerrada ainda.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={cardShadow}
            className="mt-3 rounded-card border border-[#EEF2F6] bg-surface px-4">
            <HistoryTripCard
              compact
              item={item}
              title={
                routes.find((route) => route.id === item.routeId)?.title ??
                'Rota removida'
              }
              onPress={() => router.push(`/history/${item.id}` as Href)}
            />
          </View>
        )}
      />
    </View>
  );
}
