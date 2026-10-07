'use client'
import { useState, useEffect } from 'react'
import { MapView }             from '@/components/map/MapView'
import { Timeline }            from '@/components/itinerary/Timeline'
import { CheckoutButton }      from '@/components/payment/CheckoutButton'
import { ExportButtons }       from './ExportButtons'

import "./itinerary-view.css"
import { createClient } from '@/lib/supabase/client'
import { ShareButtons } from './ShareButtons'
import { ReviewPrompt } from '../reviews/ReviewPrompt'
import { trackPinterest } from '@/lib/pinterest'

interface Props {
  trip:     any
  days:     any[]
  isPaid:   boolean
  justPaid: boolean
}

const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true'

export function ItineraryView({ trip, days, isPaid, justPaid }: Props) {
  const [activeDay,   setActiveDay]   = useState(0)
  const [user,        setUser]        = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)

  // Check if user is logged in — needed for export gate in beta mode
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setUserLoading(false)

      // Claim the trip if user just logged in and trip is unclaimed
      if (currentUser && trip.id && !trip.user_email && !trip.user_id) {
        fetch('/api/claim-trip', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ tripId: trip.id }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.ok) console.log('✓ Trip claimed by', currentUser.email)
          })
          .catch(err => console.error('Claim trip failed:', err))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [trip.id, trip.user_email, trip.user_id])
  



 // Inside useEffect or directly in the component: Pinterest conversions
  useEffect(() => {
    if (justPaid) {
      trackPinterest('checkout', {
        value:          trip.budget,
        order_quantity: 1,
        currency:       'EUR',
      })
    }
  }, [justPaid, trip.budget])

  const currentDay = days[activeDay]
  if (!currentDay) return null

  const steps = currentDay.steps ?? []

  const pins = steps.map((step: any, i: number) => ({
    lat:   parseFloat(String(step.place.latitude)),
    lng:   parseFloat(String(step.place.longitude)),
    name:  step.place.name,
    type:  step.type,
    time:  step.time,
    index: i,
  }))

  const totalCost = steps.reduce(
    (sum: number, s: any) => sum + (s.estimatedSpend ?? 0), 0
  )

  // Determine what to show based on payment mode
  const showFullRoute = !PAYMENTS_ENABLED || isPaid

  function handleDownload() {
    const data = JSON.stringify({ trip, days })
    const blob = new Blob([data], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'barcelona-route.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleLoginToExport() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/itinerary/${trip.id}`,
      },
    })
  }



  return (
    <div className="itinerary-page">

      {/* Success banner */}
      {justPaid && (
        <div className="itinerary-banner">
          🎉 Payment confirmed — enjoy your Barcelona adventure!
        </div>
      )}

      {/* Header */}
      <div className="itinerary-header">
        <div className="itinerary-header__inner">
          <p className="itinerary-header__city">Barcelona</p>
          <h1 className="itinerary-header__title">
            Your {trip.trip_days}-day itinerary
          </h1>
          <p className="itinerary-header__meta">
            {steps.length} stops · ~€{Math.round(totalCost)} estimated
          </p>
        </div>
      </div>

      {/* Day tabs — only show if multi-day */}
      {days.length > 1 && (
        <div className="itinerary-tabs">
          {days.map((_: any, i: number) => (
            <button
              key={i}
              className={`itinerary-tab ${activeDay === i ? 'itinerary-tab--active' : ''}`}
              onClick={() => setActiveDay(i)}
            >
              Day {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="itinerary-map">
        <MapView
          pins={pins}
          center={{ lat: trip.accommodation_lat, lng: trip.accommodation_lng }}
        />
      </div>

      {/* Timeline + actions */}
      <div className="itinerary-timeline">

        {/* ── Payments enabled — original paid/unpaid logic ── */}
        {PAYMENTS_ENABLED && (
          <>
            {isPaid ? (
              <>
                <Timeline steps={steps} locked={false} />
                <ExportButtons
                  steps={steps}
                  dayTitle={`Barcelona Day ${activeDay + 1}`}
                />
                <div className="itinerary-actions">
                  <button className="btn btn--primary" onClick={handleDownload}>
                    Download for offline use
                  </button>
                </div>
              </>
            ) : (
              <>
                <Timeline steps={steps} locked={true} freeCount={3} />
                <div className="itinerary-paywall">
                  <h3>Unlock your full route</h3>
                  <CheckoutButton
                    tripId={trip.id}
                    tripDays={trip.trip_days}
                    userEmail={trip.user_email}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* ── Beta mode — full route visible, exports require login ── */}
        {showFullRoute && (
          <>
            <Timeline steps={steps} locked={false} />

            {!userLoading && (
              <>
                {user ? (
                  // Logged in — show all export options
                  <>
                    <ExportButtons
                      steps={steps}
                      dayTitle={`Barcelona Day ${activeDay + 1}`}
                    />
                     <ShareButtons
                        tripId={trip.id}
                        days={trip.trip_days}
                        stops={steps.length}
                      />
                    <div className="itinerary-actions">
                      <button className="btn btn--primary" onClick={handleDownload}>
                        Download for offline use
                      </button>
                    </div>
                  </>
                ) : (
                  // Not logged in — prompt to sign in to export
                  <div className="itinerary-login-gate">
                    <div className="itinerary-login-gate__inner">
                      <p className="itinerary-login-gate__title">
                        Save &amp; export your route
                      </p>
                      <p className="itinerary-login-gate__desc">
                        Sign in to export to Google Maps, download for offline
                        use, and save your itinerary to your account.
                      </p>
                      <button
                        className="btn btn--primary"
                        onClick={handleLoginToExport}
                      >
                        Sign in with Google to export →
                      </button>
                      <p className="itinerary-login-gate__note">
                        Free · Takes 10 seconds
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
      {user && (
        <ReviewPrompt tripId={trip.id}/>
      )}
    </div>
  )
}