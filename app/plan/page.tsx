'use client'

import { DurationStep }   from '@/components/onboarding/DurationStep'
import { LocationStep }   from '@/components/onboarding/LocationStep'

import { FoodStep }       from '@/components/onboarding/FoodStep'
import { BudgetStep }     from '@/components/onboarding/BudgetStep'
import { useRouter }      from 'next/navigation'
import { InterestsStep } from '@/components/onboarding/InerestsStep'
import "./onboarding-shell.css";
import { useOnboarding } from '@/hooks/useOnboarding'
import { TravelDatesStep } from '@/components/onboarding/TravelDatesStep'
import { GroupStep } from '@/components/onboarding/GroupStep'
import { MealsStep } from '@/components/onboarding/MealsStep'
import { GoldenAnchorStep } from '@/components/onboarding/GoldenAnchorStep'
import { VibeStep } from '@/components/onboarding/VibeStep'

export default function PlanPage() {
  const ob     = useOnboarding()
  const router = useRouter()

  const STEPS = [TravelDatesStep, GroupStep, DurationStep, BudgetStep, LocationStep, InterestsStep, MealsStep, FoodStep, GoldenAnchorStep, VibeStep]
  const CurrentStep = STEPS[ob.state.step - 1]

  async function handleFinish() {
    const input = ob.toUserInput()
    if (!input) return
    // Store in sessionStorage and navigate to loading screen
    sessionStorage.setItem('pendingRoute', JSON.stringify(input))
    router.push('/preview')
  }

  return (
    <div className="onboarding">
      {/* Progress bar */}
      <div className="onboarding__progress">
        <div
          className="onboarding__progress-bar"
          style={{ width: `${(ob.state.step / 10) * 100}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="onboarding__meta">
        <button
          className="onboarding__back"
          onClick={ob.state.step > 1 ? ob.prevStep : () => router.push('/')}
          aria-label="Go back"
        >
          ← Back
        </button>
        <span className="onboarding__step-count">{ob.state.step} of 10</span>
      </div>

      {/* Current step */}
      <div className="onboarding__content">
        <CurrentStep
          state={ob.state}
          update={ob.update}
          toggleInterest={ob.toggleInterest}
          toggleFoodPref={ob.toggleFoodPref}
          toggleCuisinePref={ob.toggleCuisinePref}
          onNext={ob.nextStep}
        />
      </div>

      {/* Next button */}
      <div className="onboarding__footer">
        <button
          className="btn btn--primary btn--large onboarding__next"
          disabled={!ob.canProceed}
          onClick={ob.state.step < 10 ? ob.nextStep : handleFinish}
        >
          {ob.state.step < 10 ? 'Continue' : 'Build my route →'}
        </button>
      </div>
    </div>
  )
}