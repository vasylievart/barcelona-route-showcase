'use client'
import ReactMarkdown        from 'react-markdown'
import remarkGfm            from 'remark-gfm'
import type { Guide, GuideStop } from '@/types/guide'
import { MapView } from '../mapbox/MapView'
import { useState } from 'react'
import { StopDialog } from './StopDialog'

interface Props {
  guide:        Guide
  walkingRoute: [number, number][]
}

export function GuideView({ guide, walkingRoute }: Props) {
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null)

  const activeStop = activeStopIndex !== null
    ? guide.route[activeStopIndex - 1]
    : null

  // Build the pins array MapView expects
  const pins = guide.route.map((stop, i) => ({
    lat:   stop.latitude,
    lng:   stop.longitude,
    name:  stop.name,
    index: i + 1,
    type:  'guide',
  }))

  const stopCount = guide.route.length

  return (
    <div className="guide-view">

      {/* ── Cover image ──────────────────────────────────────────────── */}
      {guide.cover_image && (
        <img
          src={guide.cover_image}
          alt={guide.name}
          className="guide-view__cover"
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="guide-view__header">
        <h1 className="guide-view__title">{guide.name}</h1>

        <div className="guide-view__tags">
          {guide.category && (
            <span className="guide-view__tag">{guide.category}</span>
          )}
          {guide.district && (
            <span className="guide-view__tag">{guide.district}</span>
          )}
          <div className="guide-view__stats">
            {guide.duration_minutes && (
              <span className="guide-view__stat">{guide.duration_minutes} min</span>
            )}
            <span className="guide-view__stat">{stopCount} stops</span>
            {guide.difficulty && (
              <span className="guide-view__stat">{guide.difficulty}</span>
            )}
            {guide.is_free && (
              <span className="guide-view__stat">Free</span>
            )}
          </div>
        </div>

        {/* Description — rendered as markdown */}
        {guide.description && (
          <div className="guide-view__desc markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {guide.description}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* ── Mapbox map ───────────────────────────────────────────────── */}
      <div className="guide-view__map">
        <MapView
          pins={pins}
          routeCoords={walkingRoute}
          height = "300px"
          onNearStop={(index, name) => {
            console.log(`You have arrived at stop ${index}: ${name}`)
          }}
          onStopDoubleClick={(pinIndex) => setActiveStopIndex(pinIndex)}
        />
      </div>
      {activeStop && activeStopIndex !== null && (
        <StopDialog 
        stop={activeStop} index={activeStopIndex} onClose={() => setActiveStopIndex(null)}/>
      )}

      {/* ── Stop list header ─────────────────────────────────────────── */}
      <div className="guide-view__stops-header">
        <span className="guide-view__stops-count">
          {stopCount} stop{stopCount !== 1 ? 's' : ''} on this route
        </span>
        {/* Deep link opens all stops in Google Maps as waypoints */}
        <a
          href={buildGoogleMapsUrl(guide.route)}
          target="_blank"
          rel="noopener noreferrer"
          className="guide-view__stops-link"
          >
          Open in Google Maps →
        </a>
      </div>

      {/* ── Stop list ────────────────────────────────────────────────── */}
      <div className="guide-view__stops">
        {guide.route.map((stop, i) => (
          <GuideStopCard
            key={i}
            stop={stop}
            index={i + 1}
            isLast={i === guide.route.length - 1}
          />
        ))}
      </div>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <div className="guide-view__cta">
        <div className="guide-view__cta-title">
          Want a full personalised itinerary for {guide.district ?? 'this area'}?
        </div>
        <p className="guide-view__cta-sub">
          We'll build a timed route starting from your hotel, with restaurant
          recommendations and opening hours checked for your exact dates.
        </p>
        <a href="/plan" className="btn btn--primary">
          Build my itinerary →
        </a>
      </div>

    </div>
  )
}

// ── GuideStopCard ─────────────────────────────────────────────────────────────

function GuideStopCard({
  stop,
  index,
  isLast,
}: {
  stop:   GuideStop
  index:  number
  isLast: boolean
}) {
  return (
    <div className={`guide-stop ${isLast ? 'guide-stop--last' : ''}`}>

      {/* Left: number + connecting line */}
      <div className="guide-stop__connector">
        <div className="guide-stop__num">{index}</div>
        {!isLast && <div className="guide-stop__line" />}
      </div>

      {/* Right: content */}
      <div className="guide-stop__content">

        {/* Optional stop photo */}
        {stop.image_url && (
          <div className="guide-stop__img">
            <img
              src={stop.image_url}
              alt={stop.name}
              loading="lazy"
            />
          </div>
        )}

        <div className="guide-stop__name">{stop.name}</div>

        {/* Description rendered as markdown */}
        {stop.description && (
          <div className="guide-stop__desc markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {stop.description}
            </ReactMarkdown>
          </div>
        )}

        {/* Local tip callout */}
        {stop.local_tip && (
          <div className="guide-stop__tip">
            <span className="guide-stop__tip-label">Local tip</span>
            <span className="guide-stop__tip-text">{stop.local_tip}</span>
          </div>
        )}

        {/* Duration pill */}
        {stop.duration_minutes && (
          <span className="guide-stop__duration">
            ~{stop.duration_minutes} min
          </span>
        )}

      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildGoogleMapsUrl(stops: GuideStop[]): string {
  if (stops.length === 0) return 'https://maps.google.com'

  const origin      = `${stops[0].latitude},${stops[0].longitude}`
  const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`
  const waypoints   = stops
    .slice(1, -1)
    .map(s => `${s.latitude},${s.longitude}`)
    .join('|')

  const base = 'https://www.google.com/maps/dir/?api=1'
  const url  = `${base}&origin=${origin}&destination=${destination}&travelmode=walking`

  return waypoints ? `${url}&waypoints=${waypoints}` : url
}