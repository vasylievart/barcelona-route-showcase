import "./how-it-works.css";

export default function HowItWorks() {
  const steps = [
    { n: '01', title: 'Share your hotel', desc: 'We start every route from your accommodation.' },
    { n: '02', title: 'Pick your vibe',   desc: 'History, food, art, nightlife — you choose.' },
    { n: '03', title: 'Get your route',   desc: 'A full day, timed and mapped, in 30 seconds.' },
  ]
  return (
    <section className="how">
      <h2 className="how__title">How it works</h2>
      <div className="how__steps">
        {steps.map(s => (
          <div key={s.n} className="how__step">
            <span className="how__step-n">{s.n}</span>
            <h3 className="how__step-title">{s.title}</h3>
            <p className="how__step-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}