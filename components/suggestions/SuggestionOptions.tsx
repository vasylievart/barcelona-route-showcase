// components/morning-suggestion/SuggestionOptions.tsx
//
// Client wrapper — owns per-category selection state (reversible: click
// again to clear back to "show all"). Derives visible options per
// category, merges them + nearbyPoints (always shown, never filtered by
// selection) into ONE array that drives both the map pins and the
// StopDialog lookup, built together so the two can't drift out of sync.
//
// DRAFT / known gaps, not solved here:
// - toGuideStopShape() below is a best-guess mapping from Place fields to
//   GuideStop — never confirmed against GuideStop's real interface.
//   `local_tip` has no source anymore (that column was renamed to
//   pet_friendly during the accessibility-flags migration) — left null
//   rather than silently pointing at the wrong field. `image_url` has no
//   known source on Place either — left null.
// - MapView's useEffect re-runs its ENTIRE setup (including map.remove())
//   whenever `pins` changes — so every selection will currently tear
//   down and rebuild the whole map, likely with visible flicker/re-center.
//   Known, not fixed here — would need a MapView.tsx change (update
//   markers in place instead of full remount).
// - MapView doesn't yet render marker color differently per `pin.type` —
//   every pin looks identical regardless of category.

'use client'

import { useMemo, useState } from 'react'
import { MapView } from '@/components/mapbox/MapView'
import type { SwapOption } from '@/types/itinerary'
import type { PlaceWithContext } from '@/algorithms/filterCandidates'
import type { GuideStop } from '@/types/guide'
import './suggestion-options.css'
import { StopDialog } from '../guides/StopDialog'
import { OptionCard } from './OptionCard'

interface Props {
  suggestionType: 'evening' | 'morning'
  optionOne: SwapOption[]
  optionOneTitle: string
  optionTwo: SwapOption[]
  optionTwoTitle: string
  walk: SwapOption[]
  walkTitle: string
  nearbyPoints: PlaceWithContext[]
}

interface DisplayItem {
  place: {
    id: string
    name: string
    latitude: number
    longitude: number
    historical_desc: string | null
    avg_visit_duration: number | null
  }
  type: 'coffee' | 'breakfast' | 'bar'| 'dinner' | 'attraction' | 'nearbyPoint'
}

// See DRAFT note above — best-guess mapping, not confirmed.
function toGuideStopShape(place: DisplayItem['place']): GuideStop {
  return {
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    description: place.historical_desc,
    duration_minutes: place.avg_visit_duration
  } as GuideStop
}

function toggleSelection(current: string | null, id: string): string | null {
  return current === id ? null : id
}

export function SuggestionOptions({
  suggestionType,
  optionOne,
  optionOneTitle,
  optionTwo,
  optionTwoTitle,
  walk,
  walkTitle,
  nearbyPoints,
}: Props) {
  const [selectedOptionOneId, setSelectedOptionOneId] = useState<string | null>(null)
  const [selectedOptionTwoId, setSelectedOptionTwoId] = useState<string | null>(null)
  const [selectedWalkId, setSelectedWalkId] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  
  const visibleOptionOne = selectedOptionOneId 
    ? optionOne.filter((o) => o.place.id === selectedOptionOneId) 
    : optionOne

  const visibleOptionTwo = selectedOptionTwoId 
    ? optionTwo.filter((o) => o.place.id === selectedOptionTwoId) 
    : optionTwo

  const visibleWalk = selectedWalkId
    ? walk.filter((o) => o.place.id === selectedWalkId)
    : walk

  // One combined list — drives both `pins` and the dialog lookup below,
  // built from the same source so their indices can never disagree.
  const displayItems = useMemo<DisplayItem[]>(
    () => [
      ...visibleOptionOne
      .map((o) => (suggestionType === 'morning' 
        ? {place: o.place, type: 'coffee' as const}
        : {place: o.place, type: 'bar' as const})),

      ...visibleOptionTwo
      .map((o) => (suggestionType === 'morning' 
        ? {place: o.place, type: 'breakfast' as const}
        : {place: o.place, type: 'dinner' as const})),

      ...visibleWalk.map((o) => ({ place: o.place, type: 'attraction' as const })),
      // nearbyPoints: always present, unaffected by any selection.
      ...nearbyPoints.map((p) => ({ place: p, type: 'nearbyPoint' as const })),
    ],
    [visibleOptionOne, visibleOptionTwo, visibleWalk, nearbyPoints]
  )

  const pins = displayItems.map((item, i) => ({
    lat: item.place.latitude,
    lng: item.place.longitude,
    name: item.place.name,
    index: i + 1,
    type: item.type,
  }))

  const activeItem = activeIndex !== null ? displayItems[activeIndex - 1] : null

  return (
    <div className="suggestion-options">
      <SuggestionCarousel
        title={optionOneTitle}
        options={optionOne}
        selectedId={selectedOptionOneId}
        onSelect={(id) => setSelectedOptionOneId((prev) => toggleSelection(prev, id))}
      />
      <SuggestionCarousel
        title={optionTwoTitle}
        options={optionTwo}
        selectedId={selectedOptionTwoId}
        onSelect={(id) => setSelectedOptionTwoId((prev) => toggleSelection(prev, id))}
      />
      <SuggestionCarousel
        title={walkTitle}
        options={walk}
        selectedId={selectedWalkId}
        onSelect={(id) => setSelectedWalkId((prev) => toggleSelection(prev, id))}
      />

      <div className="suggestion-options__map">
        <MapView pins={pins} height="360px" onStopDoubleClick={(pinIndex) => setActiveIndex(pinIndex)} />
      </div>

      {activeItem && activeIndex !== null && (
        <StopDialog
          stop={toGuideStopShape(activeItem.place)}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </div>
  )
}

// Presentational carousel — matches GuidesCarousel's header+track layout
// convention, prop-driven instead of self-fetching (same pattern as
// GuideView.tsx defining GuideStopCard locally rather than a new file).
function SuggestionCarousel({
  title,
  options,
  selectedId,
  onSelect,
}: {
  title: string
  options: SwapOption[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (options.length === 0) return null

  return (
    <section className="suggestion-carousel">
      <h2 className="suggestion-carousel__title">{title}</h2>
      <div className="suggestion-carousel__track">
        {options.map((option) => (
          <OptionCard
            key={option.place.id}
            option={option}
            isActive={option.place.id === selectedId}
            onSelect={() => onSelect(option.place.id)}
          />
        ))}
      </div>
    </section>
  )
}