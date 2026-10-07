import "./trust-bar.css";

export function TrustBar() {
  return (
    <div className="trust">
      <div className="trust__item">
        <span className="trust__number">361+</span>
        <span className="trust__label">verified Barcelona places</span>
      </div>
      <div className="trust__divider" />
      <div className="trust__item">
        <span className="trust__number">30s</span>
        <span className="trust__label">to generate your route</span>
      </div>
      <div className="trust__divider" />
      <div className="trust__item">
        <span className="trust__number">€2.99</span>
        <span className="trust__label">to unlock your full day</span>
      </div>
    </div>
  )
}