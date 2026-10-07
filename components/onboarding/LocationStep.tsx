'use client'
import { useEffect, useRef, useState } from 'react'
import "./location-step.css"
import { OnboardingState } from '@/hooks/useOnboarding'

interface Props {
  state:  OnboardingState
  update: (p: Partial<OnboardingState>) => void
}

// Barcelona city center — used to bias both the autocomplete widget and
// the manual-entry geocode fallback toward this city specifically,
// rather than 'es' (all of Spain).
const BARCELONA_CENTER = { lat: 41.3874, lng: 2.1686 }
const BARCELONA_BIAS_RADIUS_M = 15_000 // ~15km, covers the whole metro area

let mapsPromise: Promise<void> | null = null

function loadGoogleMapsOnce(apiKey: string): Promise<void> {
  if (mapsPromise) return mapsPromise
  mapsPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).google?.maps?.importLibrary) { resolve(); return }
    ;(window as any).__googleMapsCallback = () => resolve()
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__googleMapsCallback&libraries=places&v=weekly&loading=async`
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
  return mapsPromise
}

async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ', Barcelona, Spain')}&key=${apiKey}`
    const res  = await fetch(url)
    const data = await res.json()
    if (data.status === 'OK' && data.results[0]) {
      const loc = data.results[0].geometry.location
      return { lat: loc.lat, lng: loc.lng }
    }
    return null
  } catch {
    return null
  }
}

export function LocationStep({ state, update }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading,   setLoading]   = useState(true)
  const [useManual, setUseManual] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeFailed, setGeocodeFailed] = useState(false)

  // Ref so event listener always has latest update function
  const updateRef = useRef(update)
  useEffect(() => { updateRef.current = update }, [update])

  useEffect(() => {
    if (useManual) return

    let cancelled = false

    async function init() {
      try {
        setLoading(true)
        await loadGoogleMapsOnce(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!)
        if (cancelled || !containerRef.current) return

        containerRef.current.innerHTML = ''

        // ── Exact pattern from Google docs ──────────────────────────────
        const { PlaceAutocompleteElement } =
          await (window as any).google.maps.importLibrary('places')

        if (cancelled || !containerRef.current) return

        // Bias toward Barcelona specifically, not just Spain — a soft
        // hint, not a hard restriction, so a real result just outside
        // the radius (e.g. a hotel in a bordering town) can still show,
        // just ranked lower than an in-city match.
        const placeAutocomplete = new PlaceAutocompleteElement({})
        placeAutocomplete.includedRegionCodes = ['es']
        placeAutocomplete.locationBias = {
          radius: BARCELONA_BIAS_RADIUS_M,
          center: BARCELONA_CENTER,
        }

        // Append to container
        const card = document.createElement('div')
        card.style.width = '100%'
        card.appendChild(placeAutocomplete)
        containerRef.current.appendChild(card)

        setLoading(false)

        // ── Exact event name from Google docs: 'gmp-select' ─────────────
        // @ts-ignore
        placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }: any) => {
          if (!placePrediction) return

          const place = placePrediction.toPlace()

          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location'],
          })

          if (!place.location) return

          const lat     = place.location.lat()
          const lng     = place.location.lng()
          const address = place.formattedAddress ?? place.displayName ?? ''

          console.log('✓ Place selected:', { address, lat, lng })

          updateRef.current({
            accommodationAddress: address,
            accommodationLat:     lat,
            accommodationLng:     lng,
          })
        })

      } catch (err) {
        console.error('Places init error:', err)
        setLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [useManual])

  function switchToManual() {
    updateRef.current({ accommodationAddress: '', accommodationLat: null, accommodationLng: null })
    setGeocodeFailed(false)
    setUseManual(true)
  }

  function switchToAutocomplete() {
    updateRef.current({ accommodationAddress: '', accommodationLat: null, accommodationLng: null })
    setGeocodeFailed(false)
    setUseManual(false)
    setLoading(true)
  }

  async function handleManualBlur(address: string) {
    if (address.length < 5) return
    setGeocoding(true)
    setGeocodeFailed(false)

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
    const coords = await geocodeAddress(address, apiKey)

    if (!coords) {
      // Real failure — do NOT silently fall back to a hardcoded point.
      // Every downstream feature (walking distances, opening-hours
      // radius, suggestion pages) depends on this coordinate being the
      // person's real location. A silent wrong location is worse than
      // an empty one: the user has no way to know the trip is being
      // built around the wrong spot.
      console.warn('Geocoding failed for address:', address)
      setGeocodeFailed(true)
      updateRef.current({
        accommodationAddress: address,
        accommodationLat:     null,
        accommodationLng:     null,
      })
      setGeocoding(false)
      return
    }

    updateRef.current({
      accommodationAddress: address,
      accommodationLat:     coords.lat,
      accommodationLng:     coords.lng,
    })
    setGeocoding(false)
  }

  return (
    <div>
      <h2 className="step__question">
        Where are you<br />staying?
      </h2>
      <p className="step__hint">
        Enter your hotel name or address. We&apos;ll build your route from here.
      </p>

      <div className="location__input-wrap">

        {/* ── Mode A: Google Autocomplete ── */}
        {!useManual && (
          <>
            {loading && (
              <div className="location__loading">Loading address search...</div>
            )}

            <div
              ref={containerRef}
              className="location__autocomplete-container"
              style={{ display: loading ? 'none' : 'block' }}
            />

            {state.accommodationLat && (
              <p className="location__confirmed">
                ✓ {state.accommodationAddress}
              </p>
            )}

            {!loading && (
              <button
                className="location__switch"
                onClick={switchToManual}
                type="button"
              >
                Can&apos;t find your hotel? Enter manually →
              </button>
            )}
          </>
        )}

        {/* ── Mode B: Manual input + geocode on blur ── */}
        {useManual && (
          <>
            <input
              type="text"
              placeholder="e.g. Carrer de Mallorca 401, Barcelona"
              className="location__input"
              defaultValue={state.accommodationAddress}
              onBlur={e => handleManualBlur(e.target.value.trim())}
              onChange={e => {
                setGeocodeFailed(false)
                updateRef.current({
                  accommodationAddress: e.target.value,
                  accommodationLat:     null,
                  accommodationLng:     null,
                })
              }}
            />

            {geocoding && (
              <p className="location__helper">Finding your location...</p>
            )}

            {geocodeFailed && !geocoding && (
              <p className="location__error">
                We couldn&apos;t find that address. Try adding more detail
                (street number, postal code), or switch back to hotel search.
              </p>
            )}

            {state.accommodationLat && !geocoding && (
              <p className="location__confirmed">
                ✓ {state.accommodationAddress}
              </p>
            )}

            <button
              className="location__switch"
              onClick={switchToAutocomplete}
              type="button"
            >
              ← Search by hotel name instead
            </button>
          </>
        )}

      </div>
    </div>
  )
}