import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../lib/scroll'

// A soft teal light that trails the pointer. Mouse-only; skipped for touch and reduced motion.
export default function Cursor() {
  const ref = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = ref.current
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 })
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' })
    const move = (e) => {
      gsap.to(el, { opacity: 1, duration: 0.4, overwrite: 'auto' })
      xTo(e.clientX)
      yTo(e.clientY)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  })

  return <div className="cursor-glow" ref={ref} aria-hidden="true" />
}
