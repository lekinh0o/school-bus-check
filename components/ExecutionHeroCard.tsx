import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { DeviceLocationStatus } from '@/hooks/useExecutionLocation';
import { formatDistance, proximityKind } from '@/lib/geo';

type ExecutionHeroCardProps = {
  pointName: string;
  actionLabel: string;
  studentCount: number;
  pointComplete: boolean;
  hasTargetCoords: boolean;
  locationStatus: DeviceLocationStatus;
  distanceMeters: number | undefined;
  inside: boolean;
  onNavigateGoogle: () => void;
  onNavigateWaze: () => void;
  onRetryLocation: () => void;
};

export function ExecutionHeroCard({
  pointName,
  actionLabel,
  studentCount,
  pointComplete,
  hasTargetCoords,
  locationStatus,
  distanceMeters,
  inside,
  onNavigateGoogle,
  onNavigateWaze,
  onRetryLocation,
}: ExecutionHeroCardProps) {
  const proximity = proximityKind(distanceMeters);
  const arrived = inside && hasTargetCoords && locationStatus === 'ready';
  const cardClass = arrived
    ? 'border-emerald-300 bg-emerald-800'
    : 'border-brand bg-brand-dark';

  return (
    <View className={`rounded-2xl border-2 px-4 py-4 ${cardClass}`}>
      <Text className="text-xs font-extrabold uppercase tracking-wide text-white">
        Próxima parada
      </Text>
      <Text className="mt-1 text-2xl font-extrabold text-white" numberOfLines={2}>
        {pointName}
      </Text>
      <Text className="mt-1 text-sm font-semibold text-emerald-100">
        {actionLabel}
      </Text>

      <View className="mt-3 flex-row flex-wrap items-center gap-x-4 gap-y-1">
        <Text className="text-base font-bold text-white">
          {distanceLine({
            hasTargetCoords,
            locationStatus,
            distanceMeters,
            arrived,
            pointComplete,
          })}
        </Text>
        <Text className="text-base font-bold text-white">
          {studentCount} {studentCount === 1 ? 'aluno' : 'alunos'}
        </Text>
      </View>

      <Text className="mt-2 text-sm font-bold text-emerald-100">
        {statusLine({
          hasTargetCoords,
          locationStatus,
          proximity,
          arrived,
          pointComplete,
        })}
      </Text>

      {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
        <Pressable
          onPress={onRetryLocation}
          accessibilityRole="button"
          accessibilityLabel="Tentar obter localização novamente"
          className="mt-3 self-start rounded-xl bg-white/15 px-3 py-2">
          <Text className="text-sm font-bold text-white">Tentar novamente</Text>
        </Pressable>
      )}

      <View className="mt-4 flex-row gap-2">
        <Pressable
          onPress={onNavigateGoogle}
          accessibilityRole="button"
          accessibilityLabel="Navegar até o ponto no Google Maps"
          className="min-h-12 flex-1 flex-row items-center justify-center rounded-xl bg-white py-3">
          <Feather name="map" size={18} color="#0A4D38" />
          <Text className="ml-2 text-sm font-extrabold text-brand-dark">Maps</Text>
        </Pressable>
        <Pressable
          onPress={onNavigateWaze}
          accessibilityRole="button"
          accessibilityLabel="Navegar até o ponto no Waze"
          className="min-h-12 flex-1 flex-row items-center justify-center rounded-xl bg-white py-3">
          <Feather name="navigation" size={18} color="#0A4D38" />
          <Text className="ml-2 text-sm font-extrabold text-brand-dark">Waze</Text>
        </Pressable>
      </View>
    </View>
  );
}

function distanceLine({
  hasTargetCoords,
  locationStatus,
  distanceMeters,
  arrived,
  pointComplete,
}: {
  hasTargetCoords: boolean;
  locationStatus: DeviceLocationStatus;
  distanceMeters: number | undefined;
  arrived: boolean;
  pointComplete: boolean;
}): string {
  if (pointComplete) {
    return 'Ponto concluído';
  }
  if (!hasTargetCoords) {
    return '—';
  }
  if (locationStatus === 'loading' || locationStatus === 'idle') {
    return '…';
  }
  if (locationStatus !== 'ready' || typeof distanceMeters !== 'number') {
    return '—';
  }
  if (arrived) {
    return 'Você chegou';
  }
  return formatDistance(distanceMeters);
}

function statusLine({
  hasTargetCoords,
  locationStatus,
  proximity,
  arrived,
  pointComplete,
}: {
  hasTargetCoords: boolean;
  locationStatus: DeviceLocationStatus;
  proximity: ReturnType<typeof proximityKind>;
  arrived: boolean;
  pointComplete: boolean;
}): string {
  if (pointComplete) {
    return 'Todos os alunos deste ponto já foram avaliados';
  }
  if (!hasTargetCoords) {
    return 'Localização do ponto não cadastrada';
  }
  if (locationStatus === 'denied') {
    return 'Ative a localização para acompanhar a distância.';
  }
  if (locationStatus === 'unavailable') {
    return 'Localização indisponível';
  }
  if (locationStatus === 'loading' || locationStatus === 'idle') {
    return 'Obtendo localização...';
  }
  if (arrived) {
    return 'Você chegou ao ponto';
  }
  if (proximity === 'approaching') {
    return 'Aproximando-se';
  }
  return 'Em rota';
}
