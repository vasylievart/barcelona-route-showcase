// components/admin/CreateAgenda.tsx
//
// Modeled on the shape of CreatePlace.tsx — same admin layout conventions
// (labeled fields, plain inputs, a submit handler writing to Supabase).
// I don't have your current CreatePlace.tsx/admin.css in this session to
// match exactly — check class names below against your real admin.css
// (e.g. `admin__field`, `admin__label`) and adjust if they differ.

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const TAG_OPTIONS = [
  'history', 'food', 'architecture', 'music', 'art',
  'family', 'nightlife', 'nature', 'sport',
]

export default function CreateAgenda() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName]                     = useState('')
  const [price, setPrice]                   = useState(0)
  const [tags, setTags]                     = useState<string[]>([])
  const [startAt, setStartAt]               = useState('')
  const [expired, setExpired]               = useState('')
  const [startHours, setStartHours]         = useState('')
  const [latitude, setLatitude]             = useState('')
  const [longitude, setLongitude]           = useState('')
  const [bookingUrl, setBookingUrl]         = useState('')
  const [avgVisitDuration, setAvgVisitDuration] = useState(60)
  const [accessible, setAccessible]         = useState(false)
  const [lgbtFriendly, setLgbtFriendly]     = useState(false)
  const [childFriendly, setChildFriendly]   = useState(false)
  const [petFriendly, setPetFriendly]       = useState(false)

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleSave() {
    setError(null)

    if (!name.trim())            return setError('Name is required.')
    if (!startAt || !expired)    return setError('Start and end dates are required.')
    if (expired < startAt)       return setError('End date must be on or after the start date.')
    if (!latitude || !longitude) return setError('Latitude and longitude are required.')

    setSaving(true)
    const supabase = createClient()

    const { error: dbError } = await supabase.from('agenda').insert({
      name: name.trim(),
      price,
      tag: tags,
      start_at: startAt,
      expired,
      start_hours: startHours,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      booking_url: bookingUrl || null,
      avg_visit_duration: avgVisitDuration,
      accessible,
      lgbt_friendly: lgbtFriendly,
      child_friendly: childFriendly,
      pet_friendly: petFriendly,
    })

    setSaving(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="admin__form">
      <h2 className="admin__form-title">New Agenda Event</h2>

      {error && <p className="admin__error">{error}</p>}

      <div className="admin__field">
        <label className="admin__label">Name</label>
        <input
          className="admin__input"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Price (€)</label>
        <input
          type="number"
          min={0}
          step={0.5}
          className="admin__input"
          value={price}
          onChange={e => setPrice(parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Tags (matched against user interests)</label>
        <div className="admin__pills">
          {TAG_OPTIONS.map(tag => (
            <button
              key={tag}
              type="button"
              className={`admin__pill${tags.includes(tag) ? ' admin__pill--active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="admin__row">
        <div className="admin__field">
          <label className="admin__label">Start date</label>
          <input
            type="date"
            className="admin__input"
            value={startAt}
            onChange={e => setStartAt(e.target.value)}
          />
        </div>
        <div className="admin__field">
          <label className="admin__label">End date</label>
          <input
            type="date"
            className="admin__input"
            value={expired}
            min={startAt || undefined}
            onChange={e => setExpired(e.target.value)}
          />
        </div>
      </div>

      <div className="admin__field">
        <label className="admin__label">Start time</label>
        <input
          type="time"
          className="admin__input"
          value={startHours}
          onChange={e => setStartHours(e.target.value)}
        />
      </div>

      <div className="admin__row">
        <div className="admin__field">
          <label className="admin__label">Latitude</label>
          <input
            className="admin__input"
            value={latitude}
            onChange={e => setLatitude(e.target.value)}
            placeholder="41.4036"
          />
        </div>
        <div className="admin__field">
          <label className="admin__label">Longitude</label>
          <input
            className="admin__input"
            value={longitude}
            onChange={e => setLongitude(e.target.value)}
            placeholder="2.1744"
          />
        </div>
      </div>

      <div className="admin__field">
        <label className="admin__label">Booking URL</label>
        <input
          className="admin__input"
          value={bookingUrl}
          onChange={e => setBookingUrl(e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Average visit duration (minutes)</label>
        <input
          type="number"
          min={0}
          className="admin__input"
          value={avgVisitDuration}
          onChange={e => setAvgVisitDuration(parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Accessibility & audience</label>
        <div className="admin__checkboxes">
          <label>
            <input type="checkbox" checked={accessible} onChange={e => setAccessible(e.target.checked)} />
            Accessible
          </label>
          <label>
            <input type="checkbox" checked={lgbtFriendly} onChange={e => setLgbtFriendly(e.target.checked)} />
            LGBT friendly
          </label>
          <label>
            <input type="checkbox" checked={childFriendly} onChange={e => setChildFriendly(e.target.checked)} />
            Child friendly
          </label>
          <label>
            <input type="checkbox" checked={petFriendly} onChange={e => setPetFriendly(e.target.checked)} />
            Pet friendly
          </label>
        </div>
      </div>

      <button
        type="button"
        className="admin__submit"
        disabled={saving}
        onClick={handleSave}
      >
        {saving ? 'Saving…' : 'Create Event'}
      </button>
    </div>
  )
}