import { Linking } from 'react-native';

import { coordsFromValues } from '@/lib/boardingPoints';

export type NavigationApp = 'google' | 'waze';

export type OpenNavigationResult =
  | { ok: true }
  | { ok: false; reason: 'missing_coords' | 'unavailable' };

export function navigationUrl(
  latitude: number,
  longitude: number,
  app: NavigationApp,
): string {
  if (app === 'waze') {
    return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

export async function openNavigation(
  latitude: number | undefined,
  longitude: number | undefined,
  app: NavigationApp,
): Promise<OpenNavigationResult> {
  const coords = coordsFromValues(latitude, longitude);
  if (!coords) {
    return { ok: false, reason: 'missing_coords' };
  }
  const url = navigationUrl(coords.latitude, coords.longitude, app);
  try {
    await Linking.openURL(url);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
