// types/agenda.ts

export interface Agenda {
  id: string                 // UUID, matching places/guides/posts convention
  city_id: string
  name: string
  price: number
  tag: string[]
  start_at: string           // ISO date — event window opens
  expired: string            // ISO date — event window closes
  start_hours: string        // 'HH:mm'
  latitude: number
  longitude: number
  booking_url: string | null
  avg_visit_duration: number
  accessible: boolean
  lgbt_friendly: boolean
  child_friendly: boolean
  pet_friendly: boolean
}