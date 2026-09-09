import type { Route, RouteDirection } from '@/types';

export type RouteTimeWindow = {
  start: string;
  end: string;
};

export function getRouteTimeWindow(
  route: Route,
  direction: RouteDirection,
): RouteTimeWindow {
  if (direction === 'IDA') {
    return {
      start: route.departureTimeIda,
      end: route.arrivalTimeIda,
    };
  }
  return {
    start: route.departureTimeVolta,
    end: route.arrivalTimeVolta,
  };
}

export function formatRouteTimeWindow(
  route: Route,
  direction: RouteDirection,
): string {
  const { start, end } = getRouteTimeWindow(route, direction);
  return `${start} às ${end}`;
}
