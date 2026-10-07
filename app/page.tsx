import { NewestPosts } from '@/components/blog/NewestPosts'
import { GuidesCarousel } from '@/components/guides/GuideCarusel'
import FinalCTA from '@/components/landing-page/FinalCTA'
import Hero from '@/components/landing-page/Hero'
import HowItWorks from '@/components/landing-page/HowItWorks'
import Promo from '@/components/landing/Promo'


import { SampleRoute } from '@/components/landing/SampleRoute'
import { TrustBar } from '@/components/landing/TrustBar'
import { ReviewDisplay } from '@/components/reviews/ReviewDisplay'
import { Suspense } from 'react'




export default function LandingPage() {
   const structuredData = {
    '@context':           'https://schema.org',
    '@type':              'WebApplication',
    name:                 'Barcelona Route',
    description:          'Personalised Barcelona itinerary generator',
    url:                  'https://barcelonaroute.com',
    applicationCategory:  'TravelApplication',
    operatingSystem:      'Web',
    offers: {
      '@type':        'Offer',
      price:          '2.99',
      priceCurrency:  'EUR',
    },
    aggregateRating: {
      '@type':       'AggregateRating',
      ratingValue:   '4.8',
      reviewCount:   '12',    // update as reviews grow
    },
  }
  
  return (
    <>
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      <main className="landing">
        <Hero />
        <NewestPosts />
        <Promo/>
        <SampleRoute />
        <HowItWorks />
        <Suspense fallback={null}>
          <ReviewDisplay/>
          <GuidesCarousel/>
        </Suspense>
        <TrustBar />
        <FinalCTA />
      </main>
    </>
    
  )
}





