import { FOOD_CATEGORIES}    from '@/types/userInput'
import "./food-step.css";
import { useState } from 'react'
import { OnboardingState } from '@/hooks/useOnboarding';

interface Props {
  state:          OnboardingState
  toggleFoodPref: (key: string) => void
  toggleCuisinePref: (key: string) => void
}

export function FoodStep({ state, toggleFoodPref, toggleCuisinePref }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggleExpand(key: string) {
    setExpanded(prev => prev === key ? null : key)
  }

  return (
    <div>
      <h2 className="step__question">
        Any food<br />preferences?
      </h2>
      <p className="step__hint">
        Optional — pick a cuisine style. Tap to see more options.
      </p>

      <div className="food__list">
        {FOOD_CATEGORIES.map(category => {
          const isActive   = state.foodPrefs.includes(category.key)
          const isExpanded = expanded === category.key
          const hasChildren = category.subcategories?.length

          // Check if any subcategory is selected
          const subSelected = category.subcategories?.filter(
            s => state.cuisinePrefs.includes(s.key)
          ) ?? []

          return (
            <div key={category.key} className="food__category">
              {/* Parent row */}
              <div className="food__category-row">
                <button
                  className={`food__btn ${isActive ? 'food__btn--active' : ''}`}
                  onClick={() => toggleFoodPref(category.key)}
                >
                  <span className="food__btn-emoji">{category.emoji}</span>
                  <span className="food__btn-label">{category.label}</span>
                  {subSelected.length > 0 && (
                    <span className="food__btn-badge">{subSelected.length}</span>
                  )}
                </button>

                {hasChildren && (
                  <button
                    className={`food__expand ${isExpanded ? 'food__expand--open' : ''}`}
                    onClick={() => toggleExpand(category.key)}
                    aria-label={`Expand ${category.label}`}
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {isExpanded && category.subcategories && (
                <div className="food__subcategories">
                  {category.subcategories.map(sub => {
                    const subActive = state.cuisinePrefs.includes(sub.key)
                    return (
                      <button
                        key={sub.key}
                        className={`food__sub-btn ${subActive ? 'food__sub-btn--active' : ''}`}
                        onClick={() => toggleCuisinePref(sub.key)}
                      >
                        <span>{sub.emoji}</span>
                        <span>{sub.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

}