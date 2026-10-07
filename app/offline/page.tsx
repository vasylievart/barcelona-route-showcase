import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      fontFamily: 'Georgia, serif',
      background: '#FAF7F2',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
      <h1 style={{ color: '#1B2B4B', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
        You&apos;re offline
      </h1>
      <p style={{ color: '#6B7A94', lineHeight: 1.6, maxWidth: '32ch', marginBottom: '2rem' }}>
        No internet connection. If you already unlocked your route,
        it should be available in your browser cache.
      </p>
      <Link href="/itinerary" style={{
        background: '#C4622D', color: 'white',
        padding: '0.875rem 2rem', borderRadius: '12px',
        textDecoration: 'none', fontFamily: 'DM Sans, sans-serif',
      }}>
        Try my saved route
      </Link>
    </div>
  )
}