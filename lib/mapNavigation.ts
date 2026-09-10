import { Linking } from 'react-native';

import { coordsFromValues } from '@/lib/boardingPoints';

export type NavigationApp = 'google' | 'waze';

export type OpenNavigationResult =
  | { ok: true }
  | { ok: false; reason: 'missing_coords' | 'unavailable' };

export async function openNavigation(
  latitude: number | undefined,
  longitude: number | undefined,
  app: NavigationApp,
): Promise<OpenNavigationResult> {
  const coords = coordsFromValues(latitude, longitude);
  if (!coords) {
    return { ok: false, reason: 'missing_coords' };
  }
  const url =
    app === 'waze'
      ? `https://waze.com/ul?ll=${coords.latitude},${coords.longitude}&navigate=yes`
      : `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return { ok: false, reason: 'unavailable' };
    }
    await Linking.openURL(url);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
