// types/meal.ts — output contract for MealsStep, per spec §4.

export type MealLocation = 'outside' | 'hotel_included' | 'apartment' | 'fast_food'

export interface Meal {
  isMeal: boolean
  mealIn: MealLocation
}

// Rule 2 — isMeal is derived from mealIn, never stored independently.
export function toMeal(mealIn: MealLocation): Meal {
  return { isMeal: mealIn === 'outside', mealIn }
}