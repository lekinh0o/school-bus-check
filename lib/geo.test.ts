import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  calculateDistanceInMeters,
  formatDistance,
  GEOFENCE_RADIUS_METERS,
  geofenceJustEntered,
  isInsideGeofence,
  proximityKind,
} from './geo';

describe('calculateDistanceInMeters', () => {
  it('returns undefined when a coordinate is missing or invalid', () => {
    assert.equal(calculateDistanceInMeters(undefined, -46, -23, -46), undefined);
    assert.equal(calculateDistanceInMeters(NaN, -46, -23, -46), undefined);
  });

  it('returns ~0 for the same point', () => {
    const meters = calculateDistanceInMeters(-23.55, -46.63, -23.55, -46.63);
    assert.ok(meters !== undefined && meters < 1);
  });

  it('measures a known short offset in São Paulo', () => {
    const meters = calculateDistanceInMeters(-23.55, -46.63, -23.55045, -46.63);
    assert.ok(meters !== undefined);
    assert.ok(meters > 40 && meters < 60);
  });
});

describe('geofence', () => {
  it('is inside at the radius boundary', () => {
    assert.equal(isInsideGeofence(GEOFENCE_RADIUS_METERS), true);
    assert.equal(isInsideGeofence(GEOFENCE_RADIUS_METERS + 0.1), false);
  });

  it('fires only on the outside-to-inside transition', () => {
    assert.equal(geofenceJustEntered(false, true), true);
    assert.equal(geofenceJustEntered(true, true), false);
    assert.equal(geofenceJustEntered(true, false), false);
    assert.equal(geofenceJustEntered(false, false), false);
  });
});

describe('formatDistance and proximity', () => {
  it('formats meters and km', () => {
    assert.equal(formatDistance(49.4), '49 m');
    assert.equal(formatDistance(1500), '1,5 km');
  });

  it('classifies approaching vs arrived', () => {
    assert.equal(proximityKind(20), 'arrived');
    assert.equal(proximityKind(75), 'approaching');
    assert.equal(proximityKind(500), 'en_route');
  });
});
