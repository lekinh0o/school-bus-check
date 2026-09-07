import { Feather } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

type RouteTimelineProps = {
  startPoint: string;
  streets: string[];
  schoolName: string;
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

export function RouteTimeline({
  startPoint,
  streets,
  schoolName,
}: RouteTimelineProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3"
      contentContainerClassName="items-center py-1 pr-2">
      <View className="flex-row items-center">
        <Node icon="flag" label={startPoint} />
        {streets.map((street, index) => (
          <Node key={`${street}-${index}`} icon="map-pin" label={street} />
        ))}
        <Node icon="home" label={schoolName} isLast />
      </View>
    </ScrollView>
  );
}
