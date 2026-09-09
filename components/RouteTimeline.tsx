import type { StopKind } from '@/components/SnakePathTimeline';
import { SnakePathTimeline } from '@/components/SnakePathTimeline';
import type { RouteDirection } from '@/types';

export type RouteTimelineStop = {
  kind: StopKind;
  label: string;
};

type RouteTimelineProps = {
  stops: RouteTimelineStop[];
};

export function buildRouteTimelineStops(
  startPoint: string,
  boardingPoints: string[],
  schoolName: string,
  direction: RouteDirection = 'IDA',
): RouteTimelineStop[] {
  if (direction === 'VOLTA') {
    return [
      { kind: 'school', label: schoolName },
      ...[...boardingPoints].reverse().map((point) => ({
        kind: 'boarding' as const,
        label: point,
      })),
      { kind: 'start', label: startPoint },
    ];
  }

  return [
    { kind: 'start', label: startPoint },
    ...boardingPoints.map((point) => ({
      kind: 'boarding' as const,
      label: point,
    })),
    { kind: 'school', label: schoolName },
  ];
}

export function RouteTimeline({ stops }: RouteTimelineProps) {
  return (
    <SnakePathTimeline
      compact
      stops={stops.map((stop, index) => ({
        key: `${stop.kind}-${stop.label}-${index}`,
        label: stop.label,
        status: 'done',
        kind: stop.kind,
        icon:
          stop.kind === 'school'
            ? 'home'
            : stop.kind === 'start'
              ? 'flag'
              : 'map-pin',
      }))}
    />
  );
}
