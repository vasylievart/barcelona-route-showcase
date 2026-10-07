// app/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { PostCard } from '@/components/blog/PostCard'
import type { PostPreview } from '@/types/post'
import './blog.css'


export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Barcelona Guides & Travel Tips · Barcelona Route',
  description:
    'Local guides, restaurant recommendations, and itinerary ideas for your Barcelona trip.',
  alternates: { canonical: '/blog' }, 
  openGraph: {
    title: 'Barcelona Guides & Travel Tips',
    description:
      'Local guides, restaurant recommendations, and itinerary ideas for your Barcelona trip.',
    url: '/blog',
    type: 'website',
  },
}


const MAX_POSTS = 60

export default async function BlogPage() {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('id, slug, title, excerpt, cover_image, tags, published_at, read_time')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(MAX_POSTS)
    .returns<PostPreview[]>()

  if (error) {
    Sentry.captureException(error, { tags: { component: 'BlogPage' } })
 
    throw new Error(`Failed to load posts: ${error.message}`)
  }

  const posts = data ?? []
  const [featured, ...rest] = posts 

  return (
    <div className="blog-page">
      {/* Header */}
      <div className="blog-page__header">
        <Link href="/" className="legal__back">← Back to Barcelona Route</Link>
        <h1 className="blog-page__title">Barcelona Guides</h1>
        <p className="blog-page__subtitle">
          Local tips, hidden places, and itinerary ideas from someone who lives here.
        </p>
      </div>

      {/* Posts */}
      {!featured ? (
        <div className="blog-page__empty">
          <p>Articles coming soon — check back shortly.</p>
          <Link href="/" className="btn btn--primary">
            Back to home →
          </Link>
        </div>
      ) : (
        <>
          {/* Featured — first post larger */}
          <div className="blog-page__featured">
            <PostCard post={featured} featured={true} />
          </div>

          {/* Rest — grid */}
          {rest.length > 0 && (
            <div className="blog-page__grid">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}