
import { OnboardingState } from "@/hooks/useOnboarding";
import "./duration-step.css";

interface Props {
  state:  OnboardingState
  update: (p: Partial<OnboardingState>) => void
}

const OPTIONS = [
  { days: 1, label: 'day',  price: '€2.99' },
  { days: 2, label: 'days', price: '€4.99' },
  { days: 3, label: 'days', price: '€4.99' },
  { days: 5, label: 'days', price: '€9.99' },
  { days: 7, label: 'days', price: '€9.99' },
]




export function DurationStep({ state, update }: Props) {
  const fullDays = state.travelDates?.fullDays ?? 0
  const availableOptions = OPTIONS.filter(o => o.days <= fullDays)
  console.log('Are there days avalable?', availableOptions, fullDays);

  return (
    <div>
      <h2 className="step__question">
        How long are you<br />staying in Barcelona?
      </h2>
      <p className="step__hint">
        We&apos;ll build one route per day, starting from your accommodation.
      </p>
      <div className="duration__options">
        {availableOptions.map(opt => (
          <button
            key={opt.days}
            className={`duration__option ${state.tripDays === opt.days ? 'duration__option--active' : ''}`}
            onClick={() => update({ tripDays: opt.days })}
          >
            <span className="duration__option-days">{opt.days}</span>
            <span className="duration__option-label">{opt.label}</span>
            <span className="duration__option-price">{opt.price}</span>
          </button>
        ))}
      </div>
    </div>
  )
}