import { supabaseAdmin } from '@/lib/supabase/admin'
import './review-display.css'

interface Review {
  id:         string
  rating:     number
  comment:    string | null
  user_email: string
  created_at: string
}

async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('id, rating, comment, user_email, created_at')
    .not('comment', 'is', null)
    .not('comment', 'eq', '')
    .gte('rating', 4)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Reviews fetch error:', error.message)
    return []
  }

  return data ?? []
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="review-card__stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={`review-card__star ${n <= rating ? 'review-card__star--filled' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function anonymiseEmail(email: string): string {
  const [name] = email.split('@')
  if (name.length <= 2) return `${name[0]}***`
  return `${name[0]}${name[1]}***`
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', {
    month: 'short',
    year:  'numeric',
  })
}

export async function ReviewDisplay() {
  const reviews = await getReviews()

  if (reviews.length === 0) return null

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  
  return (
    <section className="reviews">
      <div className="reviews__inner">

        <div className="reviews__header">
          <div className="reviews__aggregate">
            <span className="reviews__avg">{avgRating.toFixed(1)}</span>
            <div>
              <StarRating rating={Math.round(avgRating)} />
              <p className="reviews__count">
                Based on {reviews.length} review{reviews.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="reviews__header-text">
            <h2 className="reviews__title">What travellers say</h2>
            <p className="reviews__subtitle">
              Real feedback from people who explored Barcelona with us
            </p>
          </div>
        </div>

        <div className="reviews__grid">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <StarRating rating={review.rating} />
              <p className="review-card__comment">&ldquo;{review.comment}&rdquo;</p>
              <div className="review-card__footer">
                <span className="review-card__author">
                  {anonymiseEmail(review.user_email)}
                </span>
                <span className="review-card__date">
                  {formatDate(review.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}