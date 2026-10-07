export function EmptyRoute() {
  return (
    <div className="error-state">
      <div className="error-state__icon">🗺️</div>
      <h2 className="error-state__title">
        We couldn&apos;t build a route for these preferences
      </h2>
      <p className="error-state__message">
        Try broadening your interests or adjusting your budget.
        Barcelona has something for everyone — we&apos;ll find it.
      </p>
      <a href="/plan" className="btn btn--primary">
        Try different preferences
      </a>
    </div>
  )
}