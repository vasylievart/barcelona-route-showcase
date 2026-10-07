// algorithms/isCompanion.ts
//
// Two golden anchors are "companions" if they're close enough to visit on
// the same day (~10-15 min walk). Straight-line (haversine) distance is
// used as an approximation, not real walking distance — this understates
// distance around Montjuïc specifically (elevation, switchback roads), a
// known limitation accepted for v1 rather than precomputing real walking
// routes for the small, fixed anchor list.
//
// Only applies to real anchor-vs-anchor comparisons — discoverZone entries
// are never filtered by this (see GoldenAnchorStep spec Rule 8): a
// discover zone is a time-budget choice, not a proximity one.

import { haversineDistance } from './haversine'
import type { Place } from '@/types/place'

export const COMPANION_DISTANCE_KM = 1

export function isCompanion(a: Place, b: Place): boolean {
  const distanceMeters = haversineDistance(
    { lat: a.latitude, lng: a.longitude },
    { lat: b.latitude, lng: b.longitude }
  )
  return distanceMeters <= COMPANION_DISTANCE_KM
}