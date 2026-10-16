import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../lib/scroll'

const R = 30
const C = 2 * Math.PI * R

export default function Ring({ label, value, max, suffix, color, delay = 0 }) {
  const ref = useRef(null)
  const offset = C * (1 - value / max)

  useGSAP(() => {
    if (prefersReducedMotion()) return
    const num = ref.current.querySelector('.ring-num')
    const count = { v: 0 }
    gsap.fromTo('.arc', { strokeDashoffset: C }, { strokeDashoffset: offset, duration: 2.2, delay, ease: 'expo.out' })
    gsap.to(count, {
      v: value,
      duration: 2.2,
      delay,
      ease: 'expo.out',
      onUpdate: () => (num.textContent = Math.round(count.v) + suffix),
    })
  }, { scope: ref })

  return (
    <div className="ring-inner glass" ref={ref}>
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r={R} className="track" />
        <circle
          cx="40" cy="40" r={R}
          className="arc"
          style={{ stroke: `var(--${color})`, strokeDasharray: C, strokeDashoffset: offset }}
        />
      </svg>
      <span className="ring-num">{value}{suffix}</span>
      <span className="ring-label">{label}</span>
    </div>
  )
}
