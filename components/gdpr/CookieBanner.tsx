'use client'
import { useState, useEffect } from 'react'
import "./cookies.css"


export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-banner__inner">
        <p className="cookie-banner__text">
          We use essential cookies to make this app work.
          No tracking, no advertising.{' '}
          <a href="/privacy" className="cookie-banner__link">
            Privacy policy →
          </a>
          {'.'}
          <a href="/terms" className="cookie-banner__link">
            Terms of service
          </a>
        </p>
        <div className="cookie-banner__actions">
          <button
            className="btn cookie-banner__decline"
            onClick={decline}
          >
            Decline
          </button>
          <button
            className="btn btn--primary cookie-banner__accept"
            onClick={accept}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}