'use client'
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { haversineDistance } from '@/algorithms/haversine'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface Pin {
  lat:   number
  lng:   number
  name:  string
  index: number
  type:  string
}

interface Props {
  pins:          Pin[]
  routeCoords?:  [number, number][]
  height?:       string
  onNearStop?:   (stopIndex: number, stopName: string) => void  // callback when near a stop
  onStopDoubleClick?: (pinIndex: number) => void
}

const PROXIMITY_METRES = 50   // how close before triggering "you are near stop X"
//TODO: Remove hardcoded height when it will style
export function MapView({ pins, routeCoords, height = '300px', onNearStop, onStopDoubleClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return
    if (pins.length === 0) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style:     'mapbox://styles/mapbox/streets-v12',
      center:    [pins[0].lng, pins[0].lat],
      zoom:      14,
    })

    mapRef.current = map

    map.on('load', () => {
      map.resize()

      // ── Route line ────────────────────────────────────────────────────
      if (routeCoords && routeCoords.length > 1) {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type:       'Feature',
            properties: {},
            geometry:   { type: 'LineString', coordinates: routeCoords },
          },
        })
        map.addLayer({
          id:     'route-line',
          type:   'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color':   '#C4622D',
            'line-width':   3,
            'line-opacity': 0.6,
          },
        })
      }

      // ── Numbered markers ──────────────────────────────────────────────
      pins.forEach((pin) => {
        const el = document.createElement('div')
        el.className   = 'map-marker'
        el.id          = `marker-${pin.index}`
        el.innerHTML   = `<span>${pin.index}</span>`
        el.style.cssText = `
          width: 28px; height: 28px; border-radius: 50%;
          background: #1B2B4B; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(27,43,75,0.4);
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        `
        el.addEventListener('dblclick', (e) => {
          e.stopPropagation()
          onStopDoubleClick?.(pin.index)
        })
        new mapboxgl.Marker({ element: el })
          .setLngLat([pin.lng, pin.lat])
          .setPopup(new mapboxgl.Popup({ offset: 18 }).setText(pin.name))
          .addTo(map)
      })

      // ── Fit bounds ────────────────────────────────────────────────────
      if (pins.length > 1) {
        const bounds = pins.reduce(
          (b, p) => b.extend([p.lng, p.lat]),
          new mapboxgl.LngLatBounds([pins[0].lng, pins[0].lat], [pins[0].lng, pins[0].lat])
        )
        map.fitBounds(bounds, { padding: 48, maxZoom: 15 })
      }

      // ── Geolocate control — live user position ────────────────────────
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions:   { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading:   true,
      })
      map.addControl(geolocate, 'top-right')

      // ── Proximity detection — "you are near stop X" ───────────────────
      if (onNearStop) {
        const notifiedStops = new Set<number>()

        geolocate.on('geolocate', (e: any) => {
          const userPos = {
            lat: e.coords.latitude,
            lng: e.coords.longitude,
          }

          pins.forEach(pin => {
            if (notifiedStops.has(pin.index)) return

            const distKm = haversineDistance(userPos, { lat: pin.lat, lng: pin.lng })
            const distM  = distKm * 1000

            if (distM <= PROXIMITY_METRES) {
              notifiedStops.add(pin.index)
              onNearStop(pin.index, pin.name)

              // Highlight the marker when user arrives
              const markerEl = document.getElementById(`marker-${pin.index}`)
              if (markerEl) {
                markerEl.style.background = '#C4622D'  // terracotta = arrived
                markerEl.style.transform  = 'scale(1.3)'
              }
            }
          })
        })
      }
    })

    const resizeTimer = setTimeout(() => map.resize(), 100)

    return () => {
      clearTimeout(resizeTimer)
      map.remove()
    }
  }, [pins, routeCoords, onNearStop])

  return <div ref={containerRef} style={{ width: '100%', height }} />
}