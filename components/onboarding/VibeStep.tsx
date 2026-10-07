'use client'

import {
  RATING_VALUES,
  REVIEW_VALUES,
  TOURIST_SATURATION_RADIUS,
  type TouristSaturation,
  type Vibe,
} from '@/types/vibe'

import { OnboardingState } from '@/hooks/useOnboarding'
import { Slider } from '../ui/slider'






interface Props {
  state: OnboardingState
  update: (p: Partial<OnboardingState>) => void
}

const SATURATION_OPTIONS: { key: TouristSaturation; label: string }[] = [
  { key: 'crowded', label: 'Crowded' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'quietly', label: 'Quiet' },
]

export function VibeStep({ state, update }: Props) {
  const vibe: Vibe = state.placeVibe

  function updateVibe(patch: Partial<Vibe>) {
    update({ placeVibe: { ...vibe, ...patch } })
  }

  // Rule 1 — rating slider operates on indices into RATING_VALUES.
  const ratingIndices = vibe.rating.map((v) => RATING_VALUES.indexOf(v as any))
  function handleRatingChange(value: number | readonly number[]) {
    const indices = Array.isArray(value) ? value : [value as number]
    updateVibe({ rating: indices.map((i) => RATING_VALUES[i]) })
  }

  // Rule 2 — same index-mapping pattern for reviews.
  const reviewIndices = vibe.reviews.map((v) => REVIEW_VALUES.indexOf(v as any))
  function handleReviewChange(value: number | readonly number[]) {
    const indices = Array.isArray(value) ? value : [value as number]
    updateVibe({ reviews: indices.map((i) => REVIEW_VALUES[i]) })
  }

  // Rule 3 — derived, not stored: which saturation button is "active" is
  // whichever option's radius bounds match the current vibe.radius array.
  const activeSaturation = SATURATION_OPTIONS.find(
    ({ key }) =>
      JSON.stringify(TOURIST_SATURATION_RADIUS[key]) === JSON.stringify(vibe.radius)
  )?.key

  function selectSaturation(key: TouristSaturation) {
    updateVibe({ radius: TOURIST_SATURATION_RADIUS[key] })
  }
  console.log(Slider);

  return (
    <div className="vibe-step">
      <h2 className="step__question">
        What's the vibe<br />you're after?
      </h2>
      <p className="step__hint">
        Fine-tune how crowded, how rated, and how far from the icons you want to go.
      </p>

      <div className="vibe-step__section">
        <label className="vibe-step__label">
          Rating: {vibe.rating[0]} – {vibe.rating[1] === 5 ? '5.0' : vibe.rating[1]}
        </label>
        <Slider
          min={0}
          max={RATING_VALUES.length - 1}
          step={1}
          minStepsBetweenValues={1}
          value={ratingIndices}
          onValueChange={handleRatingChange}
        />
      </div>
    

      <div className="vibe-step__section">
        <label className="vibe-step__label">
          Reviews: {vibe.reviews[0]} – {vibe.reviews[1] === 5001 ? '5000+' : vibe.reviews[1]}
        </label>
        <Slider
        defaultValue={[2]}
          min={0}
          max={REVIEW_VALUES.length - 1}
          step={1}
          minStepsBetweenValues={1}
          value={reviewIndices}
          onValueChange={handleReviewChange}
        />
      </div>
    
  
      <div className="vibe-step__section">
        <label className="vibe-step__label">How close to the icons?</label>
        <div className="vibe-step__pills">
          {SATURATION_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`vibe-step__pill${
                activeSaturation === opt.key ? ' vibe-step__pill--active' : ''
              }`}
              onClick={() => selectSaturation(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}