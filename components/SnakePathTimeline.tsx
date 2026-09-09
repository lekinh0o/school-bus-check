import { Feather } from '@expo/vector-icons';
import { Fragment } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';

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
  { solidBg: string; lightBg: string; icon: string; ring: string }
> = {
  start: {
    solidBg: '#0284C7',
    lightBg: '#E0F2FE',
    icon: '#0369A1',
    ring: '#0C4A6E',
  },
  boarding: {
    solidBg: '#F59E0B',
    lightBg: '#FEF3C7',
    icon: '#B45309',
    ring: '#B45309',
  },
  school: {
    solidBg: '#7C3AED',
    lightBg: '#EDE9FE',
    icon: '#6D28D9',
    ring: '#5B21B6',
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
    return { bg: palette.solidBg, icon: '#FFFFFF', ring: palette.ring };
  }
  if (status === 'done') {
    return { bg: palette.lightBg, icon: palette.icon, ring: 'transparent' };
  }
  return { bg: '#E2E8F0', icon: '#64748B', ring: 'transparent' };
}

type SnakePathTimelineProps = {
  stops: SnakeStop[];
  compact?: boolean;
};

export function SnakePathTimeline({
  stops,
  compact = false,
}: SnakePathTimelineProps) {
  const { width: windowWidth } = useWindowDimensions();
  const node = compact ? 40 : 48;
  const minCell = compact ? 72 : 80;
  const cols = Math.max(2, Math.min(4, Math.floor((windowWidth - 48) / minCell)));
  const rows = chunkStops(stops, cols);

  return (
    <View className="mt-2 w-full">
      {rows.map((row, rowIndex) => {
        const rtl = rowIndex % 2 === 1;
        const hasNext = rowIndex < rows.length - 1;
        const emptySlots = cols - row.length;
        return (
          <View key={`row-${rowIndex}`}>
            <View className={rtl ? 'flex-row-reverse' : 'flex-row'}>
              {row.map((stop, index) => {
                const colors = nodeColors(stop.kind, stop.status);
                const last = index === row.length - 1;
                return (
                  <Fragment key={stop.key}>
                    <View style={{ flex: 1 }} className="items-center">
                      <View
                        className="items-center justify-center rounded-full"
                        style={{
                          height: node,
                          width: node,
                          backgroundColor: colors.bg,
                          borderWidth: stop.status === 'current' ? 2 : 0,
                          borderColor: colors.ring,
                        }}>
                        <Feather
                          name={stop.icon}
                          size={compact ? 16 : 22}
                          color={colors.icon}
                        />
                      </View>
                      <Text
                        className="mt-1 text-center font-semibold text-slate-700"
                        style={{ fontSize: compact ? 10 : 11 }}
                        numberOfLines={2}>
                        {stop.label}
                      </Text>
                    </View>
                    {last ? null : (
                      <View
                        className="bg-slate-300"
                        style={{
                          width: 10,
                          height: 2,
                          marginTop: node / 2 - 1,
                        }}
                      />
                    )}
                  </Fragment>
                );
              })}
              {emptySlots > 0
                ? Array.from({ length: emptySlots }, (_, index) => (
                    <View key={`pad-${index}`} style={{ flex: 1 }} />
                  ))
                : null}
            </View>
            {hasNext ? (
              <View className="h-4 flex-row">
                {rtl ? (
                  <>
                    <View style={{ flex: 1 }} className="items-center">
                      <View className="h-4 w-0.5 bg-slate-300" />
                    </View>
                    {Array.from({ length: cols - 1 }, (_, index) => (
                      <View key={`gap-${index}`} style={{ flex: 1 }} />
                    ))}
                  </>
                ) : (
                  <>
                    {Array.from({ length: cols - 1 }, (_, index) => (
                      <View key={`gap-${index}`} style={{ flex: 1 }} />
                    ))}
                    <View style={{ flex: 1 }} className="items-center">
                      <View className="h-4 w-0.5 bg-slate-300" />
                    </View>
                  </>
                )}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
