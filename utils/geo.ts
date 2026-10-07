import { ALGORITHM } from '@/constants/algorithm'

export interface Coords {
  lat: number
  lng: number
}

export function haversineDistance(a: Coords, b: Coords): number {
  const R = ALGORITHM.HAVERSINE_EARTH_RADIUS
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const x = sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Pre-filter candidates by rough distance before any API calls
export function preFilterByDistance<T extends Coords>(
  origin: Coords,
  candidates: T[],
  maxKm: number = ALGORITHM.MAX_WALKING_KM * 3 // 3× walking limit for pre-filter
): T[] {
  return candidates
    .map(c => ({ ...c, roughDistanceKm: haversineDistance(origin, c) }))
    .filter(c => c.roughDistanceKm <= maxKm)
    .sort((a, b) => a.roughDistanceKm - b.roughDistanceKm)
}