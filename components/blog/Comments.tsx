'use client'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import './comments.css'

interface Comment {
  id:         string
  user_name:  string | null
  user_email: string
  body:       string
  created_at: string
}

interface Props {
  slug: string
}

export function Comments({ slug }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [user,     setUser]     = useState<any>(null)
  const [body,     setBody]     = useState('')
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Load approved comments
    supabase
      .from('post_comments')
      .select('id, user_name, user_email, body, created_at')
      .eq('post_slug', slug)
      .eq('approved', true)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setComments(data ?? [])
        setLoading(false)
      })

    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    )

    return () => subscription.unsubscribe()
  }, [slug])

  async function handleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/blog/${slug}`,
      },
    })
  }

  async function handleSubmit() {
    if (!body.trim() || !user) return
    setSaving(true)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    try {
      const res = await fetch('/api/comments', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { 'Authorization': `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ slug, body: body.trim() }),
      })

      if (res.ok) {
        setBody('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 4000)
      }
    } catch (err) {
      console.error('Comment submit error:', err)
    } finally {
      setSaving(false)
    }
  }

  const displayName = (c: Comment) =>
    c.user_name ?? c.user_email.split('@')[0]

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })

  return (
    <div className="comments">
      <h3 className="comments__title">
        {comments.length > 0
          ? `${comments.length} comment${comments.length > 1 ? 's' : ''}`
          : 'Comments'
        }
      </h3>

      {/* Comment list */}
      {loading ? (
        <p className="comments__loading">Loading comments...</p>
      ) : comments.length > 0 ? (
        <div className="comments__list">
          {comments.map(c => (
            <div key={c.id} className="comment">
              <div className="comment__avatar">
                {displayName(c)[0].toUpperCase()}
              </div>
              <div className="comment__body">
                <div className="comment__meta">
                  <span className="comment__name">{displayName(c)}</span>
                  <span className="comment__date">{formatDate(c.created_at)}</span>
                </div>
                <p className="comment__text">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="comments__empty">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

      {/* Submit form */}
      <div className="comments__form">
        {user ? (
          <>
            <div className="comments__form-header">
              <span className="comments__form-user">
                Commenting as <strong>{user.email?.split('@')[0]}</strong>
              </span>
            </div>
            <textarea
              className="comments__textarea"
              placeholder="Share your thoughts..."
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
            />
            {success && (
              <p className="comments__success">
                ✓ Comment submitted — it will appear after review
              </p>
            )}
            <button
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={!body.trim() || saving}
            >
              {saving ? 'Submitting...' : 'Post comment'}
            </button>
          </>
        ) : (
          <div className="comments__login">
            <p>Sign in to leave a comment</p>
            <button
              className="btn btn--primary"
              onClick={handleLogin}
            >
              Sign in with Google →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}