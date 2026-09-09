import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export type SnakeStopStatus = 'done' | 'current' | 'pending';

export type SnakeStop = {
  key: string;
  label: string;
  status: SnakeStopStatus;
  icon: keyof typeof Feather.glyphMap;
};

const COLS = 4;

function chunkStops(stops: SnakeStop[]): SnakeStop[][] {
  const rows: SnakeStop[][] = [];
  for (let i = 0; i < stops.length; i += COLS) {
    rows.push(stops.slice(i, i + COLS));
  }
  return rows;
}

function nodeColors(status: SnakeStopStatus) {
  if (status === 'current') {
    return { wrap: 'bg-brand', icon: '#FFFFFF' };
  }
  if (status === 'done') {
    return { wrap: 'bg-emerald-100', icon: '#0F6B4D' };
  }
  return { wrap: 'bg-slate-200', icon: '#64748B' };
}

type SnakePathTimelineProps = {
  stops: SnakeStop[];
};

export function SnakePathTimeline({ stops }: SnakePathTimelineProps) {
  const rows = chunkStops(stops);
  return (
    <View className="mt-2">
      {rows.map((row, rowIndex) => {
        const rtl = rowIndex % 2 === 1;
        const items = rtl ? [...row].reverse() : row;
        return (
          <View key={`row-${rowIndex}`}>
            {rowIndex > 0 ? (
              <View
                className={`h-4 w-0.5 bg-slate-300 ${
                  rtl ? 'ml-6' : 'self-end mr-6'
                }`}
              />
            ) : null}
            <View className="flex-row items-start">
              {items.map((stop, index) => {
                const colors = nodeColors(stop.status);
                const last = index === items.length - 1;
                return (
                  <View key={stop.key} className="flex-row items-center">
                    <View className="w-16 items-center">
                      <View
                        className={`h-12 w-12 items-center justify-center rounded-full ${colors.wrap} ${
                          stop.status === 'current' ? 'border-2 border-brand-dark' : ''
                        }`}>
                        <Feather name={stop.icon} size={24} color={colors.icon} />
                      </View>
                      <Text
                        className="mt-1 max-w-[64px] text-center text-[10px] font-semibold text-slate-700"
                        numberOfLines={2}>
                        {stop.label}
                      </Text>
                    </View>
                    {last ? null : (
                      <View className="mb-6 h-0.5 w-3 bg-slate-300" />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
