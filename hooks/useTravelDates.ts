import { useMemo } from 'react'
import type { TransportType, TravelDates } from '@/types/travelDates'
import {fromZonedTime} from 'date-fns-tz'

const MS_PER_MINUTE = 60_000
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE

function getTransitMinutes(transport: TransportType): number {
  return transport === 'car' ? 30 : 45
}

function combineDateTime(date: string, time: string, timeZone = 'Europe/Madrid'): Date {
  return fromZonedTime(`${date}T${time}:00`, timeZone)
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function useTravelDates(input: {
  arrivalDate: string
  arrivalTime: string
  departureDate: string
  departureTime: string
  transport: TransportType | undefined
}): TravelDates | null {
  const { arrivalDate, arrivalTime, departureDate, departureTime, transport } = input

  return useMemo(() => {
    if (!arrivalDate || !arrivalTime || !departureDate || !departureTime || !transport) {
      return null
    }

    const transitMs = getTransitMinutes(transport) * MS_PER_MINUTE

    const arrivalDateTime = combineDateTime(arrivalDate, arrivalTime)
    const departureDateTime = combineDateTime(departureDate, departureTime)

    const effectiveArrival = new Date(arrivalDateTime.getTime() + transitMs)
    const effectiveDeparture = new Date(departureDateTime.getTime() - transitMs)

    const arrivalHour = effectiveArrival.getHours()
    const departureHour = effectiveDeparture.getHours()

    //set time limits in hours (for a partial day) to avoid creating an unrealistic itinerary
    //instead, generate a suggestions for the evening or morning
    const isEveningSuggestion = arrivalHour >= 16 && arrivalHour <= 21
    const hasNoArrivalItinerary = arrivalHour > 21
    const hasNoDepartureItinerary = departureHour < 11
    const isMorningSuggestion = departureHour >= 11 && departureHour < 20

    const arrivalDayStart = startOfDay(effectiveArrival)
    const departureDayStart = startOfDay(effectiveDeparture)

    const calendarDaySpan =
      Math.round((departureDayStart.getTime() - arrivalDayStart.getTime()) / MS_PER_DAY) + 1

    let fullDays = calendarDaySpan
    if (isEveningSuggestion || hasNoArrivalItinerary) fullDays -= 1
    if (isMorningSuggestion || hasNoDepartureItinerary) fullDays -= 1
    fullDays = Math.max(0, fullDays)
 
    const daysOfWeek: number[] = []
    for (let i = 0; i < calendarDaySpan; i++) {
      const day = new Date(arrivalDayStart.getTime() + i * MS_PER_DAY)
      daysOfWeek.push(day.getDay())
    }

    return {
      effectiveArrival,
      effectiveDeparture,
      fullDays,
      daysOfWeek,
      isEveningSuggestion,
      hasNoArrivalItinerary,
      isMorningSuggestion,
      hasNoDepartureItinerary,
    }
  }, [arrivalDate, arrivalTime, departureDate, departureTime, transport])
}