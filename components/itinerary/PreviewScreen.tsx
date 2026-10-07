import type { FullItinerary } from '@/types/itinerary'
import { CheckoutButton } from '../payment/CheckoutButton'
import { EmptyRoute } from '../ui/EmptyRoute'
import { Timeline } from './Timeline'

const FREE_COUNT = 3

interface PreviewScreenProps {
  result: { tripId: string; itinerary: FullItinerary }
}

export function PreviewScreen({ result }: PreviewScreenProps) {
  const day = result.itinerary?.days?.[0]
  if (!day) return null

  const steps = day.steps ?? []
  if (steps.length === 0) {
    return (
      <div className="preview">
        <EmptyRoute />
      </div>
    )
  }

  const lockedCount = Math.max(0, steps.length - FREE_COUNT)

  return (
    <div className="preview">
      <div className="preview__header">
        <h1 className="preview__title">Your Barcelona day</h1>
        <p className="preview__subtitle">
          {steps.length} stops · €{Math.round(day.totalEstimatedCost)} estimated
        </p>
      </div>

      <div className="preview__timeline-wrap">
        <Timeline steps={steps} locked={lockedCount > 0} freeCount={FREE_COUNT} />
      </div>

      {lockedCount > 0 && (
        <div className="preview__paywall">
          <h3 className="preview__paywall-title">
            Unlock your full {steps.length}-stop route
          </h3>
          <ul className="preview__paywall-perks">
            <li>✓ All {lockedCount} remaining stops revealed</li>
            <li>✓ Walking directions between each stop</li>
            <li>✓ Insider tips at every location</li>
            <li>✓ Works offline — no roaming needed</li>
          </ul>

          <CheckoutButton
            tripId={result.tripId}
            tripDays={result.itinerary?.days?.length ?? 1}
          />
          <p className="preview__paywall-note">Apple Pay & Google Pay accepted</p>
        </div>
      )}
    </div>
  )
}