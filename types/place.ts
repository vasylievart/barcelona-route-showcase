export interface Place {
  id: string
  name: string
  category_id: number
  latitude: number
  longitude: number
  rating: number | null
  reviews_count: number | null
  price_level: number | null        // 0=free 1=€ 2=€€ 3=€€€ 4=€€€€
  avg_visit_duration: number | null // minutes
  avg_spend: number | null          // euros per person
  website: string | null
  is_free: boolean
  requires_booking: boolean
  booking_url: string | null
  cuisine_type: string | null
  historical_desc: string | null
  is_active: boolean
  created_at: string
  district: string | null
  is_outdoor: boolean
}

export interface PlaceWithScore extends Place {
  roughDistanceKm: number
  score: number
}

export interface Category {
  id: number
  name: string
  slot: string
}

export interface Tag {
  id: number
  name: string
}





