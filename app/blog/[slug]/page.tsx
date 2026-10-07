// app/blog/[slug]/page.tsx
import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import * as Sentry from '@sentry/nextjs'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { PostPreview } from '@/types/post'
import { MarkdownRenderer } from '@/components/blog/MarkdownRender'
import { PostCard } from '@/components/blog/PostCard'
import { Comments } from '@/components/blog/Comments'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

const SITE_URL = 'https://barcelonaroute.com'

const getPost = cache(async (slug: string) => {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    Sentry.captureException(error, { tags: { component: 'PostPage' }, extra: { slug } })
    throw new Error(`Failed to load post "${slug}": ${error.message}`)
  }
  return data
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) return { title: 'Post not found', robots: { index: false } }

  const url = `${SITE_URL}/blog/${post.slug}`

  return {
    title: `${post.title} · Barcelona Route`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [post.cover_image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  // FIX 7: tags can be null in the DB
  const tags: string[] = post.tags ?? []

  let related: PostPreview[] = []
  if (tags.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('id, slug, title, excerpt, cover_image, tags, published_at, read_time')
      .eq('published', true)
      .neq('slug', slug)
      .overlaps('tags', tags)
      .order('published_at', { ascending: false })
      .limit(3)
      .returns<PostPreview[]>()

   
    if (error) Sentry.captureException(error, { tags: { component: 'PostPage.related' } })
    related = data ?? []
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Madrid',
      })
    : ''

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at ?? undefined,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    author: { '@type': 'Organization', name: 'Barcelona Route' },
    publisher: { '@type': 'Organization', name: 'Barcelona Route' },
  }

  return (
    <article className="post">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Hero */}
      <div className="post__hero">
        {post.cover_image && (
   
          <Image
            src={post.cover_image}
            alt={post.title}
            width={1200}
            height={630}
            priority
            className="post__cover"
          />
        )}
        <div className="post__hero-content">
          <div className="post__meta">
            {tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="post__tag">{tag}</span>
            ))}
            <span className="post__read-time">{post.read_time} min read</span>
            {formattedDate && <span className="post__date">{formattedDate}</span>}
          </div>
          <h1 className="post__title">{post.title}</h1>
          <p className="post__excerpt">{post.excerpt}</p>
        </div>
      </div>

      {/* Content */}
      <div className="post__content">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* CTA — encourage people to generate a route */}
      <div className="post__cta">
        <h3 className="post__cta-title">Ready to explore Barcelona?</h3>
        <p className="post__cta-desc">
          Build your personalised itinerary in 30 seconds — starting from your hotel.
        </p>
    
        <Link href="/plan" className="btn btn--primary">
          Build my Barcelona route →
        </Link>
      </div>

      <div className="comments">
        <h3 className="comments__title">Comments</h3>
        <Comments slug={post.slug} />
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="post__related">
          <h3 className="post__related-title">Related articles</h3>
          <div className="post__related-grid">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}


export async function generateStaticParams() {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('slug')
    .eq('published', true)

  if (error) {
    // Do not fail the whole build because of this; pages will render on demand.
    Sentry.captureException(error, { tags: { component: 'PostPage.generateStaticParams' } })
    return []
  }
  return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }))
}