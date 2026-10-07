// app/guides/[slug]/page.tsx
import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { GuideView } from '@/components/guides/GuideView'
import { getWalkingRoute } from '@/lib/getWalkingRoute'
import './guide.css'

export const revalidate = 86400

type Params = { params: Promise<{ slug: string }> }

const getGuide = cache(async (slug: string) => {
  const { data, error } = await supabaseAdmin
    .from('guides')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    Sentry.captureException(error, { tags: { component: 'GuidePage' }, extra: { slug } })
    throw new Error(`Failed to load guide "${slug}": ${error.message}`)
  }
  return data
})

export async function generateStaticParams() {
  const { data, error } = await supabaseAdmin
    .from('guides')
    .select('slug')
    .eq('published', true)

  if (error) {
    Sentry.captureException(error, { tags: { component: 'GuidePage.generateStaticParams' } })
    return [] // pages will be rendered on demand
  }
  return (data ?? []).map(({ slug }: { slug: string }) => ({ slug }))
}

function plainDescription(md?: string | null) {
  if (!md) return undefined
  return md
    .replace(/[*_#>`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuide(slug)

  if (!guide) return { title: 'Guide not found', robots: { index: false } }

  const description = plainDescription(guide.description)
  return {
    title: `${guide.name} · Barcelona Route`,
    description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.name,
      description,
      url: `/guides/${guide.slug}`,
      type: 'article',
    },
  }
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params
  const guide = await getGuide(slug)

  if (!guide) notFound()

  let walkingRoute: [number, number][] = []
  if (Array.isArray(guide.route) && guide.route.length >= 2) {
    try {
      walkingRoute = await getWalkingRoute(
        guide.route.map((s: { latitude: number; longitude: number }) => ({
          lat: s.latitude,
          lng: s.longitude,
        }))
      )
    } catch (err) {
      Sentry.captureException(err, {
        tags: { component: 'GuidePage', step: 'getWalkingRoute' },
        extra: { slug },
      })
    }
  }

  return (
    <>
      <Link href="/" className="guide-page__back">
        ← Back to Barcelona Route
      </Link>
      <GuideView guide={guide} walkingRoute={walkingRoute} />
    </>
  )
}