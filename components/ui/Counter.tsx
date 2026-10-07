// components/ui/Counter.tsx
//
// Reusable counter per GroupStep spec Rule 1: {label, value, onChange}.
// `min`/`max` are optional and not part of the required 3 props — they're
// plain defaults, used here to enforce Rule 7's `disabledPeople <= group`.

'use client'

import { Minus, Plus } from 'lucide-react'

interface CounterProps {
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
}

export function Counter({ label, value, onChange, min = 0, max }: CounterProps) {
  const atMin = value <= min
  const atMax = max !== undefined && value >= max

  const decrement = () => {
    if (!atMin) onChange(value - 1)
  }
  const increment = () => {
    if (!atMax) onChange(value + 1)
  }

  return (
    <div className="counter">
      <span className="counter__label">{label}</span>
      <div className="counter__controls">
        <button
          type="button"
          className="counter__btn"
          onClick={decrement}
          disabled={atMin}
          aria-label={`Decrease ${label}`}
        >
          <Minus size={16} />
        </button>
        <span className="counter__value">{value}</span>
        <button
          type="button"
          className="counter__btn"
          onClick={increment}
          disabled={atMax}
          aria-label={`Increase ${label}`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}