// app/create-place/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { createClient }        from '@/lib/supabase/client'
import './create-place.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Category { id: number; name: string; slot: string }
interface Tag       { id: number; name: string; display_name: string; emoji: string | null }
interface City      { id: string; name: string }

interface OpeningHourRow {
  day_of_week: number
  open_time:   string
  close_time:  string
  is_closed:   boolean
}

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const DEFAULT_HOURS: OpeningHourRow[] = DAY_NAMES.map((_, i) => ({
  day_of_week: i,
  open_time:   '09:00',
  close_time:  '21:00',
  is_closed:   false,
}))

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreatePlacePage() {
  const router = useRouter()

  // Reference data
  const [categories,  setCategories]  = useState<Category[]>([])
  const [allTags,     setAllTags]      = useState<Tag[]>([])
  const [cities,      setCities]       = useState<City[]>([])
  const [loading,     setLoading]      = useState(true)
  const [saving,      setSaving]       = useState(false)
  const [error,       setError]        = useState<string | null>(null)
  const [successId,   setSuccessId]    = useState<string | null>(null)

  // ── Place fields ──────────────────────────────────────────────────────────
  const [name,              setName]              = useState('')
  const [categoryId,        setCategoryId]        = useState<number | ''>('')
  const [latitude,          setLatitude]          = useState('')
  const [longitude,         setLongitude]         = useState('')
  const [cityId,            setCityId]            = useState('')
  const [district,          setDistrict]          = useState('')
  const [tier,              setTier]              = useState<1|2|3>(2)
  const [placeType,         setPlaceType]         = useState<'stop'|'free_stop'|'filler'>('stop')
  const [isActive,          setIsActive]          = useState(true)
  const [isFree,            setIsFree]            = useState(false)
  const [isOutdoor,         setIsOutdoor]         = useState(false)
  const [requiresBooking,   setRequiresBooking]   = useState(false)
  const [rating,            setRating]            = useState('')
  const [reviewsCount,      setReviewsCount]      = useState('')
  const [priceLevel,        setPriceLevel]        = useState('')
  const [avgVisitDuration,  setAvgVisitDuration]  = useState('')
  const [avgSpend,          setAvgSpend]          = useState('')
  const [website,           setWebsite]           = useState('')
  const [googlePlaceId,     setGooglePlaceId]     = useState('')
  const [googleTypes,       setGoogleTypes]       = useState('')
  const [bookingUrl,        setBookingUrl]        = useState('')
  const [bookingLeadDays,   setBookingLeadDays]   = useState('')
  const [cuisineType,       setCuisineType]       = useState('')
  const [historicalDesc,    setHistoricalDesc]    = useState('')
  const [architect,         setArchitect]         = useState('')
  const [yearBuilt,         setYearBuilt]         = useState('')
  const [bestTimeStart,     setBestTimeStart]     = useState('')
  const [bestTimeEnd,       setBestTimeEnd]       = useState('')
  const [localTip,          setLocalTip]          = useState('')
  const [bestTime,          setBestTime]          = useState('')
  const [avoidTime,         setAvoidTime]         = useState('')
  const [queueTip,          setQueueTip]          = useState('')

  // ── Opening hours ─────────────────────────────────────────────────────────
  const [hours, setHours] = useState<OpeningHourRow[]>(DEFAULT_HOURS)

  // ── Tags ──────────────────────────────────────────────────────────────────
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [newTagName,     setNewTagName]     = useState('')
  const [newTagParentId, setNewTagParentId] = useState('')

  // ── Load reference data ───────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [catRes, tagRes, cityRes] = await Promise.all([
        supabase.from('categories').select('id, name, slot').order('name'),
        supabase.from('tags').select('id, name, display_name, emoji').order('name'),
        supabase.from('cities').select('id, name').order('name'),
      ])
      console.log("Cities data:", cityRes.data)
      console.log("Categories data:", catRes.data)
      if (catRes.data)  setCategories(catRes.data)
      if (tagRes.data)  setAllTags(tagRes.data)
      if (cityRes.data) setCities(cityRes.data)
      setLoading(false)
    }
    load()
  }, [])

  // ── Hours helpers ─────────────────────────────────────────────────────────
  function updateHour(dayIndex: number, patch: Partial<OpeningHourRow>) {
    setHours(prev => prev.map((h, i) => i === dayIndex ? { ...h, ...patch } : h))
  }

  function copyMondayToWeekdays() {
    const mon = hours[1]
    setHours(prev => prev.map((h, i) =>
      i >= 1 && i <= 5 ? { ...h, open_time: mon.open_time, close_time: mon.close_time, is_closed: mon.is_closed } : h
    ))
  }

  // ── Tag helpers ───────────────────────────────────────────────────────────
  function toggleTag(id: number) {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!name || !categoryId || !latitude || !longitude) {
      setError('Name, category, latitude, and longitude are required.')
      return
    }

    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const body: any = {
      name,
      category_id:       Number(categoryId),
      latitude:          parseFloat(latitude),
      longitude:         parseFloat(longitude),
      city_id:           cityId            || null,
      district:          district          || null,
      tier,
      place_type:        placeType,
      is_active:         isActive,
      is_free:           isFree,
      is_outdoor:        isOutdoor,
      requires_booking:  requiresBooking,
      rating:            rating            ? parseFloat(rating)          : null,
      reviews_count:     reviewsCount      ? parseInt(reviewsCount)      : null,
      price_level:       priceLevel        ? parseInt(priceLevel)        : null,
      avg_visit_duration: avgVisitDuration ? parseInt(avgVisitDuration)  : null,
      avg_spend:         avgSpend          ? parseFloat(avgSpend)        : null,
      website:           website           || null,
      google_place_id:   googlePlaceId     || null,
      google_types:      googleTypes
        ? googleTypes.split(',').map(s => s.trim()).filter(Boolean)
        : null,
      booking_url:       bookingUrl        || null,
      booking_lead_days: bookingLeadDays   ? parseInt(bookingLeadDays)   : null,
      cuisine_type:      cuisineType       || null,
      historical_desc:   historicalDesc    || null,
      architect:         architect         || null,
      year_built:        yearBuilt         ? parseInt(yearBuilt)         : null,
      best_time_start:   bestTimeStart     || null,
      best_time_end:     bestTimeEnd       || null,
      local_tip:         localTip          || null,
      best_time:         bestTime          || null,
      avoid_time:        avoidTime         || null,
      queue_tip:         queueTip          || null,
      opening_hours:     hours,
      tag_ids:           selectedTagIds,
      new_tags:          newTagName.trim()
        ? [{
            name:         newTagName.trim().toLowerCase().replace(/\s+/g, '_'),
            display_name: newTagName.trim(),
            emoji:        null,
            parent_id:    newTagParentId ? parseInt(newTagParentId) : null,
            tag_level:    newTagParentId ? 3 : 2,
          }]
        : [],
    }

    try {
      const res = await fetch('/api/places', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to create place')
      } else {
        setSuccessId(data.id)
        // Reset form
        setName(''); setCategoryId(''); setLatitude(''); setLongitude('')
        setDistrict(''); setRating(''); setReviewsCount(''); setLocalTip('')
        setHours(DEFAULT_HOURS); setSelectedTagIds([]); setNewTagName('')
      }
    } catch (err: any) {
      setError(err.message ?? 'Unexpected error')
    } finally {
      setSaving(false)
    }
  }
  console.log("City", cities)

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="create-place__loading">Loading…</div>
  }

  return (
    <div className="create-place">

      <div className="create-place__header">
        <h1 className="create-place__title">Add new place</h1>
        <div className="create-place__header-actions">
          <label className="create-place__toggle">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            Active
          </label>
          <button
            className="btn btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save place'}
          </button>
        </div>
      </div>

      {error     && <div className="create-place__error">{error}</div>}
      {successId && (
        <div className="create-place__success">
          ✓ Place created — ID: <code>{successId}</code>
          <button onClick={() => setSuccessId(null)}>Add another</button>
        </div>
      )}

      {/* ── Section 1: Core ─────────────────────────────────────────────── */}
      <section className="create-place__section">
        <h2 className="create-place__section-title">Core details</h2>

        <div className="create-place__field create-place__field--full">
          <label>Place name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Gin Palau Barcelona" />
        </div>

        <div className="create-place__row">
          <div className="create-place__field">
            <label>Category *</label>
            <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.slot})</option>
              ))}
            </select>
          </div>
          <div className="create-place__field">
            <label>City</label>
            <select value={cityId} onChange={e => setCityId(e.target.value)}>
              <option value="">Select city</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="create-place__row">
          <div className="create-place__field">
            <label>Latitude *</label>
            <input type="number" step="0.000001" value={latitude}  onChange={e => setLatitude(e.target.value)}  placeholder="41.395081" />
          </div>
          <div className="create-place__field">
            <label>Longitude *</label>
            <input type="number" step="0.000001" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="2.148458" />
          </div>
        </div>

        <div className="create-place__row">
          <div className="create-place__field">
            <label>District</label>
            <select value={district} onChange={e => setDistrict(e.target.value)}>
              <option value="">Select district</option>
              {['gothic','born','raval','eixample','gràcia','barceloneta','montjuïc','poblenou','sant-antoni','poble-sec'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="create-place__field">
            <label>Tier</label>
            <select value={tier} onChange={e => setTier(Number(e.target.value) as 1|2|3)}>
              <option value={1}>1 — Unmissable</option>
              <option value={2}>2 — Transition (default)</option>
              <option value={3}>3 — Anchor / filler</option>
            </select>
          </div>
        </div>

        <div className="create-place__row">
          <div className="create-place__field">
            <label>Place type</label>
            <select value={placeType} onChange={e => setPlaceType(e.target.value as any)}>
              <option value="stop">stop</option>
              <option value="free_stop">free_stop</option>
              <option value="filler">filler</option>
            </select>
          </div>
          <div className="create-place__field">
            <label>Price level</label>
            <select value={priceLevel} onChange={e => setPriceLevel(e.target.value)}>
              <option value="">Unknown</option>
              <option value="1">1 — €</option>
              <option value="2">2 — €€</option>
              <option value="3">3 — €€€</option>
              <option value="4">4 — €€€€</option>
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="create-place__checkbox-row">
          <label><input type="checkbox" checked={isFree}          onChange={e => setIsFree(e.target.checked)}          /> Free entry</label>
          <label><input type="checkbox" checked={isOutdoor}       onChange={e => setIsOutdoor(e.target.checked)}       /> Outdoor</label>
          <label><input type="checkbox" checked={requiresBooking} onChange={e => setRequiresBooking(e.target.checked)} /> Requires booking</label>
        </div>
      </section>

      {/* ── Section 2: Metrics ──────────────────────────────────────────── */}
      <section className="create-place__section">
        <h2 className="create-place__section-title">Metrics</h2>
        <div className="create-place__row">
          <div className="create-place__field">
            <label>Rating (e.g. 4.9)</label>
            <input type="number" step="0.1" min="0" max="5" value={rating} onChange={e => setRating(e.target.value)} placeholder="4.9" />
          </div>
          <div className="create-place__field">
            <label>Reviews count</label>
            <input type="number" value={reviewsCount} onChange={e => setReviewsCount(e.target.value)} placeholder="218" />
          </div>
        </div>
        <div className="create-place__row">
          <div className="create-place__field">
            <label>Avg visit duration (min)</label>
            <input type="number" value={avgVisitDuration} onChange={e => setAvgVisitDuration(e.target.value)} placeholder="60" />
          </div>
          <div className="create-place__field">
            <label>Avg spend (€)</label>
            <input type="number" step="0.01" value={avgSpend} onChange={e => setAvgSpend(e.target.value)} placeholder="0.00" />
          </div>
        </div>
      </section>

      {/* ── Section 3: Links ────────────────────────────────────────────── */}
      <section className="create-place__section">
        <h2 className="create-place__section-title">Links &amp; IDs</h2>
        <div className="create-place__field create-place__field--full">
          <label>Website</label>
          <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" />
        </div>
        <div className="create-place__field create-place__field--full">
          <label>Google Place ID</label>
          <input value={googlePlaceId} onChange={e => setGooglePlaceId(e.target.value)} placeholder="ChIJ..." />
        </div>
        <div className="create-place__field create-place__field--full">
          <label>Google types (comma-separated)</label>
          <input value={googleTypes} onChange={e => setGoogleTypes(e.target.value)} placeholder="cocktail_bar, bar, point_of_interest, establishment" />
        </div>
        <div className="create-place__row">
          <div className="create-place__field">
            <label>Booking URL</label>
            <input type="url" value={bookingUrl} onChange={e => setBookingUrl(e.target.value)} />
          </div>
          <div className="create-place__field">
            <label>Booking lead days</label>
            <input type="number" value={bookingLeadDays} onChange={e => setBookingLeadDays(e.target.value)} placeholder="3" />
          </div>
        </div>
      </section>

      {/* ── Section 4: Scheduling ───────────────────────────────────────── */}
      <section className="create-place__section">
        <h2 className="create-place__section-title">Scheduling &amp; tips</h2>
        <div className="create-place__row">
          <div className="create-place__field">
            <label>Best time start</label>
            <input type="time" value={bestTimeStart} onChange={e => setBestTimeStart(e.target.value)} />
          </div>
          <div className="create-place__field">
            <label>Best time end</label>
            <input type="time" value={bestTimeEnd} onChange={e => setBestTimeEnd(e.target.value)} />
          </div>
        </div>
        <div className="create-place__field create-place__field--full">
          <label>Best time (human text)</label>
          <input value={bestTime} onChange={e => setBestTime(e.target.value)} placeholder="Early morning before 10am" />
        </div>
        <div className="create-place__field create-place__field--full">
          <label>Avoid time</label>
          <input value={avoidTime} onChange={e => setAvoidTime(e.target.value)} placeholder="Weekends after noon — very crowded" />
        </div>
        <div className="create-place__field create-place__field--full">
          <label>Queue tip</label>
          <input value={queueTip} onChange={e => setQueueTip(e.target.value)} placeholder="Book online to skip the 45-minute queue" />
        </div>
        <div className="create-place__field create-place__field--full">
          <label>Local tip</label>
          <textarea rows={3} value={localTip} onChange={e => setLocalTip(e.target.value)} placeholder="What most tourists never know about this place…" />
        </div>
      </section>

      {/* ── Section 5: Historical / cultural ────────────────────────────── */}
      <section className="create-place__section">
        <h2 className="create-place__section-title">Historical &amp; cultural</h2>
        <div className="create-place__field create-place__field--full">
          <label>Historical description</label>
          <textarea rows={4} value={historicalDesc} onChange={e => setHistoricalDesc(e.target.value)} />
        </div>
        <div className="create-place__row">
          <div className="create-place__field">
            <label>Architect</label>
            <input value={architect} onChange={e => setArchitect(e.target.value)} />
          </div>
          <div className="create-place__field">
            <label>Year built</label>
            <input type="number" value={yearBuilt} onChange={e => setYearBuilt(e.target.value)} placeholder="1888" />
          </div>
        </div>
        <div className="create-place__field create-place__field--full">
          <label>Cuisine type</label>
          <input value={cuisineType} onChange={e => setCuisineType(e.target.value)} placeholder="catalan, tapas, seafood…" />
        </div>
      </section>

      {/* ── Section 6: Opening hours ─────────────────────────────────────── */}
      <section className="create-place__section">
        <h2 className="create-place__section-title">Opening hours</h2>
        <button
          type="button"
          className="create-place__copy-btn"
          onClick={copyMondayToWeekdays}
        >
          Copy Monday → Tue–Fri
        </button>

        <div className="create-place__hours">
          {hours.map((h, i) => (
            <div key={i} className="create-place__hour-row">
              <div className="create-place__hour-day">{DAY_NAMES[i].slice(0, 3)}</div>
              <label className="create-place__hour-closed">
                <input
                  type="checkbox"
                  checked={h.is_closed}
                  onChange={e => updateHour(i, { is_closed: e.target.checked })}
                />
                Closed
              </label>
              {!h.is_closed && (
                <>
                  <input
                    type="time"
                    value={h.open_time}
                    onChange={e => updateHour(i, { open_time: e.target.value })}
                    className="create-place__hour-time"
                  />
                  <span className="create-place__hour-sep">–</span>
                  <input
                    type="time"
                    value={h.close_time}
                    onChange={e => updateHour(i, { close_time: e.target.value })}
                    className="create-place__hour-time"
                  />
                </>
              )}
              {h.is_closed && (
                <span className="create-place__hour-closed-label">Closed all day</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 7: Tags ──────────────────────────────────────────────── */}
      <section className="create-place__section">
        <h2 className="create-place__section-title">Tags</h2>

        <div className="create-place__tag-grid">
          {allTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              className={`create-place__tag ${selectedTagIds.includes(tag.id) ? 'create-place__tag--on' : ''}`}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.emoji && <span>{tag.emoji} </span>}
              {tag.display_name}
            </button>
          ))}
        </div>

        <div className="create-place__new-tag">
          <h3 className="create-place__new-tag-title">Create a new tag</h3>
          <div className="create-place__row">
            <div className="create-place__field">
              <label>Tag name</label>
              <input
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="e.g. rooftop, vegan, live-music"
              />
            </div>
            <div className="create-place__field">
              <label>Parent tag (optional)</label>
              <select value={newTagParentId} onChange={e => setNewTagParentId(e.target.value)}>
                <option value="">No parent</option>
                {allTags.map(t => (
                  <option key={t.id} value={t.id}>{t.display_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer save button ───────────────────────────────────────────── */}
      <div className="create-place__footer">
        {error && <p className="create-place__error">{error}</p>}
        <button
          className="btn btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save place'}
        </button>
      </div>

    </div>
  )
}