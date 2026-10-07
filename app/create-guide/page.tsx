'use client'
import { useState }     from 'react'
import { useRouter }    from 'next/navigation'
import ReactMarkdown    from 'react-markdown'
import remarkGfm        from 'remark-gfm'

import type { GuideStop } from '@/types/guide'
import './create-guide.css'
import { createClient } from '@/lib/supabase/client'


type EditorTab = 'write' | 'preview'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const EMPTY_STOP: GuideStop = {
  name: '', latitude: 0, longitude: 0, description: ''
}

// ── Markdown cheatsheet shown below the editor ──────────────────────────────
const CHEATSHEET = [
  { syntax: '# Heading',        result: 'Big heading'         },
  { syntax: '## Sub-heading',   result: 'Smaller heading'     },
  { syntax: '**bold**',         result: 'Bold text'           },
  { syntax: '*italic*',         result: 'Italic text'         },
  { syntax: '- item',           result: 'Bullet list'         },
  { syntax: '1. item',          result: 'Numbered list'       },
  { syntax: '> text',           result: 'Quote / tip block'   },
  { syntax: '---',              result: 'Divider line'        },
  { syntax: '[text](url)',       result: 'Link'                },
  { syntax: 'blank line',       result: 'New paragraph'       },
]

export default function CreateGuidePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Meta fields
  const [name,        setName]        = useState('')
  const [slug,        setSlug]        = useState('')
  const [description, setDescription] = useState('')  // ← now markdown
  const [descTab,     setDescTab]     = useState<EditorTab>('write')
  const [coverImage,  setCoverImage]  = useState('')
  const [category,    setCategory]    = useState('history')
  const [district,    setDistrict]    = useState('gothic')
  const [duration,    setDuration]    = useState(90)
  const [difficulty,  setDifficulty]  = useState('easy')
  const [isFree,      setIsFree]      = useState(false)
  const [published,   setPublished]   = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  // Stops
  const [stops, setStops] = useState<GuideStop[]>([{ ...EMPTY_STOP }])
  const [stopTabs, setStopTabs] = useState<EditorTab[]>(['write'])

  async function handleImageUpload(index: number, file: File) {
    if(!file) return
    setUploadingIndex(index)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('stopName', stops[index].name || `stop-${index + 1}`)

      const res = await fetch('/api/admin/upload-image', {method: 'POST', body: formData})
      const data = await res.json()

      if(data.url){
        updateStop(index, {image_url: data.url})
      }
    } finally {
      setUploadingIndex(null)
    }
  }

  function handleNameChange(value: string) {
    setName(value)
    if (!slug || slug === slugify(name)) setSlug(slugify(value))
  }

  function updateStop(index: number, patch: Partial<GuideStop>) {
    setStops(prev => prev.map((s, i) => i === index ? { ...s, ...patch } : s))
  }

  function addStop() {
    setStops(prev => [...prev, { ...EMPTY_STOP }])
    setStopTabs(prev => [...prev, 'write'])
  }

  function removeStop(index: number) {
    setStops(prev => prev.filter((_, i) => i !== index))
    setStopTabs(prev => prev.filter((_, i) => i !== index))
  }

  function setStopTab(index: number, tab: EditorTab) {
    setStopTabs(prev => prev.map((t, i) => i === index ? tab : t))
  }

  async function handleSave() {
    if (!name || !slug) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/admin/guides', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          name, slug, description,
          cover_image:      coverImage || null,
          category, district,
          duration_minutes: duration,
          difficulty,
          is_free:          isFree,
          published,
          route: stops.filter(s => s.name && s.latitude && s.longitude),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/guides/${data.slug}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="create-guide">

      {/* Header */}
      <div className="create-guide__header">
        <h1 className="create-guide__title">Create guide</h1>
        <div className="create-guide__actions">
          <label className="create-guide__toggle">
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
            />
            Published
          </label>
          <button
            className="btn btn--primary"
            onClick={handleSave}
            disabled={saving || !name || !slug}
          >
            {saving ? 'Saving…' : 'Save guide'}
          </button>
        </div>
      </div>

      {/* ── Meta fields ─────────────────────────────────────────────────── */}
      <section className="create-guide__section">
        <h2 className="create-guide__section-title">Details</h2>

        <div className="create-guide__field">
          <label>Guide name</label>
          <input
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Gothic Quarter essentials"
          />
        </div>

        <div className="create-guide__field">
          <label>Slug</label>
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="gothic-quarter-essentials"
          />
        </div>

        {/* ── Description with markdown editor ──────────────────────── */}
        <div className="create-guide__field">
          <label>Description</label>

          {/* Tab switcher */}
          <div className="md-editor__tabs">
            <button
              className={`md-editor__tab ${descTab === 'write' ? 'md-editor__tab--active' : ''}`}
              onClick={() => setDescTab('write')}
              type="button"
            >
              Write
            </button>
            <button
              className={`md-editor__tab ${descTab === 'preview' ? 'md-editor__tab--active' : ''}`}
              onClick={() => setDescTab('preview')}
              type="button"
            >
              Preview
            </button>
          </div>

          {descTab === 'write' ? (
            <textarea
              className="md-editor__textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={`Walk through 2,000 years of history in Barcelona's oldest neighbourhood.\n\n## What you'll see\n\n- Roman ruins hidden in plain sight\n- Medieval streets most tourists never find\n\n> Local tip: go early morning before the crowds arrive.`}
              rows={8}
            />
          ) : (
            <div className="md-editor__preview">
              {description
                ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {description}
                  </ReactMarkdown>
                )
                : <p className="md-editor__preview-empty">Nothing to preview yet.</p>
              }
            </div>
          )}

          {/* Cheatsheet */}
          {descTab === 'write' && (
            <div className="md-editor__cheatsheet">
              {CHEATSHEET.map(item => (
                <div key={item.syntax} className="md-editor__cheatsheet-row">
                  <code className="md-editor__cheatsheet-syntax">{item.syntax}</code>
                  <span className="md-editor__cheatsheet-result">{item.result}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rest of meta fields unchanged */}
        <div className="create-guide__row">
          <div className="create-guide__field">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {['history','food','architecture','art','nightlife','nature','shopping']
                .map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="create-guide__field">
            <label>District</label>
            <select value={district} onChange={e => setDistrict(e.target.value)}>
              {['gothic','born','eixample','gràcia','montjuïc','barceloneta','poblenou','sant-antoni']
                .map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="create-guide__row">
          <div className="create-guide__field">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
            />
          </div>
          <div className="create-guide__field">
            <label>Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
            </select>
          </div>
        </div>

        <div className="create-guide__field">
          <label>Cover image URL</label>
          <input
            value={coverImage}
            onChange={e => setCoverImage(e.target.value)}
            placeholder="https://...supabase.co/storage/..."
          />
        </div>

        <label className="create-guide__checkbox">
          <input
            type="checkbox"
            checked={isFree}
            onChange={e => setIsFree(e.target.checked)}
          />
          Free preview (visible without purchase)
        </label>
      </section>

      {/* ── Stops with per-stop markdown description ────────────────────── */}
      <section className="create-guide__section">
        <h2 className="create-guide__section-title">Stops ({stops.length})</h2>

        {stops.map((stop, i) => (
          <div key={i} className="create-guide__stop">
            <div className="create-guide__stop-header">
              <span className="create-guide__stop-num">{i + 1}</span>
              <button
                className="create-guide__stop-remove"
                onClick={() => removeStop(i)}
                disabled={stops.length === 1}
              >
                Remove
              </button>
            </div>

            <div className="create-guide__field">
              <label>Place name</label>
              <input
                value={stop.name}
                onChange={e => updateStop(i, { name: e.target.value })}
                placeholder="Plaça de Sant Jaume"
              />
            </div>

            <div className="create-guide__row">
              <div className="create-guide__field">
                <label>Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={stop.latitude || ''}
                  onChange={e => updateStop(i, { latitude: parseFloat(e.target.value) })}
                  placeholder="41.382548"
                />
              </div>
              <div className="create-guide__field">
                <label>Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={stop.longitude || ''}
                  onChange={e => updateStop(i, { longitude: parseFloat(e.target.value) })}
                  placeholder="2.176899"
                />
              </div>
            </div>

            {/* Stop description — also markdown */}
            <div className="create-guide__field">
              <label>Description</label>
              <div className="md-editor__tabs md-editor__tabs--small">
                <button
                  className={`md-editor__tab ${stopTabs[i] === 'write' ? 'md-editor__tab--active' : ''}`}
                  onClick={() => setStopTab(i, 'write')}
                  type="button"
                >
                  Write
                </button>
                <button
                  className={`md-editor__tab ${stopTabs[i] === 'preview' ? 'md-editor__tab--active' : ''}`}
                  onClick={() => setStopTab(i, 'preview')}
                  type="button"
                >
                  Preview
                </button>
              </div>
              <div className="create-guide__field">
                <label>Stop photo</label>
                {stop.image_url && (
                <div className="create-guide__img-preview">
                  <img src={stop.image_url} alt={stop.name}/>
                  <button
                    type="button"
                    className="create-guide__img-remove"
                    onClick={() => updateStop(i, { image_url: undefined })}
                  >
                    Remove
                  </button>
                </div>
              )}
                {!stop.image_url && (
                  <label className="create-guide__img-upload">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(i, file)
                      }}
                    />
                    {uploadingIndex === i ? (
                      <span className="create-guide__img-uploading">Uploading…</span>
                    ) : (
                      <span className="create-guide__img-placeholder">
                        + Add photo
                      </span>
                    )}
                  </label>
                )}
                
              </div>
              

              {stopTabs[i] === 'write' ? (
                <textarea
                  className="md-editor__textarea md-editor__textarea--small"
                  value={stop.description}
                  onChange={e => updateStop(i, { description: e.target.value })}
                  rows={4}
                  placeholder="What makes this place worth stopping for? Use **bold** for emphasis."
                />
              ) : (
                <div className="md-editor__preview md-editor__preview--small">
                  {stop.description
                    ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {stop.description}
                      </ReactMarkdown>
                    )
                    : <p className="md-editor__preview-empty">Nothing to preview.</p>
                  }
                </div>
              )}
            </div>

            <div className="create-guide__field">
              <label>Local tip (optional)</label>
              <input
                value={stop.local_tip ?? ''}
                onChange={e => updateStop(i, { local_tip: e.target.value })}
                placeholder="Best photographed from the north side at golden hour"
              />
            </div>
          </div>
        ))}

        <button className="create-guide__add-stop" onClick={addStop}>
          + Add stop
        </button>
      </section>

    </div>
  )
}