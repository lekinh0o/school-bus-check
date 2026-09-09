import { type Href, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { StartRouteSheet } from '@/components/StartRouteSheet';
import {
  buildRouteTimelineStops,
  RouteTimeline,
} from '@/components/RouteTimeline';
import { selectAllRoutes } from '@/store/routeSlice';
import { useAppSelector } from '@/store/store';
import type { Route, RoutePeriod } from '@/types';
import { useState } from 'react';

const PERIOD_LABEL: Record<RoutePeriod, string> = {
  Manha: 'Manhã',
  Tarde: 'Tarde',
  Noite: 'Noite',
};

export default function HomeScreen() {
  const router = useRouter();
  const routes = useAppSelector(selectAllRoutes);
  const schoolEntities = useAppSelector((state) => state.schools.entities);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-10">
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
        <Pressable
          onPress={() => router.push('/cadastros' as Href)}
          className="mt-6 items-center">
          <Text className="text-sm font-semibold text-brand">Ir para Cadastros</Text>
        </Pressable>
      </ScrollView>
      <StartRouteSheet
        route={selectedRoute}
        visible={selectedRoute !== null}
        onClose={() => setSelectedRoute(null)}
      />
    </View>
  );
}
