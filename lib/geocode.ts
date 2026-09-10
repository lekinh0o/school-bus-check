import type { BoardingPoint } from '@/types';

export type MapCoords = {
  latitude: number;
  longitude: number;
};

type NominatimHit = {
  lat?: string;
  lon?: string;
  display_name?: string;
};

export async function searchPlace(query: string): Promise<MapCoords | undefined> {
  const q = query.trim();
  if (!q) {
    return undefined;
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'SchoolBusCheck/1.0 (rota escolar)',
    },
  });
  if (!response.ok) {
    return undefined;
  }
  const data = (await response.json()) as NominatimHit[];
  const first = data[0];
  const latitude = Number(first?.lat);
  const longitude = Number(first?.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return undefined;
  }
  return { latitude, longitude };
}

export function pointCoords(point: BoardingPoint): MapCoords | undefined {
  if (
    typeof point.latitude !== 'number' ||
    typeof point.longitude !== 'number' ||
    !Number.isFinite(point.latitude) ||
    !Number.isFinite(point.longitude)
  ) {
    return undefined;
  }
  return { latitude: point.latitude, longitude: point.longitude };
}
