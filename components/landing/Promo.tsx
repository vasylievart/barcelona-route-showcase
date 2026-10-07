export default function Promo() {
  return (
    <main style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', color: '#1B2B4B' }}>
        Barcelona Itinerary Generator
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#6B7A94', lineHeight: 1.7, margin: '1rem 0 2rem' }}>
        Stop spending hours planning. Tell us where you&apos;re staying,
        what you love, and your budget — we build your perfect Barcelona day in 30 seconds.
      </p>
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2B4B' }}>
          What makes our itineraries different
        </h2>
        <ul style={{ color: '#6B7A94', lineHeight: 2, marginTop: '1rem' }}>
          <li>Routes start from your actual hotel — not the city centre</li>
          <li>Opening hours checked — no closed museums on your route</li>
          <li>Budget tracked in real time — no nasty surprises</li>
          <li>Built by a Barcelona local with restaurant industry experience</li>
          <li>Includes hidden gems you won&apos;t find on TripAdvisor</li>
        </ul>
      </section>
    </main>
  )
}