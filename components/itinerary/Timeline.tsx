'use client'

import "./timeline.css"

interface ItineraryStep {
  time:            string
  type:            string
  place:           { name: string; website?: string; rating?: number; avg_spend?: number }
  walkingMinutes:  number
  estimatedSpend:  number
  description:     string
  requiresBooking: boolean
  bookingUrl:      string | null
}

interface Props {
  steps:   ItineraryStep[]
  locked?: boolean   // true = show blurred steps after free ones
  freeCount?: number // how many steps to show before blur
}

const TYPE_LABELS: Record<string, string> = {
  breakfast:  '☕ Breakfast',
  attraction: '🏛️ Attraction',
  lunch:      '🍽️ Lunch',
  coffee:     '☕ Coffee break',
  dinner:     '🍷 Dinner',
  event:      '🎶 Evening',
  default:    '📍 Stop',
}

const TYPE_COLORS: Record<string, string> = {
  breakfast:  '#E8896A',
  attraction: '#1B2B4B',
  lunch:      '#C4622D',
  coffee:     '#D4A853',
  dinner:     '#2D4270',
  event:      '#2D7D5A',
  default:    '#6B7A94',
}

function WalkIndicator({ minutes }: { minutes: number }) {
  if (minutes <= 0) return null
  return (
    <div className="timeline__walk">
      <div className="timeline__walk-line" />
      <span className="timeline__walk-label">🚶 {minutes} min walk</span>
      <div className="timeline__walk-line" />
    </div>
  )
}

function StepCard({ step, index, blurred = false }: {
  step:    ItineraryStep
  index:   number
  blurred?: boolean
}) {
  const color = TYPE_COLORS[step.type] ?? TYPE_COLORS.default
  const label = TYPE_LABELS[step.type]  ?? TYPE_LABELS.default

  if (blurred) {
    return (
      <div className="timeline__card timeline__card--blurred">
        <div className="timeline__card-number" style={{ background: color }}>
          {index + 1}
        </div>
        <div className="timeline__card-body">
          <div className="timeline__card-time">••:••</div>
          <div className="timeline__card-type" style={{ color }}>
            {label}
          </div>
          <div className="timeline__card-name">Hidden stop</div>
          <div className="timeline__card-desc">Unlock to reveal this stop</div>
        </div>
        <div className="timeline__card-cost">€••</div>
      </div>
    )
  }
  
  return (
    <div className="timeline__card">
      <div className="timeline__card-number" style={{ background: color }}>
        {index + 1}
      </div>
      <div className="timeline__card-body">
        <div className="timeline__card-time">{step.time}</div>
        <div className="timeline__card-type" style={{ color }}>
          {label}
        </div>
        <div className="timeline__card-name">{step.place.name}</div>
        <div className="timeline__card-desc">{step.description}</div>

        {step.requiresBooking && (
          <div className="timeline__card-booking">
            ⚠️ Book in advance
            {step.bookingUrl && (
              <a
                href={step.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="timeline__card-booking-link"
              >
                → Book now
              </a>
            )}
          </div>
        )}

        {step.place.website && (
          <a
            href={step.place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="timeline__card-website"
          >
            Visit website →
          </a>
        )}
      </div>
      <div className="timeline__card-cost">
        {step.estimatedSpend > 0 ? `€${step.estimatedSpend}` : 'Free'}
      </div>
    </div>
  )
}

export function Timeline({ steps, locked = false, freeCount = 3 }: Props) {
  const totalCost = steps.reduce((sum, s) => sum + s.estimatedSpend, 0)



  return (
    <div className="timeline">
      {steps.map((step, i) => {
        const isBlurred = locked && i >= freeCount
        if (step.type === 'walkby') {
          return (
            <div key={i} className="timeline__walkby">
              <div className="timeline__walkby-dot" />
              <div className="timeline__walkby-content">
                <span className="timeline__walkby-label">📍 On your route</span>
                <span className="timeline__walkby-name">{step.place.name}</span>
                {step.description && step.description !== step.place.name && (
                  <span className="timeline__walkby-desc">{step.description}</span>
                )}
              </div>
            </div>
          )
        }
        return (
          <div key={i}>
            {i > 0 && (
              <WalkIndicator minutes={step.walkingMinutes} />
            )}
            <StepCard
              step={step}
              index={i}
              blurred={isBlurred}
            />
          </div>
        )
      })}

      {/* Day total */}
      <div className="timeline__total">
        <span>Estimated total</span>
        <strong>€{Math.round(totalCost)}</strong>
      </div>
    </div>
  )
}