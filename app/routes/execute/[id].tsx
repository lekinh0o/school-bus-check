import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  buildRouteTimelineStops,
  RouteTimeline,
} from '@/components/RouteTimeline';
import { selectRouteById } from '@/store/routeSlice';
import { useAppSelector } from '@/store/store';
import type { RouteDirection } from '@/types';

export default function ExecuteRouteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const route = useAppSelector((state) =>
    id ? selectRouteById(state, id) : undefined,
  );
  const school = useAppSelector((state) =>
    route ? state.schools.entities[route.schoolId] : undefined,
  );
  const [direction, setDirection] = useState<RouteDirection | null>(null);

  const schoolName = school?.name ?? 'Escola não encontrada';
  const stops = useMemo(() => {
    if (!route || direction === null) {
      return [];
    }
    return buildRouteTimelineStops(
      route.startPoint,
      route.boardingPoints,
      schoolName,
      direction,
    );
  }, [direction, route, schoolName]);

  if (!route) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Stack.Screen options={{ title: 'Executar rota' }} />
        <Text className="text-center text-base text-slate-500">
          Rota não encontrada.
        </Text>
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace('/routes' as Href)
          }
          className="mt-6 items-center rounded-2xl bg-brand px-6 py-4">
          <Text className="text-base font-bold text-white">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerClassName="p-5 pb-10">
      <Stack.Screen options={{ title: route.title }} />
      <Text className="text-lg font-bold text-slate-900">{route.title}</Text>
      <Text className="mt-1 text-sm text-slate-500">
        Escolha o sentido desta viagem. A linha cadastrada não muda.
      </Text>

      <View className="mt-5 gap-3">
        <Pressable
          onPress={() => setDirection('IDA')}
          className={`rounded-2xl border px-4 py-5 ${
            direction === 'IDA'
              ? 'border-brand bg-brand-light'
              : 'border-slate-200 bg-white'
          }`}>
          <Text className="text-lg font-bold text-slate-900">
            ☀️ Sentido: IDA
          </Text>
          <Text className="mt-1 text-sm text-slate-600">Casa → Escola</Text>
        </Pressable>
        <Pressable
          onPress={() => setDirection('VOLTA')}
          className={`rounded-2xl border px-4 py-5 ${
            direction === 'VOLTA'
              ? 'border-brand bg-brand-light'
              : 'border-slate-200 bg-white'
          }`}>
          <Text className="text-lg font-bold text-slate-900">
            🌙 Sentido: VOLTA
          </Text>
          <Text className="mt-1 text-sm text-slate-600">Escola → Casa</Text>
        </Pressable>
      </View>

      {direction === null ? (
        <Text className="mt-8 text-center text-base text-slate-500">
          Selecione o sentido para ver o percurso desta viagem.
        </Text>
      ) : (
        <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Percurso {direction === 'IDA' ? 'ida' : 'volta'}
          </Text>
          <RouteTimeline stops={stops} />
        </View>
      )}
    </ScrollView>
  );
}
