import { SLOT_DEFINITIONS, SlotType }                     from '@/constants/schedule'
import { ALGORITHM, CATEGORY_COGNITIVE_WEIGHT }           from '@/constants/algorithm'
import { UserInput }                                      from '@/types/userInput'
import { ItineraryStep, DayItinerary }                    from '@/types/itinerary'
import { Guide }                                          from '@/types/guide'
import { Agenda }                                         from '@/types/agenda'
import { haversineDistance, Coords }                      from './haversine'
import { filterCandidates, scoreCandidate,
         PlaceWithContext, FilterContext }                from './filterCandidates'
import { createBudget, spendFromBudget, canAfford,
         BudgetState }                                    from './budgetTracker'
import { isOpenAt }                                       from './openingHoursCheck'
import { isCompanion }                                    from './isCompanion'
import { buildHumanDescription }                          from './descriptionBuilder'
import { findAlternatives }                                from './contingency'

// ── Time helpers ───────────────────────────────────────────────────────────

function timeToMins(t: string): number {
  const clean = t.includes(':00:00') ? t.replace(':00:00', '') : t
  const [h, m] = clean.split(':').map(Number)
  return h * 60 + (m || 0)
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function parsedCoords(place: PlaceWithContext): Coords {
  return {
    lat: parseFloat(String(place.latitude)),
    lng: parseFloat(String(place.longitude)),
  }
}

// ── Spend formula ──────────────────────────────────────────────────────────


function calcSpend(avgSpend: number, input: UserInput): number {
  const { adults, teens, children } = input
  return avgSpend * (adults + teens) + avgSpend * 0.6 * children
}

// ── Description helper ────────────────────────────────────────────────────


function buildStepDescription(
  slot: string,
  place: PlaceWithContext,
  walkingMins: number,
  timeStr: string
): string {
  return place.historical_desc ?? buildHumanDescription(slot as SlotType, place, walkingMins, timeStr)
}

// ── Filler finder (unchanged from the previous version) ──────────────────

function findFillersBetween(
  from:          Coords,
  to:            Coords,
  allPlaces:     PlaceWithContext[],
  usedIds:       Set<string>,
  availableMins: number
): PlaceWithContext[] {
  const routeLength = haversineDistance(from, to)
  if (routeLength < 0.3)    return []
  if (availableMins < 20)   return []

  return allPlaces
    .filter(p => {
      if (usedIds.has(p.id))         return false
      if (p.place_type !== 'filler') return false

      const pCoords  = parsedCoords(p)
      const fromDist = haversineDistance(from, pCoords)
      const toDist   = haversineDistance(pCoords, to)
      const detour   = (fromDist + toDist) / (routeLength + 0.001)

      if (detour > 1.4)                      return false
      if (fromDist < 0.05 || toDist < 0.05)  return false

      const duration = p.avg_visit_duration ?? 15
      if (duration > availableMins - 5)      return false

      return true
    })
    .sort((a, b) => {
      const score = (p: PlaceWithContext) =>
        (p.historical_desc ? 2 : 0) + (p.tags.includes('history') ? 1 : 0)
      return score(b) - score(a)
    })
    .slice(0, 2)
}

// ── Golden anchor lookup ──────────────────────────────────────────────────

function getAnchorsForDay(input: UserInput, dayNumber: number): PlaceWithContext[] {
  const anchorDay = input.goldenAnchor.find(a => a.day === dayNumber)
  const anchors = anchorDay?.anchor ?? []
  return anchors.map(a => a as unknown as PlaceWithContext)
}

// ── Coffee slot tags ───────────────────────────────────────────────────────

const COFFEE_TAGS = ['coffee', 'ice-cream', 'churros', 'pastry', 'bakery']

// ── Agenda matching ────────────────────────────────────────────────────────

function getMatchingAgendaEvent(
  allAgenda: Agenda[],
  input:     UserInput,
  dayDate:   Date,
  budget:    BudgetState,
  usedIds:   Set<string>
): Agenda | null {
  const dayStr = dayDate.toISOString().slice(0, 10) // 'yyyy-mm-dd'

  const matches = allAgenda.filter(ev => {
    if (usedIds.has(ev.id))                          return false
    if (dayStr < ev.start_at || dayStr > ev.expired)  return false
    const tagOverlap = ev.tag.some(t => input.interests.includes(t))
    if (!tagOverlap)                                   return false
    const spend = calcSpend(ev.price, input)
    if (!canAfford(budget, spend))                     return false
    return true
  })

  if (matches.length === 0) return null
  // Cheapest-first among matches — a simple, defensible tiebreak; revisit
  return matches.sort((a, b) => a.price - b.price)[0]
}

// ── Guide matching ─────────────────────────────────────────────────────────

function getMatchingGuides(allGuides: Guide[], input: UserInput): Guide[] {
  return allGuides.filter(
    g => g.published && g.category !== null && input.interests.includes(g.category)
  )
}

// ── Day-window resolution ─────────────────────────────────────────────────

function resolveDayWindow(
  input:     UserInput,
  dayNumber: number
): { slots: typeof SLOT_DEFINITIONS; startMins: number }  {
  const isFirstDay = dayNumber === 1
  const isLastDay  = dayNumber === input.tripDays
  const td = input.travelDates

  if (isFirstDay && td) {
    //if (td.hasNoArrivalItinerary) return null
    if (td.isEveningSuggestion) {
      const arrivalMins = td.effectiveArrival.getUTCHours() * 60 + td.effectiveArrival.getUTCMinutes()
      // Evening-only: dinner slot onward, starting from actual arrival time.
      const eveningSlots = SLOT_DEFINITIONS.filter(s => s.slot === 'dinner' || s.slot === 'event')
      return { slots: eveningSlots, startMins: arrivalMins }
    }
  }

  if (isLastDay && td) {
    //if (td.hasNoDepartureItinerary) return null
    if (td.isMorningSuggestion) {
      // Morning-only: breakfast + first attraction, stop before lunch.
      const morningSlots = SLOT_DEFINITIONS.filter(
        s => s.slot === 'breakfast' || (s.slot === 'attraction' && timeToMins(s.maxStartTime) < timeToMins('12:30'))
      )
      return { slots: morningSlots, startMins: 8 * 60 }
    }
  }

  return { slots: SLOT_DEFINITIONS, startMins: 8 * 60 }
}

// ── Main builder ───────────────────────────────────────────────────────────

const FOOD_SLOTS = new Set(['breakfast', 'lunch', 'dinner', 'coffee'])

export function buildDaySchedule(
  allPlaces:     PlaceWithContext[],
  allGuides:     Guide[],
  allAgenda:     Agenda[],
  input:         UserInput,
  dayNumber:     number,
  globalUsedIds: Set<string>
): DayItinerary | null {

  const { slots: activeSlots, startMins: dayStartMins } = resolveDayWindow(input, dayNumber)

  const steps: ItineraryStep[] = []
  const usedIds = globalUsedIds // shared reference — mutates across days

  let current: Coords = {
    lat: input.accommodationLat,
    lng: input.accommodationLng,
  }

  // Real calendar date for this day, for agenda date-matching.
  const dayDate = input.travelDates
    ? new Date(input.travelDates.effectiveArrival.getTime() + (dayNumber - 1) * 86_400_000)
    : new Date()
  const dayOfWeek = dayDate.getDay()

  const maxPriceLevel =
    input.budgetPersona === 'budget'  ? 1 :
    input.budgetPersona === 'premium' ? 3 : 2

  let budget = createBudget(input.budget)


  const anchors = getAnchorsForDay(input, dayNumber)
  let primaryDistrict: string | null = anchors[0]?.district ?? null
  let previousCognitiveWeight: 'low' | 'medium' | 'high' | null = null
  let currentTimeMins = dayStartMins

  for (const anchorPlace of anchors) {
    if (usedIds.has(anchorPlace.id)) continue // guard: don't double-place

    const anchorCoords  = parsedCoords(anchorPlace)
    const distKm        = haversineDistance(current, anchorCoords)
    const walkingMins   = Math.max(1, Math.round(distKm * 12))
    const visitDuration = anchorPlace.avg_visit_duration ?? 90
    const spend          = calcSpend(parseFloat(String(anchorPlace.avg_spend ?? 0)), input)
    const timeStr        = minsToTime(currentTimeMins)

    // Alternatives among this day's own picked-but-unused anchors, if
    // they're companions of this one — not findAlternatives(), since the
    // user already deliberately chose this place.
    const companionAlt = anchors.find(
      a => a.id !== anchorPlace.id && !usedIds.has(a.id) && isCompanion(anchorPlace as any, a as any)
    )

    steps.push({
      time:            timeStr,
      place:           anchorPlace,
      type:            'attraction',
      walkingMinutes:  walkingMins,
      estimatedSpend:  spend,
      description:     buildStepDescription('attraction', anchorPlace, walkingMins, timeStr),
      requiresBooking: anchorPlace.requires_booking,
      bookingUrl:      anchorPlace.booking_url,
      isGoldenAnchor:  true,
      swapOptions:     [], // deliberately empty — user-picked, not a scored candidate
      alternatives: {
        rain:    companionAlt && !companionAlt.is_outdoor ? companionAlt : null,
        fatigue: companionAlt && CATEGORY_COGNITIVE_WEIGHT[companionAlt.category_id] !== 'high' ? companionAlt : null,
      },
    })

    usedIds.add(anchorPlace.id)
    budget = spendFromBudget(budget, spend)
    current = anchorCoords
    currentTimeMins += walkingMins + visitDuration
    previousCognitiveWeight = 'high'
  }

  // How many 'attraction' slots the pre-placed anchors already consumed —
  // skip that many attraction slots in the main loop below, so anchors
  // occupy attraction "budget" rather than adding extra stops on top of
  // the template's usual count.
  let attractionSlotsToSkip = anchors.length
  let agendaPlacedThisDay = false

  // ── Single unified slot loop ───────────────────────────────────────────

  for (const slotDef of activeSlots) {

    const minStart = timeToMins(slotDef.minStartTime)
    const maxStart = timeToMins(slotDef.maxStartTime)

    if (currentTimeMins > maxStart) continue
    if (currentTimeMins < minStart) currentTimeMins = minStart

    const timeStr = minsToTime(currentTimeMins)

    // Skip attraction slots already covered by the anchor pre-pass.
    if (slotDef.slot === 'attraction' && attractionSlotsToSkip > 0) {
      attractionSlotsToSkip--
      continue
    }

    // ── Meal slot gating (breakfast / lunch / dinner / coffee) ──────────
    if (FOOD_SLOTS.has(slotDef.slot)) {
      const mealField =
        slotDef.slot === 'breakfast' ? input.includeBreakfast :
        slotDef.slot === 'lunch'     ? input.includeLunch :
        slotDef.slot === 'dinner'    ? input.includeDinner :
        input.includeCoffee

      if (!mealField.isMeal) continue // skip this slot entirely — any
      // non-'outside' mealIn value (hotel_included/apartment/fast_food)
      // means "don't schedule this"
    }


    // ── Candidate filtering ───────────────────────────────────────────────
    const slotCandidates = allPlaces.filter(p => {
      if (usedIds.has(p.id))              return false
      if (!p.tags.includes(slotDef.slot)) return false

      if (slotDef.slot === 'coffee') {
        if (!p.tags.some(t => COFFEE_TAGS.includes(t))) return false
      }

      if (slotDef.slot === 'attraction') {
        const userTags = [...input.interests, ...input.foodPrefs]
        if (userTags.length > 0 && !p.tags.some(t => userTags.includes(t))) return false
      }

      if (slotDef.slot === 'lunch' || slotDef.slot === 'dinner') {
        const foodTags = [...input.foodPrefs, ...input.cuisinePrefs]
        if (foodTags.length > 0 && !p.tags.some(t => foodTags.includes(t))) return false
      }

      if (!isOpenAt(p.hours, dayOfWeek, timeStr)) return false

      // Rating / reviews bounds from VibeStep — applied to raw fields
      // here; swap for a Bayesian-adjusted comparison once that scoring
      // is wired in per subdistrict tier (still an open item).
      // Places with no rating/review data yet can't be meaningfully
      // compared against a range — excluded, not defaulted to 0.
      if (p.rating === null || p.reviews_count === null) return false
      const [minRating, maxRating] = input.placeVibe.rating
      const [minReviews, maxReviews] = input.placeVibe.reviews
      if (p.rating < minRating || p.rating > maxRating)          return false
      if (p.reviews_count < minReviews || p.reviews_count > maxReviews) return false

      return true
    })

    if (slotCandidates.length === 0) continue

    const filterCtx: FilterContext = {
      slot:                   slotDef.slot,
      interests:              input.interests,
      foodPrefs:              input.foodPrefs,
      cuisinePrefs:           input.cuisinePrefs,
      budget,
      dayOfWeek,
      timeStr,
      maxPriceLevel,
      budgetPersona:          input.budgetPersona,
      previousCognitiveWeight,
      primaryDistrict,
    }

    const filtered = filterCandidates(slotCandidates, filterCtx)
    if (filtered.length === 0) continue

    // Radius from placeVibe, measured from the day's primary anchor if
    // one exists, otherwise from the current position.
    const searchRadiusKm = input.placeVibe.radius[1]
      ? input.placeVibe.radius[1] / 1000
      : (FOOD_SLOTS.has(slotDef.slot) ? ALGORITHM.FOOD_SEARCH_RADIUS_KM : ALGORITHM.MAX_WALKING_KM * 4)

    const withCoords = filtered.map(p => ({
      ...p,
      roughDistanceKm: haversineDistance(current, parsedCoords(p)),
    }))

    const nearby = withCoords
      .filter(p => p.roughDistanceKm <= searchRadiusKm)
      .sort((a, b) => a.roughDistanceKm - b.roughDistanceKm)
      .slice(0, 10)

    const pool = nearby.length > 0 ? nearby : withCoords.slice(0, 5)
    if (pool.length === 0) continue

    // ── Iconic-first preference for attraction slots ─────────────────────
    const scoredPool = pool
      .map(p => ({
        place:  p,
        distKm: p.roughDistanceKm,
        score:  scoreCandidate(p, filterCtx, p.roughDistanceKm) +
                (slotDef.slot === 'attraction' && p.place_value === 'iconic' ? 5 : 0),
      }))
      .sort((a, b) => b.score - a.score)

    // Budget check before committing — skip to next-best scored candidate
    // if the top pick would exceed remaining budget.
    let chosenIdx = 0
    while (
      chosenIdx < scoredPool.length &&
      !canAfford(budget, calcSpend(parseFloat(String(scoredPool[chosenIdx].place.avg_spend ?? slotDef.defaultSpend ?? 0)), input))
    ) {
      chosenIdx++
    }
    if (chosenIdx >= scoredPool.length) continue // nothing affordable — skip slot

    const { place: best, distKm } = scoredPool[chosenIdx]
    const bestCoords    = parsedCoords(best)
    const walkingMins   = Math.max(1, Math.round(distKm * 12))
    const visitDuration = best.avg_visit_duration ?? 30
    const spend         = calcSpend(
      Math.max(0, parseFloat(String(best.avg_spend ?? slotDef.defaultSpend ?? 0))),
      input
    )

    previousCognitiveWeight = CATEGORY_COGNITIVE_WEIGHT[best.category_id] ?? 'medium'

    const swapCandidates = scoredPool
      .filter((_, i) => i !== chosenIdx)
      .slice(0, 5)
      .map(c => ({
        place:  c.place,
        reason: c.place.place_value === 'iconic' ? 'Also popular nearby' : 'Similar match nearby',
        distKm: c.distKm,
      }))
    
    console.log('buildDaySchedule step', dayNumber, slotDef.slot, timeStr, best.name, spend, walkingMins, visitDuration, swapCandidates.map(s => s.place.name))

    steps.push({
      time:            timeStr,
      place:           best,
      type:            slotDef.slot,
      walkingMinutes:  walkingMins,
      estimatedSpend:  spend,
      description:     buildStepDescription(slotDef.slot, best, walkingMins, timeStr),
      requiresBooking: best.requires_booking,
      bookingUrl:      best.booking_url,
      isGoldenAnchor:  false,
      swapOptions:     swapCandidates,
      // Restored to call the existing findAlternatives() against the FULL
      // allPlaces array, same as the pre-rewrite version — not the
      // narrow, already-filtered `filtered` pool. Food slots still get
      // no alternatives (low cognitive weight, always indoors).
      alternatives: FOOD_SLOTS.has(slotDef.slot)
        ? { rain: null, fatigue: null }
        : findAlternatives(best, allPlaces, usedIds),
    })

    usedIds.add(best.id)
    budget = spendFromBudget(budget, spend)
    const prevCurrent = current
    current = bestCoords
    currentTimeMins += walkingMins + visitDuration

    // ── Filler stops between this stop and the next slot ────────────────
    const nextSlotIdx = activeSlots.indexOf(slotDef) + 1
    if (nextSlotIdx < activeSlots.length) {
      const nextMin       = timeToMins(activeSlots[nextSlotIdx].minStartTime)
      const availableMins = nextMin - currentTimeMins
      const fillers        = findFillersBetween(prevCurrent, bestCoords, allPlaces, usedIds, availableMins)

      for (const filler of fillers) {
        const fc        = parsedCoords(filler)
        const fWalkMins = Math.max(1, Math.round(haversineDistance(current, fc) * 12))
        const fDuration = filler.avg_visit_duration ?? 10
        if (currentTimeMins + fWalkMins + fDuration > nextMin - 10) break

        usedIds.add(filler.id)
        steps.push({
          time:            minsToTime(currentTimeMins + fWalkMins),
          place:           filler,
          type:            'walkby',
          walkingMinutes:  fWalkMins,
          estimatedSpend:  0,
          description:     filler.historical_desc ?? `${filler.name} — on your route`,
          requiresBooking: false,
          bookingUrl:      null,
          isGoldenAnchor:  false,
          swapOptions:     [],
          alternatives:    { rain: null, fatigue: null },
        })

        currentTimeMins += fWalkMins + fDuration
        current = fc
      }
    }

    // ── Agenda: one check, after dinner ──────────────────────────────────
    if (slotDef.slot === 'dinner' && !agendaPlacedThisDay) {
      const event = getMatchingAgendaEvent(allAgenda, input, dayDate, budget, usedIds)
      if (event) {
        const eventCoords = { lat: event.latitude, lng: event.longitude }
        const eDist        = haversineDistance(current, eventCoords)
        const eWalkMins    = Math.max(1, Math.round(eDist * 12))
        const eSpend        = calcSpend(event.price, input)
        const eTimeStr      = minsToTime(currentTimeMins + eWalkMins)

        usedIds.add(event.id)
        budget = spendFromBudget(budget, eSpend)

        steps.push({
          time:            eTimeStr,
          place:           event as any,
          type:            'event',
          walkingMinutes:  eWalkMins,
          estimatedSpend:  eSpend,
          description:     `${event.name} — a local event happening during your stay.`,
          requiresBooking: !!event.booking_url,
          bookingUrl:      event.booking_url,
          isGoldenAnchor:  false,
          swapOptions:     [],
          alternatives:    { rain: null, fatigue: null },
        })
        agendaPlacedThisDay = true
      }
    }
  }

  const totalCost = steps.reduce((sum, s) => sum + s.estimatedSpend, 0)
  const suggestedGuides = getMatchingGuides(allGuides, input)

  return {
    dayNumber,
    steps,
    totalEstimatedCost: totalCost,
    zone: 'Barcelona',
    primaryDistrict,
    suggestedGuides,
  }
}