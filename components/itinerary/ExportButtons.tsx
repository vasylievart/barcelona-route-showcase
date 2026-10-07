'use client'
import { useState } from 'react'
import {
  buildGoogleMapsUrl,
  buildAppleMapsUrl,
  generateGPX,
  generateKML,
} from '@/utils/exportRoute'
import './export-button.css'

interface Props {
  steps:    any[]
  dayTitle: string
}

export function ExportButtons({ steps, dayTitle }: Props) {
  const [copied, setCopied] = useState(false)

  const googleMapsUrl = buildGoogleMapsUrl(steps)
  const appleMapsUrl  = buildAppleMapsUrl(steps)

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadGPX() {
    const gpx = generateGPX(steps, dayTitle)
    downloadFile(gpx, 'barcelona-route.gpx', 'application/gpx+xml')
  }

  function handleDownloadKML() {
    const kml = generateKML(steps, dayTitle)
    downloadFile(kml, 'barcelona-route.kml', 'application/vnd.google-earth.kml+xml')
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Detect iOS for Apple Maps option
  const isIOS = typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent)

  return (
    <div className="export">
      <h3 className="export__title">Open in maps</h3>

      <div className="export__primary">
        {/* Google Maps — works everywhere */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="export__btn export__btn--google"
        >
          <span className="export__btn-icon">🗺️</span>
          <span className="export__btn-text">
            <strong>Open in Google Maps</strong>
            <small>All {steps.length} stops with walking directions</small>
          </span>
          <span className="export__btn-arrow">→</span>
        </a>

        {/* Apple Maps — show on iOS */}
        {isIOS && (
          <a
            href={appleMapsUrl}
            className="export__btn export__btn--apple"
          >
            <span className="export__btn-icon">🍎</span>
            <span className="export__btn-text">
              <strong>Open in Apple Maps</strong>
              <small>Walking route for iPhone</small>
            </span>
            <span className="export__btn-arrow">→</span>
          </a>
        )}
      </div>

      <h3 className="export__title" style={{ marginTop: '1.5rem' }}>
        Save for offline
      </h3>

      <div className="export__secondary">
        {/* KML — imports into Google My Maps */}
        <button
          className="export__btn export__btn--file"
          onClick={handleDownloadKML}
        >
          <span className="export__btn-icon">📍</span>
          <span className="export__btn-text">
            <strong>Download for Google My Maps</strong>
            <small>Import .kml → syncs to Google Maps on phone</small>
          </span>
        </button>

        {/* GPX — universal format */}
        <button
          className="export__btn export__btn--file"
          onClick={handleDownloadGPX}
        >
          <span className="export__btn-icon">📁</span>
          <span className="export__btn-text">
            <strong>Download GPX file</strong>
            <small>Works in Maps.me, OsmAnd, Komoot</small>
          </span>
        </button>

        {/* Copy link */}
        <button
          className="export__btn export__btn--copy"
          onClick={handleCopyLink}
        >
          <span className="export__btn-icon">
            {copied ? '✓' : '🔗'}
          </span>
          <span className="export__btn-text">
            <strong>{copied ? 'Link copied!' : 'Copy route link'}</strong>
            <small>Share with travel companions</small>
          </span>
        </button>
      </div>
    </div>
  )
}