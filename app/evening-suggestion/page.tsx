// app/evening-suggestion/page.tsx
//
// DRAFT: reads accommodation coords + effectiveDeparture from query
// params for now — the real integration point (how this page gets a
// trip's actual travelDates/accommodation, likely via tripId) hasn't
// been decided yet. Flagged, not solved, so this is testable today.

import { getAllPlacesWithContext } from '@/database/repositories/placesRepository'
import { SuggestionOptions } from '@/components/suggestions/SuggestionOptions';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEveningSuggestionPlaces } from '@/algorithms/eveningSuggestionFilter';

interface PageProps {
  searchParams: Promise<{ tripId?: string}>
}
export default async function EveningSuggestionPage({ searchParams }: PageProps) {
  const {tripId} = await searchParams
  if (!tripId) notFound()
  
  
  const {data: trip} = await supabaseAdmin
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  if (!trip) notFound()

  const accommodationLat = trip.accommodation_lat 
  const accommodationLng = trip.accommodation_lng
  const effectiveArrival = new Date(trip.arrival)

  const allPlaces = await getAllPlacesWithContext()

  const suggestions = getEveningSuggestionPlaces(
    allPlaces,
    { lat: accommodationLat, lng: accommodationLng },
    effectiveArrival
  )

  return (
    <div className="suggestion">
      <Link href={`/itinerary/${tripId}?fromSuggestion=evening`}>← Back to itinerary</Link>
      <h1 className="step__question">Your personal evening suggestion</h1>
      <p className="suggestion__date">
        {effectiveArrival.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </p>
      <p className="suggestion__intro">
        Hello, I guess you arrives late to Barcelona, and don&apos;t have
        much time to enjoy the city today. So, I have for you my suggestion,
        how to spend this evening.
      </p>

      <SuggestionOptions
        optionOne={suggestions.drinksPlaces}
        optionTwo={suggestions.dinnerPlaces}
        walk={suggestions.eveningWalk}
        nearbyPoints={suggestions.nearbyPoints}
        optionOneTitle={'Take some drinks in one of these bars'}
        optionTwoTitle={'Take a dinner in one of these places'}
        walkTitle={'Do a small evening promenade'} 
        suggestionType={'evening'}
      />
    </div>
  )
}