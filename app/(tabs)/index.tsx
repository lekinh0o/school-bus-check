import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { StartRouteSheet } from '@/components/StartRouteSheet';
import {
  buildRouteTimelineStops,
  RouteTimeline,
} from '@/components/RouteTimeline';
import { formatDuration, formatTripDate } from '@/lib/formatTrip';
import { selectExecutionHistory } from '@/store/attendanceSlice';
import { selectAllRoutes } from '@/store/routeSlice';
import { useAppSelector } from '@/store/store';
import type { Route, RoutePeriod } from '@/types';
import type { RouteHistory } from '@/types/execution';

const PERIOD_LABEL: Record<RoutePeriod, string> = {
  Manha: 'Manhã',
  Tarde: 'Tarde',
  Noite: 'Noite',
};

export default function HomeScreen() {
  const router = useRouter();
  const routes = useAppSelector(selectAllRoutes);
  const schoolEntities = useAppSelector((state) => state.schools.entities);
  const history = useAppSelector(selectExecutionHistory);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const header = (
    <View>
      <Text className="text-2xl font-bold text-brand-dark">Hoje</Text>
      <Text className="mt-1 text-sm text-slate-500">
        Escolha uma rota para iniciar o trajeto.
      </Text>
      {routes.length === 0 ? (
        <Text className="mt-10 text-center text-base text-slate-500">
          Nenhuma rota cadastrada. Cadastre uma em Cadastros.
        </Text>
      ) : (
        routes.map((route) => {
          const school = schoolEntities[route.schoolId];
          const schoolName = school?.name ?? 'Escola não encontrada';
          return (
            <Pressable
              key={route.id}
              onPress={() => setSelectedRoute(route)}
              className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="text-lg font-bold text-slate-900">
                {route.title}
              </Text>
              <Text className="mt-1 text-sm font-semibold text-brand">
                {PERIOD_LABEL[route.period]}
              </Text>
              <Text className="mt-1 text-sm text-slate-500">
                {route.startPoint} · {route.startTime} às {route.endTime}
              </Text>
              <Text className="mt-1 text-sm text-slate-600">{schoolName}</Text>
              <RouteTimeline
                stops={buildRouteTimelineStops(
                  route.startPoint,
                  route.boardingPoints,
                  schoolName,
                )}
              />
            </Pressable>
          );
        })
      )}
      <Text className="mt-8 text-lg font-bold text-slate-900">
        Últimas Viagens
      </Text>
      {history.length === 0 ? (
        <Text className="mt-2 text-sm text-slate-500">
          Nenhuma viagem encerrada ainda.
        </Text>
      ) : null}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        className="flex-1"
        contentContainerClassName="p-4 pb-10"
        data={history}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListFooterComponent={
          <Pressable
            onPress={() => router.push('/cadastros' as Href)}
            className="mt-6 items-center">
            <Text className="text-sm font-semibold text-brand">
              Ir para Cadastros
            </Text>
          </Pressable>
        }
        renderItem={({ item }) => (
          <HistoryCard
            item={item}
            title={
              routes.find((route) => route.id === item.routeId)?.title ??
              'Rota removida'
            }
            onPress={() => router.push(`/history/${item.id}` as Href)}
          />
        )}
      />
      <StartRouteSheet
        route={selectedRoute}
        visible={selectedRoute !== null}
        onClose={() => setSelectedRoute(null)}
      />
    </View>
  );
}

function HistoryCard({
  item,
  title,
  onPress,
}: {
  item: RouteHistory;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="text-lg font-bold text-slate-900">{title}</Text>
      <Text className="mt-1 text-sm text-slate-500">
        {formatTripDate(item.finishedAt || item.startedAt)}
      </Text>
      <Text className="mt-1 text-sm font-semibold text-brand">
        {item.direction === 'IDA' ? '☀️ IDA' : '🌙 VOLTA'}
      </Text>
      <Text className="mt-1 text-sm text-slate-600">
        Duração: {formatDuration(item.startedAt, item.finishedAt)}
      </Text>
      <Text className="mt-1 text-xs text-slate-500">
        {item.metrics.present} presentes · {item.metrics.absent} ausentes ·{' '}
        {item.metrics.skippedPoints} pulados
      </Text>
    </Pressable>
  );
}
