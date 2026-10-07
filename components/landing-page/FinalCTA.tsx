import "./final-cta.css";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="final-cta">
      <h2 className="final-cta__title">Ready to explore Barcelona?</h2>
      <Link href="/plan" className="btn btn--primary btn--large">
        Start planning — it&apos;s free
      </Link>
    </section>
  )
}