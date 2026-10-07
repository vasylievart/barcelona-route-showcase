export interface GuideStop {
  name:              string
  latitude:          number
  longitude:         number
  description:       string
  local_tip?:        string
  image_url?:        string
  duration_minutes?: number
  place_id?:         string
}

export type GuideCategory =
  | 'history' | 'food' | 'architecture'
  | 'art'     | 'nightlife' | 'nature' | 'shopping'

export type GuideDifficulty = 'easy' | 'moderate' | 'challenging'

export interface Guide {
  id:               string
  city_id:          string | null
  name:             string
  slug:             string
  description:      string | null
  cover_image:      string | null
  category:         GuideCategory | null
  district:         string | null
  duration_minutes: number | null
  difficulty:       GuideDifficulty
  is_free:          boolean
  published:        boolean
  route:            GuideStop[]
  created_at:       string
  updated_at:       string
}

export type GuidePreview = Pick<Guide,
  'id' | 'slug' | 'name' | 'description' | 'cover_image' |
  'category' | 'district' | 'duration_minutes' | 'difficulty' |
  'is_free' | 'route'>
