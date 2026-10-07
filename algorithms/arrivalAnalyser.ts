// algorithms/arrivalAnalyser.ts

import { PlaceWithContext }            from './filterCandidates'
import { Coords, haversineDistance }   from './haversine'
import { isOpenAt, timeToMins }        from './openingHoursCheck'
import { ArrivalEveningSuggestion }    from '@/types/tripPlan'
import { SwapOption }                  from '@/types/itinerary'

const FOOD_CATEGORY_IDS = new Set([1, 2, 3, 4])  // restaurant, cafe, brunch, bar
const WALK_CATEGORY_IDS = new Set([6, 7])          // landmark, park

export type ArrivalMode = 'full_day' | 'afternoon' | 'evening_only'

export function classifyArrival(arrivalTime: string): ArrivalMode {
  const [h] = arrivalTime.split(':').map(Number)
  if (h < 12) return 'full_day'
  if (h < 16) return 'afternoon'
  return 'evening_only'
}

export function buildEveningOnlySuggestion(
  allPlaces:   PlaceWithContext[],
  origin:      Coords,
  budget:      number,
  dayOfWeek:   number,   // 0=Sunday … 6=Saturday — filters by real opening hours
  arrivalTime: string    // 'HH:MM' — only show places still open on arrival
): ArrivalEveningSuggestion {

  const DINNER_RADIUS_KM = 0.8
  const WALK_RADIUS_KM   = 0.5

  // Add 1 hour buffer to arrival — tourist needs to check in first
  const arrivalMins  = timeToMins(arrivalTime)
  const readyMins    = arrivalMins + 60
  const readyTimeStr = `${String(Math.floor(readyMins / 60)).padStart(2, '0')}:${String(readyMins % 60).padStart(2, '0')}`

  // Dinner options
  // isOpenAt checks the place is open at the time the tourist will actually arrive
  // dayOfWeek ensures we respect Monday closures, Sunday hours etc.
  const dinnerOptions: SwapOption[] = allPlaces
    .filter(p => {
      if (!FOOD_CATEGORY_IDS.has(p.category_id)) return false

      const dist = haversineDistance(origin, { lat: p.latitude, lng: p.longitude })
      if (dist > DINNER_RADIUS_KM) return false

      // Must be open when the tourist is actually ready to eat
      if (!isOpenAt(p.hours, dayOfWeek, readyTimeStr)) return false

      const spend = parseFloat(String(p.avg_spend ?? 0))
      if (spend > budget * 0.4) return false

      return true
    })
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5)
    .map(p => {
      const distKm = haversineDistance(origin, { lat: p.latitude, lng: p.longitude })
      return {
        place:   p,
        reason:  `${Math.round(distKm * 1000)}m away · open now`,
        distKm,
      }
    })

  // Evening walks
  // Parks and landmarks don't always have opening hours in the DB
  // isOpenAt returns true when hours array is empty (assume open) — correct for outdoor spaces
  const eveningWalks: SwapOption[] = allPlaces
    .filter(p => {
      if (!WALK_CATEGORY_IDS.has(p.category_id)) return false

      const dist = haversineDistance(origin, { lat: p.latitude, lng: p.longitude })
      if (dist > WALK_RADIUS_KM) return false

      if ((p.avg_visit_duration ?? 60) > 30) return false

      // Still check opening hours — some indoor landmarks close early
      if (!isOpenAt(p.hours, dayOfWeek, readyTimeStr)) return false

      return true
    })
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 2)
    .map(p => {
      const distKm = haversineDistance(origin, { lat: p.latitude, lng: p.longitude })
      return {
        place:   p,
        reason:  'Short evening stroll · no ticket needed',
        distKm,
      }
    })

  // Build the note dynamically based on actual arrival time
  const arrivalHour  = Math.floor(arrivalMins / 60)
  const isLateNight  = arrivalHour >= 22

  const note = isLateNight
    ? `You arrive late tonight — we suggest heading straight to your accommodation and starting fresh tomorrow.`
    : `You arrive at ${arrivalTime} — by around ${readyTimeStr} you'll be settled in and ready to explore the neighbourhood. Your full itinerary starts tomorrow morning.`

  return {
    note,
    dinnerOptions,
    eveningWalks,
  }
}