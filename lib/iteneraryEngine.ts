import { UserInput }              from '@/types/userInput'
import { FullItinerary }          from '@/types/itinerary'
import { Guide }                  from '@/types/guide'
import { Agenda }                 from '@/types/agenda'
import { getAllPlacesWithContext } from '@/database/repositories/placesRepository'
import { buildDaySchedule }       from '@/algorithms/scheduleBuilder'
import { supabaseAdmin } from './supabase/admin'


export async function generateItinerary(
  input: UserInput,
  tripId: string
): Promise<FullItinerary> {

  // 1. Check cache — same tripId = already generated
  const { data: cached } = await supabaseAdmin
    .from('generated_routes')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_number')

  if (cached && cached.length > 0) {
    return {
      id:        cached[0].id,
      tripId,
      days:      cached.map((c: any) => c.route_json),
      isPaid:    false,
      createdAt: cached[0].created_at,
    }
  }

  // 2. Load all active places, guides, and agenda events once —
  // single pass over each, shared across every day of the trip.
  const allPlaces = await getAllPlacesWithContext()
  const { data: guidesData } = await supabaseAdmin.from('guides').select('*')
  const { data: agendaData } = await supabaseAdmin.from('agenda').select('*')
  const allGuides = (guidesData ?? []) as Guide[]
  const allAgenda = (agendaData ?? []) as Agenda[]

  const globalUsedIds = new Set<string>();

  // 3. Build each day
  const days = []

  for (let day = 1; day <= input.tripDays; day++) {
    const dayItinerary = buildDaySchedule(allPlaces, allGuides, allAgenda, input, day, globalUsedIds)

    // Cache the result
    await supabaseAdmin.from('generated_routes').insert({
      trip_id:    tripId,
      day_number: day,
      route_json: dayItinerary,
    })

    days.push(dayItinerary)
  }

  return {
    id:        tripId,
    tripId,
    days,
    isPaid:    false,
    createdAt: new Date().toISOString(),
  }
}