import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, useGSAP)
// Shared helpers animate optional parts (e.g. .bar on screens that have none); empty is fine.
gsap.config({ nullTargetWarn: false })

let lenis = null

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Lenis drives the scroll; GSAP's ticker drives Lenis so pinned scrub timelines stay in sync.
export function startSmoothScroll() {
  if (prefersReducedMotion()) return () => {}
  lenis = new Lenis({ lerp: 0.09 })
  if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis, __ST: ScrollTrigger, __gsap: gsap })
  lenis.on('scroll', ScrollTrigger.update)
  const raf = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(raf)
    lenis.destroy()
    lenis = null
  }
}

export function scrollTo(target) {
  if (lenis) lenis.scrollTo(target, { duration: 1.8 })
  else document.querySelector(target)?.scrollIntoView()
}

// Instant jump to a y offset or a '#section' selector.
export function jumpTo(target) {
  if (lenis) {
    lenis.resize()
    lenis.scrollTo(target, { immediate: true, force: true })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView()
  } else {
    window.scrollTo(0, target)
  }
}

// Freeze the page behind an overlay (mobile menu).
export function lockScroll(on) {
  if (lenis) on ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = on ? 'hidden' : ''
}
