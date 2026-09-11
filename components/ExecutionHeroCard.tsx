import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { palette } from '@/constants/Colors';
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
  stopIndex: number;
  stopCount: number;
  onNextStop?: () => void;
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
  stopIndex,
  stopCount,
  onNextStop,
  onNavigateGoogle,
  onNavigateWaze,
  onRetryLocation,
}: ExecutionHeroCardProps) {
  const proximity = proximityKind(distanceMeters);
  const arrived = inside && hasTargetCoords && locationStatus === 'ready';

  return (
    <View
      className={`rounded-card px-4 py-4 ${
        arrived ? 'bg-[#DCFCE7]' : 'bg-primary-light'
      }`}>
      <View className="flex-row items-start justify-between">
        <Text className="text-[11px] font-extrabold uppercase tracking-wide text-primary">
          Parada atual
        </Text>
        <Text className="text-[12px] font-semibold text-ink-muted">
          {stopIndex + 1} de {stopCount}
        </Text>
      </View>
      <Text className="mt-1 text-[22px] font-extrabold text-ink" numberOfLines={2}>
        {actionLabel}
      </Text>
      <View className="mt-2 flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center pr-2">
          <Feather name="map-pin" size={14} color={palette.primary} />
          <Text className="ml-1 flex-1 text-[13px] font-semibold text-ink-secondary" numberOfLines={1}>
            {pointName}
          </Text>
        </View>
        {onNextStop ? (
          <Pressable
            onPress={onNextStop}
            accessibilityRole="button"
            accessibilityLabel="Próxima parada"
            className="flex-row items-center rounded-full bg-primary px-3 py-2">
            <Text className="text-[12px] font-extrabold text-white">Próxima parada</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>

      <Text className="mt-3 text-[14px] font-bold text-ink">
        {distanceLine({
          hasTargetCoords,
          locationStatus,
          distanceMeters,
          arrived,
          pointComplete,
        })}
        {'  ·  '}
        {studentCount} {studentCount === 1 ? 'aluno' : 'alunos'}
      </Text>
      <Text className="mt-1 text-[13px] font-semibold text-ink-secondary">
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
          className="mt-3 self-start rounded-xl bg-surface px-3 py-2">
          <Text className="text-sm font-bold text-primary-dark">Tentar novamente</Text>
        </Pressable>
      )}

      <View className="mt-4 flex-row gap-2">
        <Pressable
          onPress={onNavigateGoogle}
          accessibilityRole="button"
          accessibilityLabel="Navegar até o ponto no Google Maps"
          className="min-h-12 flex-1 flex-row items-center justify-center rounded-xl bg-surface py-3">
          <Feather name="map" size={18} color={palette.primaryDark} />
          <Text className="ml-2 text-sm font-extrabold text-primary-dark">Maps</Text>
        </Pressable>
        <Pressable
          onPress={onNavigateWaze}
          accessibilityRole="button"
          accessibilityLabel="Navegar até o ponto no Waze"
          className="min-h-12 flex-1 flex-row items-center justify-center rounded-xl bg-surface py-3">
          <Feather name="navigation" size={18} color={palette.primaryDark} />
          <Text className="ml-2 text-sm font-extrabold text-primary-dark">Waze</Text>
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
