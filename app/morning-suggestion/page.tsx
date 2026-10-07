// app/morning-suggestion/page.tsx
//
// DRAFT: reads accommodation coords + effectiveDeparture from query
// params for now — the real integration point (how this page gets a
// trip's actual travelDates/accommodation, likely via tripId) hasn't
// been decided yet. Flagged, not solved, so this is testable today.

import { getAllPlacesWithContext, getInformationalPlaces, getPlacesNearPoint } from '@/database/repositories/placesRepository'
import { getMorningSuggestionPlaces } from '@/algorithms/morningSuggestionFilter'
import { SuggestionOptions } from '@/components/suggestions/SuggestionOptions';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ tripId?: string}>
}
export default async function MorningSuggestionPage({ searchParams }: PageProps) {
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
  const effectiveDeparture = new Date(trip.departure)

  const center = {lat: accommodationLat, lng: accommodationLng}

  const [stops, informational] = await Promise.all([
    getPlacesNearPoint(center, 1),
    getInformationalPlaces(),
  ])

  const suggestions = getMorningSuggestionPlaces(
    [...stops, ...informational],
    center,
    effectiveDeparture
  )

  return (
    <div className="suggestion">
      <Link href={`/itinerary/${tripId}?fromSuggestion=morning`}>← Back to itinerary</Link>
      <h1 className="step__question">Your personal morning suggestion</h1>
      <p className="suggestion__date">
        {effectiveDeparture.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </p>
      <p className="suggestion__intro">
        Hello, I guess you have to leave Barcelona early, and don&apos;t have
        much time to enjoy the city today. So, I have for you my suggestion,
        how to spend this morning.
      </p>

      <SuggestionOptions
        optionOne={suggestions.coffeePlaces}
        optionTwo={suggestions.breakfastPlaces}
        walk={suggestions.morningWalk}
        nearbyPoints={suggestions.nearbyPoints}
        optionOneTitle={'Take a coffee in one of these coffe-shops'}
        optionTwoTitle={'Take a breakfast in one of these cafe'}
        walkTitle={'Do a small morning promenade'} 
        suggestionType={'morning'}    
      />
    </div>
  )
}