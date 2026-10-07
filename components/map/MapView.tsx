'use client'
import { config } from '@/config/env'
import { useEffect, useRef } from 'react'

interface MapPin {
  lat:  number
  lng:  number
  name: string
  type: string
  time: string
  index: number
}

interface Props {
  pins:   MapPin[]
  center?: { lat: number; lng: number }
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


let mapApiPromise: Promise<void> | null = null


function loadMapApi(apiKey: string): Promise<void> {
  if (mapApiPromise) return mapApiPromise
  mapApiPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.maps) { resolve(); return }
    const existing = document.querySelector('script[data-map-api]')
    if (existing) {
      // Script already injected — wait for it
      const check = setInterval(() => {
        if ((window as any).google?.maps) {
          clearInterval(check)
          resolve()
        }
      }, 100)
      return
    }
    ;(window as any).__mapCallback = () => resolve()
    const script = document.createElement('script')
    script.setAttribute('data-map-api', 'true')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__mapCallback&v=weekly&loading=async`
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Map failed to load'))
    document.head.appendChild(script)
  })
  return mapApiPromise
}

export function MapView({ pins, center }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polylineRef = useRef<any>(null)

  useEffect(() => {
    if (!pins.length || !mapDivRef.current) return

    let cancelled = false

    async function initMap() {
      try {
        // 1. Load the core API script (using your existing loader)
        await loadMapApi(config.google.mapsApiKey)
        if (cancelled || !mapDivRef.current) return

        const google = (window as any).google

        // 2. IMPORT the specific libraries you need
        const markerLib = await google.maps.importLibrary("marker")
        const mapsLib = await google.maps.importLibrary("maps");

        const mapCenter = center ?? { lat: pins[0].lat, lng: pins[0].lng }

        // 3. Initialize Map with a mapId (Required for AdvancedMarkerElement)
        const map = new mapsLib.Map(mapDivRef.current, {
          center: mapCenter,
          zoom: 14,
          mapId: config.google.mapId, // Replace with your actual Map ID from Google Console
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
        })

        mapRef.current = map

        const bounds = new google.maps.LatLngBounds()

        // 4. Update Marker Logic
        pins.forEach((pin, i) => {
          const color = TYPE_COLORS[pin.type] ?? TYPE_COLORS.default

          // Create an actual DOM element for the marker content
          const pinContainer = document.createElement('div')
          pinContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
              <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="${color}"/>
              <circle cx="18" cy="18" r="11" fill="white" opacity="0.9"/>
              <text x="18" y="23" text-anchor="middle" font-family="Georgia, serif" font-size="12" font-weight="600" fill="${color}">${i + 1}</text>
            </svg>`

          // Use AdvancedMarkerElement
          const marker = new markerLib.AdvancedMarkerElement({
            position: { lat: pin.lat, lng: pin.lng },
            map,
            content: pinContainer, // New way: pass the DOM element
            title: `${pin.time} — ${pin.name}`,
          })

          bounds.extend({lat: pin.lat, lng: pin.lng})

          // Info window logic (Still works the same)
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 8px;"><strong>${pin.name}</strong></div>`,
          })

          marker.addListener('gmp-click', () => {
            infoWindow.open({
              map, 
              anchor: marker
            })
          })

          markersRef.current.push(marker)
          bounds.extend({ lat: pin.lat, lng: pin.lng })
        })

        // 5. Draw Polyline (Using the imported Polyline class)
        const path = pins.map(p => ({ lat: p.lat, lng: p.lng }))
        const polyline = new mapsLib.Polyline({
          path,
          geodesic: true,
          strokeColor: '#C4622D',
          strokeOpacity: 0.6,
          strokeWeight: 2.5,
          icons: [{
            icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3 },
            offset: '50%',
          }],
        })

        polyline.setMap(map)
        polylineRef.current = polyline
        map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 })

      } catch (err) {
        console.error('Map init error:', err)
      }
    }

    initMap()

    return () => {
      cancelled = true
      markersRef.current.forEach(m => (m.map = null)) // AdvancedMarkers use .map = null to remove
      markersRef.current = []
      if (polylineRef.current) polylineRef.current.setMap(null)
    }
  }, [pins, center])

  return (
    <div className="map-wrapper">
      <div ref={mapDivRef} className="map-container" style={{ height: '500px'}} />
    </div>
  )
}

