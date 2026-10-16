import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useContent } from '../lib/i18n'
import { prefersReducedMotion } from '../lib/scroll'
import Lines from '../components/Lines'
import Icon from '../components/Icon'
import EmailReveal from '../components/EmailReveal'

export default function Contact() {
  const root = useRef(null)
  const btn = useRef(null)
  const c = useContent()

  useGSAP(() => {
    const q = gsap.utils.selector(root)

    gsap.from(q('.ct-line'), {
      scaleY: 0, stagger: 0.08, ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 20%', scrub: true },
    })
    gsap.from(q('.contact-glow'), {
      opacity: 0, scale: 0.6, ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'top top', scrub: true },
    })
    gsap.timeline({ scrollTrigger: { trigger: q('.contact-inner')[0], start: 'top 75%', toggleActions: 'play none none reverse' } })
      .from(q('.contact .ln > span'), { yPercent: 140, stagger: 0.1, duration: 1.2, ease: 'expo.out' })
      .from(q('.ct-copy, .ct-actions'), { opacity: 0, y: 24, stagger: 0.1, duration: 1, ease: 'expo.out' }, 0.4)
    // The wordmark rises out of the floor as the page ends.
    gsap.fromTo(q('.wordmark span'), { yPercent: 100 }, {
      yPercent: 0, stagger: 0.07, duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: q('.wordmark')[0], start: 'top 98%', toggleActions: 'play none none reverse' },
    })

    if (prefersReducedMotion() || !window.matchMedia('(hover: hover)').matches) return
    const el = btn.current
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const clamp = gsap.utils.clamp(-14, 14)
      xTo(clamp((e.clientX - r.left - r.width / 2) * 0.35))
      yTo(clamp((e.clientY - r.top - r.height / 2) * 0.35))
    }
    const leave = () => { xTo(0); yTo(0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, { scope: root })

  return (
    <section className="contact" id="contact" ref={root}>
      <div className="contact-glow" aria-hidden="true" />
      <div className="ct-lines" aria-hidden="true">
        {[10, 30, 50, 70, 90].map((x) => <span className="ct-line" key={x} style={{ left: `${x}%` }} />)}
      </div>

      <div className="contact-inner">
        <div className="ct-left">
          <p className="section-tag">{c.ui.contactTag}</p>
          <Lines as="h2" lines={c.ui.contactTitle} />
          <p className="ct-copy">{c.ui.contactText}</p>
          <div className="ct-actions">
            <div ref={btn} className="magnet"><EmailReveal /></div>
            <a className="btn ghost" href={c.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <Icon name="arrow" size={16} />
            </a>
          </div>
        </div>
        <Lines as="h3" className="ct-right" lines={c.ui.contactSide} />
      </div>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} {c.name}</span>
        <span>{c.location}</span>
        <span>{c.ui.langs}</span>
        <a href={c.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
      </footer>

      <div className="wordmark" aria-hidden="true">
        {c.wordmark.split('').map((ch, i) => <span key={i}>{ch}</span>)}
      </div>
    </section>
  )
}
