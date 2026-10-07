import { supabaseAdmin }  from '@/lib/supabase/admin'
import { GuideCard }      from './GuideCard'
import type { GuidePreview } from '@/types/guide'
import './guide-carousel.css'

export async function GuidesCarousel() {
  const { data: guides } = await supabaseAdmin
    .from('guides')
    .select('id, slug, name, description, cover_image, category, district, duration_minutes, difficulty, is_free, route')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (!guides || guides.length === 0) return null

  return (
    <section className="guides-carousel">
      <div className="guides-carousel__header">
        <h2 className="guides-carousel__title">Barcelona district guides</h2>
        <p className="guides-carousel__sub">
          Included with every itinerary purchase
        </p>
      </div>
      <div className="guides-carousel__track">
        {guides.map((guide: GuidePreview) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </section>
  )
}