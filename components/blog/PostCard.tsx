import Link         from 'next/link'
import type { PostPreview } from '@/types/post'


interface Props {
  post:     PostPreview
  featured?: boolean
}

export function PostCard({ post, featured = false }: Props) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : ''

  return (
    <Link href={`/blog/${post.slug}`} className={`post-card ${featured ? 'post-card--featured' : ''}`}>
      {post.cover_image && (
        <div className="post-card__image-wrap">
          <img
            src={post.cover_image}
            alt={post.title}
            className="post-card__image"
          />
        </div>
      )}
      <div className="post-card__body">
        <div className="post-card__meta">
          {post.tags.slice(0, 2).map(tag => (
            <span key={tag} className="post-card__tag">{tag}</span>
          ))}
          <span className="post-card__read-time">{post.read_time} min</span>
        </div>
        <h3 className="post-card__title">{post.title}</h3>
        <p className="post-card__excerpt">{post.excerpt}</p>
        {date && <span className="post-card__date">{date}</span>}
      </div>
    </Link>
  )
}