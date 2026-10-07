import { INTEREST_OPTIONS } from '@/types/userInput'
import "./interests-step.css"
import { OnboardingState } from '@/hooks/useOnboarding'

interface Props {
  state:          OnboardingState
  toggleInterest: (key: string) => void
}

export function InterestsStep({ state, toggleInterest }: Props) {
  return (
    <div>
      <h2 className="step__question">
        What do you<br />love most?
      </h2>
      <p className="step__hint">
        Pick up to 3. Your route will prioritise these experiences.
      </p>
      <div className="interests__grid">
        {INTEREST_OPTIONS.map(opt => {
          const isActive   = state.interests.includes(opt.key)
          const isDisabled = !isActive && state.interests.length >= 3
          return (
            <button
              key={opt.key}
              className={[
                'interest__card',
                isActive   ? 'interest__card--active'   : '',
                isDisabled ? 'interest__card--disabled' : '',
              ].join(' ')}
              onClick={() => !isDisabled && toggleInterest(opt.key)}
              disabled={isDisabled}
            >
              <span className="interest__emoji">{opt.emoji}</span>
              <span className="interest__label">{opt.label}</span>
            </button>
          )
        })}
      </div>
      <p className="step__hint" style={{ marginTop: '1rem' }}>
        {state.interests.length}/3 selected
      </p>
    </div>
  )
}