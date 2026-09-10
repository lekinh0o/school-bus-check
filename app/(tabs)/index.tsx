import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { HistoryTripCard } from '@/components/HistoryTripCard';
import { StartRouteSheet } from '@/components/StartRouteSheet';
import {
  buildRouteTimelineStops,
  RouteTimeline,
} from '@/components/RouteTimeline';
import { OPERATION_TYPE_LABEL, resolveOperationType } from '@/lib/operationType';
import { formatRouteTimeWindow } from '@/lib/routeSchedule';
import { selectExecutionHistory } from '@/store/attendanceSlice';
import { selectAllRoutes } from '@/store/routeSlice';
import { useAppSelector } from '@/store/store';
import type { Route, RoutePeriod } from '@/types';

const PERIOD_LABEL: Record<RoutePeriod, string> = {
  Manha: 'Manhã',
  Tarde: 'Tarde',
  Noite: 'Noite',
};

const RECENT_TRIPS = 5;

export default function HomeScreen() {
  const router = useRouter();
  const routes = useAppSelector(selectAllRoutes);
  const schoolEntities = useAppSelector((state) => state.schools.entities);
  const history = useAppSelector(selectExecutionHistory);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const recentHistory = history.slice(0, RECENT_TRIPS);

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        className="flex-1"
        contentContainerClassName="p-4 pb-10"
        data={recentHistory}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <Text className="text-2xl font-bold text-brand-dark">Hoje</Text>
            <Text className="mt-1 text-sm text-slate-500">
              Escolha uma rota para iniciar o trajeto.
            </Text>
            <Text className="mt-6 text-lg font-bold text-slate-900">Rotas</Text>
            {routes.length === 0 ? (
              <Text className="mt-3 text-center text-base text-slate-500">
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
                      {PERIOD_LABEL[route.period]} ·{' '}
                      {OPERATION_TYPE_LABEL[resolveOperationType(route)]}
                    </Text>
                    <Text className="mt-1 text-sm text-slate-500">
                      {route.startPoint}
                    </Text>
                    <Text className="mt-1 text-sm text-slate-500">
                      Ida {formatRouteTimeWindow(route, 'IDA')}
                    </Text>
                    <Text className="mt-1 text-sm text-slate-500">
                      Volta {formatRouteTimeWindow(route, 'VOLTA')}
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
            <View className="mt-8 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-slate-900">
                Histórico recente
              </Text>
              {history.length > 0 ? (
                <Pressable onPress={() => router.push('/history' as Href)}>
                  <Text className="text-sm font-semibold text-brand">Ver todos</Text>
                </Pressable>
              ) : null}
            </View>
            {history.length === 0 ? (
              <Text className="mt-2 text-sm text-slate-500">
                Nenhuma viagem encerrada ainda.
              </Text>
            ) : null}
          </View>
        }
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
      <StartRouteSheet
        route={selectedRoute}
        visible={selectedRoute !== null}
        onClose={() => setSelectedRoute(null)}
      />
    </View>
  );
}
