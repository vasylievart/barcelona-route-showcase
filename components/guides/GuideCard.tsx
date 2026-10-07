import Link from 'next/link'
import type { GuidePreview } from '@/types/guide'
import './guide-card.css'

const CATEGORY_ICONS: Record<string, string> = {
  history:      '🏛',
  food:         '🍷',
  architecture: '🏗',
  art:          '🎨',
  nightlife:    '🌙',
  nature:       '🌿',
  shopping:     '🛍',
}

interface Props {
  guide: GuidePreview
}

export function GuideCard({ guide }: Props) {
  const stopCount = guide.route?.length ?? 0

  return (
    <Link href={`/guides/${guide.slug}`} className="guide-card">
      <div className="guide-card__thumb">
        {guide.cover_image
          ? <img src={guide.cover_image} alt={guide.name} className="guide-card__img" />
          : <span className="guide-card__icon">{CATEGORY_ICONS[guide.category ?? ''] ?? '🗺'}</span>
        }
        <span className="guide-card__stops-badge">{stopCount} stops</span>
        {!guide.is_free && (
          <span className="guide-card__locked-badge">Included</span>
        )}
      </div>
      <div className="guide-card__body">
        <div className="guide-card__name">{guide.name}</div>
        <div className="guide-card__meta">
          {guide.category} · {guide.duration_minutes} min · {guide.difficulty}
        </div>
      </div>
    </Link>
  )
}