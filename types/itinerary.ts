import { Guide } from './guide'
import { Place } from './place'

// additional interface fields for itinerary optimization
export interface StepAlternatives {
  rain:    Place | null
  fatigue: Place | null
}

export interface SwapOption {
  place:   Place
  reason:  string   
  distKm:  number
}


export interface ItineraryStep {
  time: string              // '08:30'
  place: Place
  type: string              // 'breakfast' | 'attraction' | etc.
  walkingMinutes: number
  estimatedSpend: number
  description: string       // from template, not OpenAI
  requiresBooking: boolean
  bookingUrl: string | null
  // additional interface fields for itinerary optimization
  isGoldenAnchor: boolean
  swapOptions: SwapOption[]
  alternatives: StepAlternatives
}

export interface DayItinerary {
  dayNumber: number
  steps: ItineraryStep[]
  totalEstimatedCost: number
  zone: string
  // additional interface fields for itinerary optimization
  primaryDistrict: string | null
  suggestedGuides: Guide[]
}

export interface ArrivalEveningSuggestion {
  note: string
  dinnerOptions: SwapOption[]
  eveningWalks: SwapOption[]
}

export interface TripPlan {
  tripId: string
  arrivalEvening?: ArrivalEveningSuggestion
  days: DayItinerary[]
  departureDayIsHalfDay: boolean 
}

export interface FullItinerary {
  id: string
  tripId: string
  days: DayItinerary[]
  isPaid: boolean
  createdAt: string
}

export interface ItineraryPreview {
  freeSteps: ItineraryStep[]   // first 3, shown always
  lockedCount: number           // remaining steps count
  mapPins: { lat: number; lng: number; name: string; type: string }[] // will  be removed from preview or will be redused pins without connect them
  totalStops: number
  estimatedTotalCost: number
}