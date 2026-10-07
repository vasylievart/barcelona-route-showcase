// types/travelDates.ts
//
// Output contract for TravelDatesStep, per the spec's §4.
// Add TransportType and these derived fields to types/userInput.ts's
// UserInput interface alongside the existing arrivalDate/arrivalTime/
// departureDate fields — this file is split out for clarity, not meant
// to replace UserInput.

export type TransportType = 'car' | 'train' | 'plane' | 'bus' | 'other'

export interface TravelDates {
  /** Arrival moment at the accommodation, after the transit buffer (Rule 1). */
  effectiveArrival: Date
  /** Departure moment from the accommodation, before the transit buffer (Rule 1). */
  effectiveDeparture: Date
  /** Usable whole days for scheduling — see Rule 3 and the ASSUMPTION noted in useTravelDates.ts. */
  fullDays: number
  /** 0=Sun..6=Sat, one entry per *calendar* day the trip touches (see Rule 4 note). */
  daysOfWeek: number[]
  /** True if day 1 should show an evening-only suggestion instead of a full schedule. */
  isEveningSuggestion: boolean
  /** True if arrival hour is >21: too late in Barcelona for even an evening plan (no dinner availability). No itinerary generated for day 1. */
  hasNoArrivalItinerary: boolean
  /** True if departure hour is 11-19: last day should show a morning-only suggestion instead of a full schedule. */
  isMorningSuggestion: boolean
  /** True if departure hour is <11: no itinerary at all is generated for the last day. */
  hasNoDepartureItinerary: boolean
}

export interface TravelDatesInput {
  arrivalDate: string   // 'yyyy-mm-dd'
  arrivalTime: string   // 'HH:mm'
  departureDate: string // 'yyyy-mm-dd'
  departureTime: string // 'HH:mm'
  transport: TransportType | undefined
}