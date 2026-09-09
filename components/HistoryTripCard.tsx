import { Pressable, Text } from 'react-native';

import { formatDuration, formatTripDate } from '@/lib/formatTrip';
import type { RouteHistory } from '@/types/execution';

export function HistoryTripCard({
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
