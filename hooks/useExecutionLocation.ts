import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

import {
  calculateDistanceInMeters,
  geofenceJustEntered,
  isInsideGeofence,
} from '@/lib/geo';
import type { MapCoords } from '@/lib/geocode';

export type DeviceLocationStatus =
  | 'idle'
  | 'loading'
  | 'denied'
  | 'unavailable'
  | 'ready';

type UseExecutionLocationArgs = {
  enabled: boolean;
  target: MapCoords | undefined;
  stopKey: string;
};

export function useExecutionLocation({
  enabled,
  target,
  stopKey,
}: UseExecutionLocationArgs) {
  const [status, setStatus] = useState<DeviceLocationStatus>('idle');
  const [coords, setCoords] = useState<MapCoords | undefined>();
  const [retryToken, setRetryToken] = useState(0);
  const insideRef = useRef(false);
  const [arrivedPulse, setArrivedPulse] = useState(0);

  const retry = useCallback(() => {
    setRetryToken((value) => value + 1);
  }, []);

  useEffect(() => {
    insideRef.current = false;
  }, [stopKey]);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      setCoords(undefined);
      return;
    }

    let cancelled = false;
    let subscription: Location.LocationSubscription | undefined;

    async function start() {
      setStatus('loading');
      try {
        const existing = await Location.getForegroundPermissionsAsync();
        let granted = existing.status === Location.PermissionStatus.GRANTED;
        if (!granted) {
          const requested = await Location.requestForegroundPermissionsAsync();
          granted = requested.status === Location.PermissionStatus.GRANTED;
        }
        if (!granted) {
          if (!cancelled) {
            setStatus('denied');
            setCoords(undefined);
          }
          return;
        }
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 4000,
            distanceInterval: 10,
          },
          (position) => {
            if (cancelled) {
              return;
            }
            setCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setStatus('ready');
          },
        );
      } catch {
        if (!cancelled) {
          setStatus('unavailable');
          setCoords(undefined);
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled, retryToken]);

  const distanceMeters = calculateDistanceInMeters(
    coords?.latitude,
    coords?.longitude,
    target?.latitude,
    target?.longitude,
  );
  const inside = isInsideGeofence(distanceMeters);

  useEffect(() => {
    if (!enabled || typeof distanceMeters !== 'number') {
      return;
    }
    const entered = geofenceJustEntered(insideRef.current, inside);
    insideRef.current = inside;
    if (entered) {
      setArrivedPulse((value) => value + 1);
    }
  }, [distanceMeters, enabled, inside, stopKey]);

  return {
    status,
    coords,
    distanceMeters,
    inside,
    arrivedPulse,
    retry,
  };
}
