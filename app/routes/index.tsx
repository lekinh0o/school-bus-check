import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { StartRouteSheet } from '@/components/StartRouteSheet';
import {
  buildRouteTimelineStops,
  RouteTimeline,
} from '@/components/RouteTimeline';
import { OPERATION_TYPE_LABEL, resolveOperationType } from '@/lib/operationType';
import { formatRouteTimeWindow } from '@/lib/routeSchedule';
import { removeRoute, selectAllRoutes } from '@/store/routeSlice';
import { updateSchool } from '@/store/schoolSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { Route, RoutePeriod } from '@/types';
import { useState } from 'react';

const PERIOD_LABEL: Record<RoutePeriod, string> = {
  Manha: 'Manhã',
  Tarde: 'Tarde',
  Noite: 'Noite',
};

export default function RoutesListScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const routes = useAppSelector(selectAllRoutes);
  const schoolEntities = useAppSelector((state) => state.schools.entities);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  function handleCreate() {
    router.push('/routes/new' as Href);
  }

  function handleExecute(route: Route) {
    setSelectedRoute(route);
  }

  function handleEdit(routeId: string) {
    router.push(`/routes/${routeId}` as Href);
  }

  function handleDelete(route: Route) {
    Alert.alert(
      'Excluir rota',
      `Deseja excluir ${route.title}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const school = schoolEntities[route.schoolId];
            if (school) {
              dispatch(
                updateSchool({
                  id: school.id,
                  changes: {
                    routeIds: school.routeIds.filter((id) => id !== route.id),
                  },
                }),
              );
            }
            dispatch(removeRoute(route.id));
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-28">
        {routes.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-center text-base text-slate-500">
              Nenhuma rota cadastrada ainda. Adicione a primeira para vincular
              uma escola e o percurso.
            </Text>
          </View>
        ) : (
          routes.map((route) => {
            const school = schoolEntities[route.schoolId];
            const schoolName = school?.name ?? 'Escola não encontrada';
            return (
              <View
                key={route.id}
                className="mb-3 rounded-2xl border border-slate-200 bg-white p-4">
                <View className="flex-row items-start">
                  <View className="flex-1 pr-2">
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
                  </View>
                  <Pressable
                    onPress={() => handleEdit(route.id)}
                    hitSlop={8}
                    className="h-10 w-10 items-center justify-center">
                    <Feather name="edit-2" size={20} color="#0F6B4D" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(route)}
                    hitSlop={8}
                    className="h-10 w-10 items-center justify-center">
                    <Feather name="trash-2" size={20} color="#DC2626" />
                  </Pressable>
                </View>
                <RouteTimeline
                  stops={buildRouteTimelineStops(
                    route.startPoint,
                    route.boardingPoints,
                    schoolName,
                  )}
                />
                <Pressable
                  onPress={() => handleExecute(route)}
                  className="mt-3 items-center rounded-xl bg-brand py-3">
                  <Text className="text-base font-bold text-white">Executar</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      <Pressable
        onPress={handleCreate}
        className="absolute bottom-6 left-4 right-4 items-center rounded-2xl bg-brand py-4 shadow-lg">
        <Text className="text-base font-bold text-white">Adicionar Nova Rota</Text>
      </Pressable>
      <StartRouteSheet
        route={selectedRoute}
        visible={selectedRoute !== null}
        onClose={() => setSelectedRoute(null)}
      />
    </View>
  );
}
