// components/morning-suggestion/OptionCard.tsx

import type { SwapOption } from '@/types/itinerary'
import './option-card.css'

interface Props {
  option: SwapOption
  isActive: boolean
  onSelect: () => void
}

export function OptionCard({ option, isActive, onSelect }: Props) {
  const { place, reason, distKm } = option

  return (
    <button
      type="button"
      className={`option-card${isActive ? ' option-card--active' : ''}`}
      onClick={onSelect}
    >
      <div className="option-card__name">{place.name}</div>
      <div className="option-card__reason">{reason}</div>
      <div className="option-card__meta">
        <span className="option-card__dist">{distKm.toFixed(1)} km</span>
        {place.avg_spend !== null && place.avg_spend !== undefined && (
          <span className="option-card__spend">~€{place.avg_spend}</span>
        )}
      </div>
    </button>
  )
}