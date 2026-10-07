import { BUDGET_PERSONAS } from '@/types/userInput'
import "./budget-step.css"
import { OnboardingState } from '@/hooks/useOnboarding'

interface Props {
  state:  OnboardingState
  update: (p: Partial<OnboardingState>) => void
}

export function BudgetStep({ state, update }: Props) {
  return (
    <div>
      <h2 className="step__question">
        What&apos;s your<br />travel style?
      </h2>
      <p className="step__hint">
        This shapes which restaurants and experiences we recommend.
      </p>
      <div className="budget__options">
        {BUDGET_PERSONAS.map(persona => (
          <button
            key={persona.key}
            className={`budget__option ${state.budgetPersona === persona.key ? 'budget__option--active' : ''}`}
            onClick={() => update({ budgetPersona: persona.key })}
          >
            <span className="budget__option-emoji">{persona.emoji}</span>
            <div className="budget__option-info">
              <div className="budget__option-label">{persona.label}</div>
              <div className="budget__option-desc">{persona.description}</div>
            </div>
            <div className="budget__option-price">~€{persona.dailyBudget}/day</div>
          </button>
        ))}
      </div>
    </div>
  )
}