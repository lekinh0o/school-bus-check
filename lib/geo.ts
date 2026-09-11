import { coordsFromValues } from '@/lib/boardingPoints';

export const GEOFENCE_RADIUS_METERS = 50;
export const APPROACHING_RADIUS_METERS = 200;

const EARTH_RADIUS_METERS = 6371000;

export function calculateDistanceInMeters(
  currentLatitude: number | undefined,
  currentLongitude: number | undefined,
  targetLatitude: number | undefined,
  targetLongitude: number | undefined,
): number | undefined {
  const current = coordsFromValues(currentLatitude, currentLongitude);
  const target = coordsFromValues(targetLatitude, targetLongitude);
  if (!current || !target) {
    return undefined;
  }

  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(target.latitude - current.latitude);
  const dLon = toRad(target.longitude - current.longitude);
  const lat1 = toRad(current.latitude);
  const lat2 = toRad(target.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function isInsideGeofence(
  distanceMeters: number | undefined,
  radiusMeters = GEOFENCE_RADIUS_METERS,
): boolean {
  return typeof distanceMeters === 'number' && distanceMeters <= radiusMeters;
}

export function geofenceJustEntered(wasInside: boolean, isInside: boolean): boolean {
  return !wasInside && isInside;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

export type ProximityKind = 'arrived' | 'approaching' | 'en_route';

export function proximityKind(
  distanceMeters: number | undefined,
): ProximityKind | undefined {
  if (typeof distanceMeters !== 'number') {
    return undefined;
  }
  if (distanceMeters <= GEOFENCE_RADIUS_METERS) {
    return 'arrived';
  }
  if (distanceMeters <= APPROACHING_RADIUS_METERS) {
    return 'approaching';
  }
  return 'en_route';
}
