

'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isCompanion } from '@/algorithms/isCompanion'
import type { GoldenAnchor } from '@/types/goldenAnchor'
import './golden-anchor-step.css'
import { OnboardingState } from '@/hooks/useOnboarding'
import { Place } from '@/types/place'

interface Props {
  state: OnboardingState
  update: (p: Partial<OnboardingState>) => void
}

export function GoldenAnchorStep({ state, update }: Props) {
  const [goldenAnchors, setGoldenAnchors] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false) // FIX 3
  const [currentDay, setCurrentDay] = useState(1)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('places')
      .select('*')
      .eq('place_value', 'golden_anchor')
      .then(({ data, error }) => {
        if (error) {
          console.error('GoldenAnchorStep: failed to load anchors:', error.message)
          setLoadError(true)
        } else {
          setGoldenAnchors((data ?? []) as Place[])
        }
        setLoading(false)
      })
  }, [])

  const dayEntry = state.goldenAnchor?.find((g) => g.day === currentDay)

  const currentDayAnchors = useMemo(() => dayEntry?.anchor ?? [], [dayEntry])

  const anchorsUsedOnOtherDays = useMemo(() => {
    const ids = new Set<string>()
    for (const g of state.goldenAnchor ?? []) {
      if (g.day !== currentDay && g.day <= state.tripDays) {
        for (const a of g.anchor ?? []) ids.add(a.id)
      }
    }
    return ids
  }, [state.goldenAnchor, state.tripDays, currentDay])

  const filteredAnchors = useMemo(() => {
    const base =
      currentDayAnchors.length === 0
        ? goldenAnchors
        : goldenAnchors.filter((a) => isCompanion(currentDayAnchors[0], a))
    return base.filter((a) => !anchorsUsedOnOtherDays.has(a.id))
  }, [goldenAnchors, currentDayAnchors, anchorsUsedOnOtherDays])

  function updateDay(patch: Partial<GoldenAnchor>) {
    const others = (state.goldenAnchor ?? []).filter(
      (g) => g.day !== currentDay && g.day <= state.tripDays
    )
    const merged: GoldenAnchor = { day: currentDay, ...dayEntry, ...patch }
    update({
      goldenAnchor: [...others, merged].sort((a, b) => a.day - b.day),
    })
  }

  function toggleAnchor(place: Place) {
    const isActive = currentDayAnchors.some((p) => p.id === place.id)
    const nextAnchors = isActive
      ? currentDayAnchors.filter((p) => p.id !== place.id)
      : [...currentDayAnchors, place]
    updateDay({ anchor: nextAnchors.length ? nextAnchors : undefined })
  }

  if (loading) {
    return <p className="golden-anchor-step__loading">Loading golden anchors…</p>
  }

  if (loadError) {
    return (
      <p className="golden-anchor-step__error">
        We couldn&apos;t load the landmarks. Please refresh the page and try again.
      </p>
    )
  }

  return (
    <div className="golden-anchor-step">
      <h2 className="step__question">
        Day {currentDay}: what do you<br />want to build around?
      </h2>
      <p className="step__hint">Pick up to two nearby icons</p>

      <div className="golden-anchor-step__grid">
        {filteredAnchors.map((a) => {
          const isActive = currentDayAnchors.some((p) => p.id === a.id)
          const isDisabled = currentDayAnchors.length >= 2 && !isActive

          return (
            <button
              key={a.id}
              type="button"
              className={`golden-anchor-step__card${
                isActive ? ' golden-anchor-step__card--active' : ''
              }`}
              disabled={isDisabled}
              onClick={() => toggleAnchor(a)}
            >
              {a.name}
            </button>
          )
        })}
      </div>

      <div className="golden-anchor-step__nav">
        <button
          type="button"
          className="golden-anchor-step__nav-btn"
          disabled={currentDay <= 1}
          onClick={() => setCurrentDay((d) => d - 1)}
        >
          ← Previous Day
        </button>
        <span className="golden-anchor-step__nav-count">
          {currentDay} / {state.tripDays}
        </span>
        <button
          type="button"
          className="golden-anchor-step__nav-btn"
          disabled={currentDay >= state.tripDays || currentDayAnchors.length === 0}
          onClick={() => setCurrentDay((d) => d + 1)}
        >
          Next Day →
        </button>
      </div>
    </div>
  )
}

