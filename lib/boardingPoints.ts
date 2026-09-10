import type { BoardingPoint } from '@/types';

function newPointId(): string {
  return `bp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function coordsFromValues(
  latitude: unknown,
  longitude: unknown,
): { latitude: number; longitude: number } | undefined {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return undefined;
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return undefined;
  }
  return { latitude, longitude };
}

export function createBoardingPoint(
  name: string,
  coords?: { latitude: number; longitude: number },
): BoardingPoint {
  const point: BoardingPoint = {
    id: newPointId(),
    name: name.trim(),
  };
  const resolved = coords
    ? coordsFromValues(coords.latitude, coords.longitude)
    : undefined;
  if (resolved) {
    point.latitude = resolved.latitude;
    point.longitude = resolved.longitude;
  }
  return point;
}

export function hasCoordinates(
  point: BoardingPoint | undefined,
): point is BoardingPoint & { latitude: number; longitude: number } {
  return Boolean(coordsFromValues(point?.latitude, point?.longitude));
}

export function boardingPointNames(
  points: BoardingPoint[] | undefined,
): string[] {
  return (points ?? [])
    .map((point) => point.name.trim())
    .filter((name) => name.length > 0);
}

export function findBoardingPointByName(
  points: BoardingPoint[] | undefined,
  name: string,
): BoardingPoint | undefined {
  const normalized = name.trim();
  return (points ?? []).find((point) => point.name.trim() === normalized);
}

export function normalizeBoardingPoints(raw: unknown): BoardingPoint[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const result: BoardingPoint[] = [];
  const seen = new Set<string>();
  raw.forEach((item, index) => {
    if (typeof item === 'string') {
      const name = item.trim();
      if (!name || seen.has(name)) {
        return;
      }
      seen.add(name);
      result.push({ id: `migrated-${index}-${name}`, name });
      return;
    }
    if (!item || typeof item !== 'object') {
      return;
    }
    const record = item as Record<string, unknown>;
    const name = typeof record.name === 'string' ? record.name.trim() : '';
    if (!name || seen.has(name)) {
      return;
    }
    seen.add(name);
    const id =
      typeof record.id === 'string' && record.id.length > 0
        ? record.id
        : `migrated-${index}-${name}`;
    const point: BoardingPoint = { id, name };
    const coords = coordsFromValues(record.latitude, record.longitude);
    if (coords) {
      point.latitude = coords.latitude;
      point.longitude = coords.longitude;
    }
    result.push(point);
  });
  return result;
}
