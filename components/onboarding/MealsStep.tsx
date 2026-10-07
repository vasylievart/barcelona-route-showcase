import { OnboardingState } from '@/hooks/useOnboarding'
import { toMeal, type MealLocation } from '@/types/meal'
import './meals-step.css'

interface Props {
  state: OnboardingState
  update: (p: Partial<OnboardingState>) => void
}

type MealKey = 'includeBreakfast' | 'includeLunch' | 'includeDinner' | 'includeCoffee'

const MEALS: { key: MealKey; label: string }[] = [
  { key: 'includeBreakfast', label: 'Breakfast' },
  { key: 'includeLunch', label: 'Lunch' },
  { key: 'includeDinner', label: 'Dinner' },
  { key: 'includeCoffee', label: 'Coffee' },
]

// Non-goal: breakfast is NOT defaulted to hotel_included/apartment even
// though it's the common case — not every accommodation includes it, and
// not everyone wants to self-cater. All four meals default to 'outside'
// (see INITIAL in useOnboarding.ts).

const SECONDARY_OPTIONS: { value: MealLocation; label: string }[] = [
  { value: 'hotel_included', label: 'Hotel Included' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'fast_food', label: 'Fast Food' },
]

export function MealsStep({ state, update }: Props) {
  const setMealLocation = (key: MealKey, location: MealLocation) => {
    update({ [key]: toMeal(location) } as Partial<OnboardingState>)
  }

  return (
    <div>
      <h2 className="step__question">
        How would you like<br />to eat?
      </h2>
      <p className="step__hint">
        We&apos;ll only recommend restaurants for meals you want us to plan.
      </p>

      <div className="meals__list">
        {MEALS.map(({ key, label }) => {
          const mealIn = state[key].mealIn

          return (
            <div key={key} className="meals__row">
              <span className="meals__row-label">{label}</span>

              <div className="meals__row-options">
                <button
                  type="button"
                  className={`meals__pill meals__pill--primary${
                    mealIn === 'outside' ? ' meals__pill--active' : ''
                  }`}
                  onClick={() => setMealLocation(key, 'outside')}
                >
                  Recommend a place
                </button>

                {SECONDARY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`meals__pill${
                      mealIn === opt.value ? ' meals__pill--active' : ''
                    }`}
                    onClick={() => setMealLocation(key, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}