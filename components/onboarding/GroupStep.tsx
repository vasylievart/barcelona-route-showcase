// components/onboarding/GroupStep.tsx
//
// Implements the GroupStep spec: adults counter gates everything else;
// three independent reveal sections (minors / disability / pets), each
// with its own visibility flag (Rules 3, 8, 10 — these were previously
// sharing one `countVisible`, which was a real bug; now separate).
//
// Checkboxes and the Next button are intentionally NOT given the native
// `disabled` attribute when adults === 0 — a truly disabled control won't
// fire onClick/onCheckedChange, and Rule 2 requires a toast to fire on the
// attempt. Instead they're styled as inactive (via `isActive`) but the
// handlers stay live to catch the attempt and show the toast.

'use client'

import { useState } from 'react'
import { Counter } from '@/components/ui/Counter'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import type { Group } from '@/types/group'
import './group-step.css'

interface GroupStepProps {
  onNext: (data: Group) => void
  onBack?: () => void
}

const NO_ADULTS_MESSAGE = 'There is at least one adult to set children'
const NO_ADULTS_NEXT_MESSAGE = 'There is at least one adult to proceed to the next step'

export function GroupStep({ onNext, onBack }: GroupStepProps) {
  const [adults, setAdults] = useState(0)
  const [teens, setTeens] = useState(0)
  const [children, setChildren] = useState(0)
  const [babies, setBabies] = useState(0)
  const [disabledPeople, setDisabledPeople] = useState(0)
  const [pets, setPets] = useState(0)

  // Rule 3 / 8 / 10 — three independent reveal flags, each gated on adults > 0.
  const [countVisible, setCountVisible] = useState(false)
  const [showDisability, setShowDisability] = useState(false)
  const [showPets, setShowPets] = useState(false)

  // Rule 2
  const isActive = adults > 0

  // Rule 4 / 5 / 6 — derived flags
  const isTeens = teens > 0
  const isChildren = children > 0
  const isBaby = babies > 0

  // Rule 9 / 11 — derived flags
  const isDisability = disabledPeople > 0
  const isPets = pets > 0

  // Rule 7 — disabledPeople is an overlay on the age-bucket counts, not
  // additive, so it's intentionally excluded from this sum. Enforced via
  // the Counter's `max` prop below (disabledPeople <= group).
  const group = adults + teens + children + babies

  const handleMinorsCheckbox = (checked: boolean) => {
    if (!isActive) {
      toast(NO_ADULTS_MESSAGE)
      return
    }
    setCountVisible(checked)
  }

  const handleDisabilityCheckbox = (checked: boolean) => {
    if (!isActive) {
      toast(NO_ADULTS_MESSAGE)
      return
    }
    setShowDisability(checked)
  }

  const handlePetsCheckbox = (checked: boolean) => {
    if (!isActive) {
      toast(NO_ADULTS_MESSAGE)
      return
    }
    setShowPets(checked)
  }

  const handleNext = () => {
    if (!isActive) {
      toast(NO_ADULTS_NEXT_MESSAGE)
      return
    }
    onNext({
      group,
      adults,
      teens,
      isTeens,
      isChildren,
      children,
      isBaby,
      babies,
      isDisability,
      disabledPeople,
      isPets,
      pets,
    })
  }

  return (
    <div className="group-step">
      <h2 className="group-step__title">Who's traveling?</h2>
      <p className="group-step__subtitle">We'll use this to tailor stops and pacing to your group.</p>

      <div className="group-step__section">
        <Counter label="Adults (18+)" value={adults} onChange={setAdults} />
      </div>

      <div className="group-step__section">
        <label className="group-step__checkbox-row">
          <Checkbox
            checked={countVisible}
            onCheckedChange={(checked) => handleMinorsCheckbox(Boolean(checked))}
          />
          Traveling with someone younger than 18 years?
        </label>

        {countVisible && (
          <div className="group-step__sub-counters">
            <Counter label="Teens (13-17)" value={teens} onChange={setTeens} />
            <Counter label="Children (4-12)" value={children} onChange={setChildren} />
            <Counter label="Babies (0-3)" value={babies} onChange={setBabies} />
          </div>
        )}
      </div>

      <div className="group-step__section">
        <label className="group-step__checkbox-row">
          <Checkbox
            checked={showDisability}
            onCheckedChange={(checked) => handleDisabilityCheckbox(Boolean(checked))}
          />
          Is anyone in your group living with a disability?
        </label>

        {showDisability && (
          <div className="group-step__sub-counters">
            <Counter
              label="People with disability"
              value={disabledPeople}
              onChange={setDisabledPeople}
              max={group}
            />
          </div>
        )}
      </div>

      <div className="group-step__section">
        <label className="group-step__checkbox-row">
          <Checkbox
            checked={showPets}
            onCheckedChange={(checked) => handlePetsCheckbox(Boolean(checked))}
          />
          Traveling with any pets?
        </label>

        {showPets && (
          <div className="group-step__sub-counters">
            <Counter label="Pets" value={pets} onChange={setPets} />
          </div>
        )}
      </div>

      <div className="group-step__actions">
        {onBack && (
          <button type="button" className="group-step__back" onClick={onBack}>
            ← Back
          </button>
        )}
        <button
          type="button"
          className={`group-step__next${isActive ? '' : ' group-step__next--inactive'}`}
          onClick={handleNext}
        >
          Continue
        </button>
      </div>
    </div>
  )
}