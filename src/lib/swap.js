import gsap from 'gsap'
import { prefersReducedMotion } from './scroll'

// Scroll decides *which* item is active; the swap itself plays on the clock and
// always finishes. Scrubbing text straight from scroll position let it freeze
// half-masked whenever the reader stopped mid-transition.

const k = () => (prefersReducedMotion() ? 0 : 1)

const parts = (el, fadeSel) => [el.querySelectorAll('.ln > span'), el.querySelectorAll(fadeSel)]

export function textHide(el, fadeSel) {
  const [lines, fades] = parts(el, fadeSel)
  gsap.killTweensOf([...lines, ...fades])
  gsap.set(lines, { yPercent: 140, opacity: 1 })
  gsap.set(fades, { opacity: 0, y: 16 })
}

// dir = 1 when moving forward (text leaves upward), -1 when scrolling back.
export function textOut(el, fadeSel, dir = 1) {
  const [lines, fades] = parts(el, fadeSel)
  gsap.to(lines, { yPercent: -140 * dir, opacity: 0, duration: 0.45 * k(), stagger: 0.04, ease: 'power2.in', overwrite: true })
  gsap.to(fades, { opacity: 0, y: -16 * dir, duration: 0.35 * k(), overwrite: true })
}

export function textIn(el, fadeSel, dir = 1, delay = 0.25) {
  const [lines, fades] = parts(el, fadeSel)
  gsap.fromTo(lines, { yPercent: 140 * dir, opacity: 1 }, {
    yPercent: 0, duration: 0.9 * k(), stagger: 0.08, ease: 'expo.out', delay: delay * k(), overwrite: true,
  })
  gsap.fromTo(fades, { opacity: 0, y: 16 * dir }, {
    opacity: 1, y: 0, duration: 0.6 * k(), stagger: 0.07, ease: 'power2.out', delay: (delay + 0.1) * k(), overwrite: true,
  })
}

// Map scroll progress (0–1) onto `count` equal slots.
export const slotOf = (progress, count) => Math.min(count - 1, Math.max(0, Math.floor(progress * count)))

// Tracks the active index and calls onChange(next, prev, dir) only when it moves.
export function stepper(onChange) {
  let cur = -1
  return {
    get current() {
      return cur
    },
    go(next) {
      if (next === cur) return
      const prev = cur
      cur = next
      onChange(next, prev, next > prev ? 1 : -1)
    },
  }
}

export const swapDuration = k
