import Link from 'next/link'
import "./hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__eyebrow">Barcelona · 2026</div>
      <h1 className="hero__title">
        Your perfect day<br />
        <em>in Barcelona</em><br />
        starts here.
      </h1>
      <p className="hero__subtitle">
        Tell us where you&apos;re staying and what you love —
        we&apos;ll build your ideal route in 30 seconds.
      </p>
      <Link href="/plan" className="btn btn--primary btn--large">
        Build my itinerary
      </Link>
      <p className="hero__note">No account needed · From €2.99</p>

      {/* Background decoration */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__bg-circle hero__bg-circle--1" />
        <div className="hero__bg-circle hero__bg-circle--2" />
      </div>
    </section>
  )
}