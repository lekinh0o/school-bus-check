import { Feather } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import type { RouteDirection } from '@/types';

export type RouteTimelineStop = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
};

type RouteTimelineProps = {
  stops: RouteTimelineStop[];
};

function Node({
  icon,
  label,
  isLast,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  isLast?: boolean;
}) {
  return (
    <View className="flex-row items-center">
      <View className="items-center">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-light">
          <Feather name={icon} size={16} color="#0F6B4D" />
        </View>
        <Text
          className="mt-1 max-w-[96px] text-center text-xs font-semibold text-slate-700"
          numberOfLines={2}>
          {label}
        </Text>
      </View>
      {isLast ? null : (
        <View className="mx-2 mb-5 h-0.5 w-8 bg-slate-300" />
      )}
    </View>
  );
}

export function buildRouteTimelineStops(
  startPoint: string,
  boardingPoints: string[],
  schoolName: string,
  direction: RouteDirection = 'IDA',
): RouteTimelineStop[] {
  if (direction === 'VOLTA') {
    return [
      { icon: 'home', label: schoolName },
      ...[...boardingPoints].reverse().map((point) => ({
        icon: 'map-pin' as const,
        label: point,
      })),
      { icon: 'flag', label: startPoint },
    ];
  }

  return [
    { icon: 'flag', label: startPoint },
    ...boardingPoints.map((point) => ({
      icon: 'map-pin' as const,
      label: point,
    })),
    { icon: 'home', label: schoolName },
  ];
}

export function RouteTimeline({ stops }: RouteTimelineProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3"
      contentContainerClassName="items-center py-1 pr-2">
      <View className="flex-row items-center">
        {stops.map((stop, index) => (
          <Node
            key={`${stop.icon}-${stop.label}-${index}`}
            icon={stop.icon}
            label={stop.label}
            isLast={index === stops.length - 1}
          />
        ))}
      </View>
    </ScrollView>
  );
}
