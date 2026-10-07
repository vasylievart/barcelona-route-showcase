'use client'
import posthog from 'posthog-js'
import { useState, useEffect } from 'react'

export function InstallPrompt() {
  const [isIOS,        setIsIOS]        = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed,    setDismissed]    = useState(false)

  useEffect(() => {
    window.addEventListener('appinstalled', () => {
      posthog.capture('pwa_installed')
    })

    window.addEventListener('beforeinstallprompt', (e) => {
      posthog.capture('pwa_install_prompt_shown')
    })
  }, []);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream
    )
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches
    )
    setDismissed(
      localStorage.getItem('install-prompt-dismissed') === 'true'
    )
  }, [])

  function dismiss() {
    localStorage.setItem('install-prompt-dismissed', 'true')
    setDismissed(true)
  }

  // Don't show if: already installed, not iOS, already dismissed
  if (isStandalone || !isIOS || dismissed) return null

  return (
    <div className="install-prompt">
      <button className="install-prompt__close" onClick={dismiss}>×</button>
      <div className="install-prompt__icon">🗺️</div>
      <p className="install-prompt__text">
        Install Barcelona Route on your home screen for the best experience.
      </p>
      <p className="install-prompt__steps">
        Tap <strong>Share ⎋</strong> then <strong>Add to Home Screen ➕</strong>
      </p>
    </div>
  )
}