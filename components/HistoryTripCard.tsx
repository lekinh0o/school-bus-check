import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { cardShadow, palette } from '@/constants/Colors';
import { formatDuration, formatTripHeadline } from '@/lib/formatTrip';
import type { RouteHistory } from '@/types/execution';

export function HistoryTripCard({
  item,
  title,
  onPress,
  compact = false,
}: {
  item: RouteHistory;
  title: string;
  onPress: () => void;
  compact?: boolean;
}) {
  const headline = formatTripHeadline(
    item.finishedAt || item.startedAt,
    title,
    item.direction,
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Viagem ${title}`}
      style={compact ? undefined : cardShadow}
      className={
        compact
          ? 'flex-row items-start py-3'
          : 'mt-3 rounded-card border border-[#EEF2F6] bg-surface p-4'
      }>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
        <Feather name="clock" size={18} color={palette.primary} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-semibold text-ink">{headline}</Text>
        <View className="mt-1 flex-row flex-wrap items-center">
          <Feather name="check-circle" size={14} color={palette.success} />
          <Text className="ml-1 text-[12px] text-ink-secondary">
            {item.metrics.present} presentes
          </Text>
          <Feather
            name="x-circle"
            size={14}
            color={palette.danger}
            style={{ marginLeft: 10 }}
          />
          <Text className="ml-1 text-[12px] text-ink-secondary">
            {item.metrics.absent} ausentes
          </Text>
          {item.metrics.skippedPoints > 0 ? (
            <>
              <Text className="mx-2 text-ink-muted">|</Text>
              <Text className="text-[12px] text-ink-secondary">
                {item.metrics.skippedPoints} pulados
              </Text>
            </>
          ) : null}
          <Text className="ml-2 text-[12px] text-ink-muted">
            |  Duração: {formatDuration(item.startedAt, item.finishedAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
