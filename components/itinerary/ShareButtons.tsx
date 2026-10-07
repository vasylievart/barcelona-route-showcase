'use client'
import { useState } from 'react'
import './share-button.css'

interface Props {
  tripId: string
  days:   number
  stops:  number
}

export function ShareButtons({ tripId, days, stops }: Props) {
  const [copied, setCopied] = useState(false)

  const url  = `${typeof window !== 'undefined' ? window.location.origin : ''}/itinerary/${tripId}`
  const text = `Just planned my perfect ${days}-day Barcelona trip — ${stops} stops picked just for me 🗺️`

  const links = [
    {
      name:    'WhatsApp',
      icon:    "/social-media-icons/whatsapp.svg",
      color:   '#25D366',
      href:    `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    },
    {
      name:    'X',
      icon:    "/social-media-icons/twitter-x.svg",
      color:   '#000000',
      href:    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      name:    'Facebook',
      icon:    "/social-media-icons/facebook.svg",
      alt:     "Falcebook icon",
      color:   '#1877F2',
      href:    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name:    'Instagram',
      icon:    "/social-media-icons/instagram.svg",
      color:   '#000000',
      // Instagram doesn't support direct URL sharing — open profile instead
      href:    `https://www.instagram.com/`,
      note:    'Copy link and share in Stories',
    },
  ]

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="share">
      <h3 className="share__title">Share your route</h3>
      <p className="share__desc">
        Let friends know how you&apos;re exploring Barcelona
      </p>

      <div className="share__buttons">
        {links.map(link => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="share__btn"
            style={{ '--share-color': link.color } as React.CSSProperties}
            title={link.note ?? link.name}
          > 
            <img src={link.icon} alt={link.alt} />
          </a>
        ))}

        <button
          className="share__btn share__btn--copy"
          onClick={handleCopy}
        >
          <span className="share__btn-icon">{copied ? '✓' : '🔗'}</span>
          <span className="share__btn-name">
            {copied ? 'Copied!' : 'Copy link'}
          </span>
        </button>
      </div>
    </div>
  )
}