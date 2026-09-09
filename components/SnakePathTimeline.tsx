import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';

export type SnakeStopStatus = 'done' | 'current' | 'pending';
export type StopKind = 'start' | 'boarding' | 'school';

export type SnakeStop = {
  key: string;
  label: string;
  status: SnakeStopStatus;
  kind: StopKind;
  icon: keyof typeof Feather.glyphMap;
};

const KIND_PALETTE: Record<
  StopKind,
  { solid: string; light: string; icon: string; ring: string }
> = {
  start: {
    solid: 'bg-sky-600',
    light: 'bg-sky-100',
    icon: '#0369A1',
    ring: 'border-sky-700',
  },
  boarding: {
    solid: 'bg-amber-500',
    light: 'bg-amber-100',
    icon: '#B45309',
    ring: 'border-amber-700',
  },
  school: {
    solid: 'bg-violet-600',
    light: 'bg-violet-100',
    icon: '#6D28D9',
    ring: 'border-violet-800',
  },
};

function chunkStops(stops: SnakeStop[], cols: number): SnakeStop[][] {
  const rows: SnakeStop[][] = [];
  for (let i = 0; i < stops.length; i += cols) {
    rows.push(stops.slice(i, i + cols));
  }
  return rows;
}

function nodeColors(kind: StopKind, status: SnakeStopStatus) {
  const palette = KIND_PALETTE[kind];
  if (status === 'current') {
    return {
      wrap: palette.solid,
      icon: '#FFFFFF',
      ring: `border-2 ${palette.ring}`,
    };
  }
  if (status === 'done') {
    return { wrap: palette.light, icon: palette.icon, ring: '' };
  }
  return { wrap: 'bg-slate-200', icon: '#64748B', ring: '' };
}

function iconForKind(kind: StopKind): keyof typeof Feather.glyphMap {
  if (kind === 'school') {
    return 'home';
  }
  if (kind === 'start') {
    return 'flag';
  }
  return 'map-pin';
}

type SnakePathTimelineProps = {
  stops: SnakeStop[];
  compact?: boolean;
};

export function SnakePathTimeline({
  stops,
  compact = false,
}: SnakePathTimelineProps) {
  const [width, setWidth] = useState(0);
  const node = compact ? 40 : 48;
  const minCell = compact ? 72 : 80;
  const cols = Math.max(2, width > 0 ? Math.floor(width / minCell) : 4);
  const rows = chunkStops(stops, cols);
  const cellW = width > 0 ? width / cols : minCell;

  return (
    <View className="mt-2" onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {rows.map((row, rowIndex) => {
        const rtl = rowIndex % 2 === 1;
        const hasNext = rowIndex < rows.length - 1;
        return (
          <View key={`row-${rowIndex}`}>
            <View className={rtl ? 'flex-row-reverse' : 'flex-row'}>
              {row.map((stop, index) => {
                const colors = nodeColors(stop.kind, stop.status);
                const last = index === row.length - 1;
                const iconName = stop.icon || iconForKind(stop.kind);
                return (
                  <View
                    key={stop.key}
                    style={{ width: cellW }}
                    className="items-center">
                    <View
                      className="w-full items-center justify-center"
                      style={{ height: node }}>
                      {last ? null : (
                        <View
                          className="absolute h-0.5 bg-slate-300"
                          style={{
                            top: node / 2 - 1,
                            width: cellW,
                            ...(rtl
                              ? { right: cellW / 2 }
                              : { left: cellW / 2 }),
                          }}
                        />
                      )}
                      <View
                        className={`z-10 items-center justify-center rounded-full ${colors.wrap} ${colors.ring}`}
                        style={{ height: node, width: node }}>
                        <Feather
                          name={iconName}
                          size={compact ? 16 : 22}
                          color={colors.icon}
                        />
                      </View>
                    </View>
                    <Text
                      className="mt-1 text-center font-semibold text-slate-700"
                      style={{ fontSize: compact ? 10 : 11, maxWidth: cellW - 4 }}
                      numberOfLines={2}>
                      {stop.label}
                    </Text>
                  </View>
                );
              })}
            </View>
            {hasNext ? (
              <View className="h-4 w-full">
                <View
                  className="absolute h-4 w-0.5 bg-slate-300"
                  style={
                    rtl
                      ? { left: cellW / 2 - 1 }
                      : { right: cellW / 2 - 1 }
                  }
                />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
