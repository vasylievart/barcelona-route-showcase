// types/vibe.ts — output contract for VibeStep, per spec §4.
// Replaces UserInput's old `placeVibe: string[]` with `placeVibe: Vibe`.

export interface Vibe {
  rating: number[]   // [a, b] from ratingValues, e.g. [4.6, 4.7]
  reviews: number[]  // [a, b] from reviewValues, e.g. [1000, 2500]
  radius: number[]   // from TOURIST_SATURATION_RADIUS, e.g. [300, 500] or [500] for 'quietly'
}

export const RATING_VALUES = [0, 4.5, 4.6, 4.7, 4.8, 4.9, 5] as const
export const REVIEW_VALUES = [0, 100, 500, 1000, 2500, 5000, 5001] as const

export type TouristSaturation = 'crowded' | 'high' | 'medium' | 'quietly'

