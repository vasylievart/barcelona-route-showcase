import type { MetadataRoute } from 'next'
import * as Sentry from '@sentry/nextjs'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const revalidate = 3600

const BASE_URL = 'https://barcelonaroute.com'

const STATIC_LAST_MODIFIED = new Date('2026-10-01')

function safeDate(...values: (string | null | undefined)[]): Date | undefined {
  for (const v of values) {
    if (!v) continue
    const d = new Date(v)
    if (!Number.isNaN(d.getTime())) return d
  }
  return undefined
}

type PostRow = { slug: string; published_at: string | null; updated_at: string | null }
type GuideRow = { slug: string }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let postUrls: MetadataRoute.Sitemap = []
  let guideUrls: MetadataRoute.Sitemap = []

  const [postsRes, guidesRes] = await Promise.all([
    supabaseAdmin
      .from('posts')
      .select('slug, published_at, updated_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .returns<PostRow[]>(),
    supabaseAdmin
      .from('guides')
      .select('slug')
      .eq('published', true)
      .returns<GuideRow[]>(),
  ]).catch((err) => {
    Sentry.captureException(err, { tags: { component: 'sitemap' } })
    return [null, null] as const
  })

  if (postsRes?.error) {
    Sentry.captureException(postsRes.error, { tags: { component: 'sitemap.posts' } })
  } else if (postsRes?.data) {
    postUrls = postsRes.data.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: safeDate(post.updated_at, post.published_at),
    }))
  }

  if (guidesRes?.error) {
    Sentry.captureException(guidesRes.error, { tags: { component: 'sitemap.guides' } })
  } else if (guidesRes?.data) {
    guideUrls = guidesRes.data.map((g) => ({
      url: `${BASE_URL}/guides/${g.slug}`,
      // no lastModified: add it when the guides table has a reliable updated_at
    }))
  }


  return [
    { url: BASE_URL, lastModified: STATIC_LAST_MODIFIED },
    { url: `${BASE_URL}/plan`, lastModified: STATIC_LAST_MODIFIED },
    { url: `${BASE_URL}/blog`, lastModified: postUrls[0]?.lastModified ?? STATIC_LAST_MODIFIED },
    { url: `${BASE_URL}/privacy`, lastModified: STATIC_LAST_MODIFIED },
    { url: `${BASE_URL}/terms`, lastModified: STATIC_LAST_MODIFIED },
    ...postUrls,
    ...guideUrls,
  ]
}