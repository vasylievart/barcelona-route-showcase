import { Coords, haversineDistance } from './haversine'
import { PlaceWithContext, scoreCandidate, FilterContext } from './filterCandidates'
import { timeToMins } from './openingHoursCheck'

export interface GoldenAnchor {
  place: PlaceWithContext
  fixedTime: string
}

/**
 * Identify the single highest-scoring Tier 1 place for the day
 * and fix it at its optimal time window.
 */
export function selectGoldenAnchor(
  allPlaces: PlaceWithContext[],
  ctx: FilterContext,
  origin: Coords,
  usedIds: Set<string>
): GoldenAnchor | null {

  const tier1Candidates = allPlaces.filter(p =>
    p.tier === 1 &&
    !usedIds.has(p.id) &&
    p.tags.some(t => ctx.interests.includes(t))
  )

  if (tier1Candidates.length === 0) return null

  const scored = tier1Candidates
    .map(p => ({
      place: p,
      distKm: haversineDistance(origin, { lat: p.latitude, lng: p.longitude }),
      score: scoreCandidate(p, ctx, haversineDistance(origin, { lat: p.latitude, lng: p.longitude })),
    }))
    .sort((a, b) => b.score - a.score)

  const winner = scored[0].place

  // Determine the fixed time — use best_time_start if set, else default to 09:30
  const fixedTime = winner.best_time_start
    ? winner.best_time_start.slice(0, 5)
    : '09:30'

  return { place: winner, fixedTime }
}