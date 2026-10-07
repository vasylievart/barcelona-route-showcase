'use client'

import { useEffect, useState } from 'react'
import { useTravelDates } from '@/hooks/useTravelDates'
import type { TransportType, TravelDates } from '@/types/travelDates'
import './travel-dates-step.css'
import { OnboardingState } from '@/hooks/useOnboarding'

interface TravelDatesStepProps {
  onNext: (data: {
    arrivalDate: string
    arrivalTime: string
    departureDate: string
    departureTime: string
    transport: TransportType
    travelDates: TravelDates
  }) => void
  onBack?: () => void
  update: (p: Partial<OnboardingState>) => void
}

const TRANSPORT_OPTIONS: { value: TransportType; label: string }[] = [
  { value: 'plane', label: '✈️ Plane' },
  { value: 'train', label: '🚆 Train' },
  { value: 'bus', label: '🚌 Bus' },
  { value: 'car', label: '🚗 Car' },
  { value: 'other', label: '📍 Other' },
]

// Below this, there isn't enough usable time for a scheduled itinerary.
// This is a deliberate product decision, not an edge case to "handle" —
// short/same-day visits are pointed at the blog and curated guides instead.
const MIN_FULL_DAYS = 1

export function TravelDatesStep({ onNext, onBack, update }: TravelDatesStepProps) {
  const [arrivalDate, setArrivalDate] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [transport, setTransport] = useState<TransportType | undefined>(undefined)

  

  const travelDates = useTravelDates({
    arrivalDate,
    arrivalTime,
    departureDate,
    departureTime,
    transport,
  })

  useEffect(()=> {
    update({travelDates: travelDates})
  },[travelDates])
 
 
  const isTooShort = Boolean(travelDates && travelDates.fullDays < MIN_FULL_DAYS)

  const isComplete = Boolean(
    arrivalDate &&
      arrivalTime &&
      departureDate &&
      departureTime &&
      transport &&
      travelDates &&
      !isTooShort
  )

  const handleNext = () => {
    if (!isComplete || !travelDates || !transport) return
    onNext({
      arrivalDate,
      arrivalTime,
      departureDate,
      departureTime,
      transport,
      travelDates,
    })
  }

  return (
    <div className="travel-dates-step">
      <h2 className="travel-dates-step__title">When are you traveling?</h2>
      <p className="travel-dates-step__subtitle">
        We'll use this to plan your first evening and last morning too.
      </p>

      <div className="travel-dates-step__group">
        <label className="travel-dates-step__label">Arrival</label>
        <div className="travel-dates-step__row">
          <input
            type="date"
            className="travel-dates-step__input"
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
            aria-label="Arrival date"
          />
          <input
            type="time"
            className="travel-dates-step__input"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            aria-label="Arrival time"
          />
        </div>
      </div>

      <div className="travel-dates-step__group">
        <label className="travel-dates-step__label">Departure</label>
        <div className="travel-dates-step__row">
          <input
            type="date"
            className="travel-dates-step__input"
            value={departureDate}
            min={arrivalDate || undefined}
            onChange={(e) => setDepartureDate(e.target.value)}
            aria-label="Departure date"
          />
          <input
            type="time"
            className="travel-dates-step__input"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            aria-label="Departure time"
          />
        </div>
      </div>

      <div className="travel-dates-step__group">
        <label className="travel-dates-step__label">How are you arriving?</label>
        <div className="travel-dates-step__pills">
          {TRANSPORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`travel-dates-step__pill${
                transport === opt.value ? ' travel-dates-step__pill--active' : ''
              }`}
              onClick={() => setTransport(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isTooShort && (
        <div className="travel-dates-step__notice travel-dates-step__notice--block">
          <p>
            A trip this short doesn't leave enough time for a scheduled itinerary. Have a
            look at our <a href="/blog">blog</a> for tips or one of our{' '}
            <a href="/guides">curated guides</a> instead.
          </p>
        </div>
      )}

      {!isTooShort &&
        travelDates &&
        (travelDates.isEveningSuggestion ||
          travelDates.hasNoArrivalItinerary ||
          travelDates.isMorningSuggestion ||
          travelDates.hasNoDepartureItinerary) && (
          <div className="travel-dates-step__notice">
            {travelDates.hasNoArrivalItinerary && (
              <p>Your arrival is too late for a first-day plan — we won't schedule that day.</p>
            )}
            {!travelDates.hasNoArrivalItinerary && travelDates.isEveningSuggestion && (
              <p>Your first day will be a relaxed evening suggestion, not a full itinerary.</p>
            )}
            {travelDates.hasNoDepartureItinerary && (
              <p>Your departure is too early for a last-day itinerary — we won't plan that day.</p>
            )}
            {!travelDates.hasNoDepartureItinerary && travelDates.isMorningSuggestion && (
              <p>Your last day will be a short morning suggestion, not a full itinerary.</p>
            )}
          </div>
        )}

      <div className="travel-dates-step__actions">
        {onBack && (
          <button type="button" className="travel-dates-step__back" onClick={onBack}>
            ← Back
          </button>
        )}
        <button
          type="button"
          className="travel-dates-step__next"
          disabled={!isComplete}
          onClick={handleNext}
        >
          Continue
        </button>
      </div>
    </div>
  )
}