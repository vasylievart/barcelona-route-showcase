'use client'

import Link from 'next/link'
import { useRouter }    from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import './dashboard.css'
import { useEffect } from 'react'
import { trackPinterest } from '@/lib/pinterest'




interface Props {
  user:  any
  trips: any[]
}

export function DashboardView({ user, trips}: Props) {

  // In useEffect on mount — check if this is a fresh signup
  useEffect(() => {
    const key = `pinterest-signup-tracked-${user.id}`
    if (localStorage.getItem(key)) return

    // Check if account was created recently (within last 5 minutes)
    const createdAt  = new Date(user.created_at).getTime()
    const fiveMinAgo = Date.now() - 5 * 60 * 1000

    if (createdAt > fiveMinAgo) {
      trackPinterest('signup', { lead_type: 'google_oauth' })
      localStorage.setItem(key, 'true')
    }
  }, [user.id, user.created_at])

  const supabase = createClient()

  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const paidTrips  = trips.filter(t => t.is_paid)
  const freeTrips  = trips.filter(t => !t.is_paid)

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dashboard__header">
        <div className="dashboard__header-inner">
          <div className="dashboard__user">
            <div className="dashboard__avatar">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="dashboard__greeting">Welcome back</p>
              <p className="dashboard__email">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="dashboard__logout">
            Sign out
          </button>
        </div>
      </div>

      <div className="dashboard__body">

        {/* Stats */}
        <div className="dashboard__stats">
          <div className="dashboard__stat">
            <span className="dashboard__stat-number">{trips.length}</span>
            <span className="dashboard__stat-label">Routes generated</span>
          </div>
          <div className="dashboard__stat">
            <span className="dashboard__stat-number">{paidTrips.length}</span>
            <span className="dashboard__stat-label">Full routes unlocked</span>
          </div>
          <div className="dashboard__stat">
            <span className="dashboard__stat-number">
              {trips.reduce((sum, t) => sum + (t.trip_days ?? 1), 0)}
            </span>
            <span className="dashboard__stat-label">Days planned</span>
          </div>
        </div>

        {/* CTA if no trips */}
        {trips.length === 0 && (
          <div className="dashboard__empty">
            <p className="dashboard__empty-icon">🗺️</p>
            <h2>No routes yet</h2>
            <p>Generate your first Barcelona itinerary.</p>
            <Link href="/plan" className="btn btn--primary">
              Plan my day →
            </Link>
          </div>
        )}

        {/* Paid / unlocked trips */}
        {paidTrips.length > 0 && (
          <section className="dashboard__section">
            <h2 className="dashboard__section-title">
              Your unlocked routes
            </h2>
            <div className="dashboard__trips">
              {paidTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </section>
        )}

        {/* Free / preview trips */}
        {freeTrips.length > 0 && (
          <section className="dashboard__section">
            <h2 className="dashboard__section-title">
              Previous previews
            </h2>
            <p className="dashboard__section-hint">
              Unlock any of these to see the full route.
            </p>
            <div className="dashboard__trips">
              {freeTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </section>
        )}

        {/* Generate new route */}
        <div className="dashboard__new">
          <Link href="/plan" className="btn btn--primary">
            + Generate new route
          </Link>
        </div>

      </div>
    </div>
  )
}

// ── Trip card ─────────────────────────────────────────────────────────────────

function TripCard({ trip }: { trip: any }) {
  const date = new Date(trip.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  const firstDay  = trip.itineraries?.[0]?.route_json
  const stopCount = firstDay?.steps?.length ?? 0
  const totalCost = firstDay?.totalEstimatedCost ?? 0

  return (
    <Link
      href={`/itinerary/${trip.id}`}
      className={`trip-card ${trip.is_paid ? 'trip-card--paid' : ''}`}
    >
      <div className="trip-card__top">
        <div className="trip-card__info">
          <span className="trip-card__days">
            {trip.trip_days} day{trip.trip_days > 1 ? 's' : ''}
          </span>
          <span className="trip-card__date">{date}</span>
        </div>
        <span className={`trip-card__badge ${trip.is_paid ? 'trip-card__badge--paid' : ''}`}>
          {trip.is_paid ? '✓ Unlocked' : 'Preview'}
        </span>
      </div>

      <div className="trip-card__details">
        {stopCount > 0 && (
          <span className="trip-card__stops">{stopCount} stops</span>
        )}
        {totalCost > 0 && (
          <span className="trip-card__cost">~€{Math.round(totalCost)}</span>
        )}
        <span className="trip-card__persona">{trip.budget_persona}</span>
      </div>

      {trip.interests?.length > 0 && (
        <div className="trip-card__tags">
          {trip.interests.slice(0, 3).map((interest: string) => (
            <span key={interest} className="trip-card__tag">{interest}</span>
          ))}
        </div>
      )}

      <span className="trip-card__arrow">
        {trip.is_paid ? 'View route →' : 'Unlock full route →'}
      </span>
    </Link>
  )
}