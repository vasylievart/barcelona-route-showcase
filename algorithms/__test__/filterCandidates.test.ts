// algorithms/filterCandidates.test.ts

import { scoreCandidate } from '../filterCandidates'

const basPlace = {
  id: '1', 
  name: 'Test', 
  category_id: 1,
  latitude: 41.39, 
  longitude: 2.16,
  rating: 4.5, 
  reviews_count: 100,
  price_level: 2, 
  avg_visit_duration: 60,
  avg_spend: 20, 
  website: null,
  google_place_id: 'test', 
  types: null,
  google_types: [],
  requires_booking: false, 
  booking_url: null,
  booking_lead_days: null, 
  cuisine_type: null,
  meal_types: null, 
  historical_desc: null,
  architect: null, 
  year_built: null,
  is_active: true, 
  created_at: '',
  is_free: false, 
  place_type: 'stop',
  hours: [], 
  tags: ['history', 'architecture'],
}

const baseCtx = {
  slot: 'attraction',
  interests: ['history', 'architecture'],
  foodPrefs: [],
  budget: { total: 120, spent: 0, remaining: 120 },
  dayOfWeek: 2,
  timeStr: '10:00',
  maxPriceLevel: 2,
  budgetPersona: 'balanced' as const,
}

describe('scoreCandidate', () => {
  test('score is always between 0 and 1', () => {
    // Very close place
    const scoreNear = scoreCandidate(basPlace, baseCtx, 0.1)
    expect(scoreNear).toBeGreaterThanOrEqual(0)
    expect(scoreNear).toBeLessThanOrEqual(1)

    // Very far place
    const scoreFar = scoreCandidate(basPlace, baseCtx, 10)
    expect(scoreFar).toBeGreaterThanOrEqual(0)
    expect(scoreFar).toBeLessThanOrEqual(1)
  })

  test('closer place scores higher than farther place (same other attributes)', () => {
    const scoreNear = scoreCandidate(basPlace, baseCtx, 0.5)
    const scoreFar  = scoreCandidate(basPlace, baseCtx, 2.5)
    expect(scoreNear).toBeGreaterThan(scoreFar)
  })

  test('interest match affects score more than distance', () => {
    const perfectMatch = scoreCandidate(
      { ...basPlace, tags: ['history', 'architecture'] },
      baseCtx, 2.0
    )
    const noMatch = scoreCandidate(
      { ...basPlace, tags: ['nightlife', 'shopping'] },
      baseCtx, 0.1
    )
    // Perfect interest match 2km away should beat no match 0.1km away
    expect(perfectMatch).toBeGreaterThan(noMatch)
  })

  test('free place scores higher on price than paid place', () => {
    const freePlace = scoreCandidate({ ...basPlace, is_free: true },  baseCtx, 1.0)
    const paidPlace = scoreCandidate({ ...basPlace, is_free: false }, baseCtx, 1.0)
    expect(freePlace).toBeGreaterThan(paidPlace)
  })
})