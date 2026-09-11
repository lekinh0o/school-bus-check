import { findBoardingPointByName } from '@/lib/boardingPoints';
import { entityCoords, type MapCoords } from '@/lib/geocode';
import type { Route, School } from '@/types';

export function currentStopCoords(
  route: Route | undefined,
  school: School | undefined,
  schoolId: string | undefined,
  startPoint: string | undefined,
  token: string,
): MapCoords | undefined {
  if (!route || !token) {
    return undefined;
  }
  if (schoolId && token === schoolId) {
    return entityCoords(school);
  }
  if (startPoint && token === startPoint) {
    return entityCoords({
      latitude: route.startLatitude,
      longitude: route.startLongitude,
    });
  }
  return entityCoords(findBoardingPointByName(route.boardingPoints, token));
}
