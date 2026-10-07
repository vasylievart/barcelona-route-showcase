'use client'
import "./sample-route.css"

const SAMPLE_STEPS = [
  { time: '08:30', type: 'breakfast',  name: 'Kafenion Barcelona',    desc: 'Specialty coffee & pastries',         cost: '€12', walk: null     },
  { time: '10:00', type: 'attraction', name: 'Casa Batlló',           desc: 'Gaudí\'s masterpiece on Passeig',     cost: '€35', walk: '4 min'  },
  { time: '12:00', type: 'attraction', name: 'La Pedrera',            desc: 'Rooftop warriors & art nouveau',      cost: '€25', walk: '8 min'  },
  { time: '13:30', type: 'lunch',      name: 'Cervecería Catalana',   desc: 'Tapas & cold beer — locals love it',  cost: '€22', walk: '6 min'  },
  { time: '15:30', type: 'attraction', name: 'Palau de la Música',    desc: 'Art nouveau concert hall',            cost: '€18', walk: '15 min' },
  { time: '17:30', type: 'coffee',     name: 'Nomad Coffee Bar',      desc: 'Barcelona\'s best specialty roaster', cost: '€6',  walk: '12 min' },
  { time: '20:00', type: 'dinner',     name: 'El Nacional Barcelona', desc: 'Four restaurants under one roof',     cost: '€32', walk: '10 min' },
]

const TYPE_COLOURS: Record<string, string> = {
  breakfast:  '#E8896A',
  attraction: '#1B2B4B',
  lunch:      '#C4622D',
  coffee:     '#D4A853',
  dinner:     '#2D4270',
  event:      '#2D7D5A',
}

export function SampleRoute() {
  return (
    <section className="sample">
      <div className="sample__header">
        <span className="sample__tag">Example route</span>
        <h2 className="sample__title">
          A real day in Barcelona,<br />built by our algorithm
        </h2>
        <p className="sample__subtitle">
          Your route will be personalised to your hotel, interests and budget.
        </p>
      </div>

      <div className="sample__timeline">
        {SAMPLE_STEPS.map((step, i) => (
          <div key={i} className="sample__step">
            <div className="sample__step-time">{step.time}</div>
            <div className="sample__step-connector">
              <div
                className="sample__step-dot"
                style={{ background: TYPE_COLOURS[step.type] }}
              />
              {i < SAMPLE_STEPS.length - 1 && (
                <div className="sample__step-line" />
              )}
            </div>
            <div className="sample__step-content">
              <div className="sample__step-type">{step.type}</div>
              <div className="sample__step-name">{step.name}</div>
              <div className="sample__step-desc">{step.desc}</div>
              <div className="sample__step-meta">
                <span className="sample__step-cost">{step.cost}</span>
                {step.walk && (
                  <span className="sample__step-walk">🚶 {step.walk}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sample__total">
        Total estimated cost: <strong>€150</strong> for a full day
      </div>
    </section>
  )
}