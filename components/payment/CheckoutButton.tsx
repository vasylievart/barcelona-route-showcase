'use client'
 
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTripPrice, formatPrice } from '@/lib/pricing'
import './checkout-button.css'
 
interface Props {
  tripId:     string
  tripDays:   number
  userEmail?: string
  label?:     string
}
 

const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true'
 
export function CheckoutButton({ tripId, tripDays, userEmail, label }: Props) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const router = useRouter()
 
  // ── Beta mode: skip payment, go straight to the itinerary ────────────────
  if (!PAYMENTS_ENABLED) {
    return (
      <div className="checkout-btn-wrap">
        <button
          className="btn btn--primary btn--large checkout-btn"
          onClick={() => router.push(`/itinerary/${tripId}`)}
        >
          View full route →
        </button>
        <p className="coming-soon__note">
          🎉 Free during beta — no payment needed
        </p>
      </div>
    )
  }
 

  const displayPrice = formatPrice(getTripPrice(tripDays))
 
  async function handleCheckout() {
    setLoading(true)
    setError(null)
 
    try {
      const res = await fetch('/api/create-checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tripId, userEmail }),
      })
 
      const data = await res.json().catch(() => ({}))
 
      if (data.alreadyPaid) {
        window.location.href = `/itinerary/${tripId}`
        return
      }
 
      if (!res.ok || data.error || !data.url) {
        setError(data.error ?? 'Payment could not be started. Please try again.')
        setLoading(false)
        return
      }
 
      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }
 
  return (
    <div className="checkout-btn-wrap">
      <button
        className="btn btn--primary btn--large checkout-btn"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <span className="checkout-btn__loading">
            <span className="checkout-btn__spinner" />
            Redirecting to payment...
          </span>
        ) : (
          label ?? `Unlock full route — ${displayPrice}`
        )}
      </button>
 
      {error && <p className="checkout-btn__error">{error}</p>}
 
      <p className="checkout-btn__note">
        🔒 Secure payment · Apple Pay &amp; Google Pay accepted
      </p>
    </div>
  )
}