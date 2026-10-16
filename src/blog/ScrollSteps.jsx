import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLang } from '../lib/i18n'
import { slotOf, stepper, swapDuration, textHide, textIn, textOut } from '../lib/swap'
import { tr } from './posts'

// A pinned diagram: as the reader scrolls, each step lights up its nodes and
// sends a packet along the wire — the same storytelling device as the home hero.
export default function ScrollSteps({ nodes, steps, accent }) {
  const { lang } = useLang()
  const root = useRef(null)
  const center = (i) => ((i + 0.5) / nodes.length) * 100

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const texts = q('.ss-step')
    const glows = q('.ss-glow')
    const packet = q('.ss-packet')[0]
    const dots = q('.ss-dot')

    texts.forEach((t) => textHide(t, '.ss-fade'))
    gsap.set(glows, { opacity: 0 })
    gsap.set(packet, { left: `${center(steps[0].from)}%`, opacity: 0 })

    const k = swapDuration()
    const step = stepper((next, prev, dir) => {
      texts.forEach((t, i) => {
        if (i === prev) textOut(t, '.ss-fade', dir)
        else if (i !== next) textHide(t, '.ss-fade')
      })
      dots.forEach((d, i) => gsap.to(d, { scale: i === next ? 1.6 : 1, opacity: i <= next ? 1 : 0.25, duration: 0.3 * k, overwrite: true }))
      if (next < 0) {
        gsap.to([...glows, packet], { opacity: 0, duration: 0.3 * k, overwrite: true })
        return
      }
      const s = steps[next]
      textIn(texts[next], '.ss-fade', dir, prev >= 0 ? 0.3 : 0.1)
      gsap.to(glows, { opacity: (i) => (s.active.includes(i) ? 1 : 0), duration: 0.4 * k, overwrite: true })
      // Going back replays the step's packet in reverse.
      const [from, to] = dir > 0 ? [s.from, s.to] : [s.to, s.from]
      gsap.fromTo(packet, { left: `${center(from)}%`, opacity: 1 }, { left: `${center(to)}%`, duration: 1.1 * k, delay: 0.15 * k, ease: 'power2.inOut', overwrite: true })
    })

    // Step one is already on screen as the diagram arrives, before the pin starts.
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top 60%',
      onEnter: () => { if (step.current < 0) step.go(0) },
      onLeaveBack: () => step.go(-1),
    })
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: `+=${steps.length * 50}%`,
      pin: true,
      onUpdate: (self) => step.go(slotOf(self.progress, steps.length)),
    })
  }, { scope: root })

  return (
    <section className="ss" ref={root} style={{ '--accent': `var(--${accent})` }}>
      <div className="ss-diagram">
        <div className="ss-wire" aria-hidden="true" />
        {nodes.map((n, i) => (
          <div className="ss-node" key={i} style={{ left: `${center(i)}%` }}>
            <span className="ss-glow" aria-hidden="true" />
            <span className="ss-node-label">{tr(n, lang)}</span>
          </div>
        ))}
        <span className="ss-packet" aria-hidden="true" />
      </div>

      <div className="ss-steps">
        {steps.map((s, i) => (
          <article className="ss-step" key={i}>
            <span className="ss-no mono ss-fade">0{i + 1} / 0{steps.length}</span>
            <h3><span className="ln"><span>{tr(s.title, lang)}</span></span></h3>
            <p className="ss-fade">{tr(s.text, lang)}</p>
          </article>
        ))}
      </div>

      <div className="ss-dots" aria-hidden="true">
        {steps.map((_, i) => <span className="ss-dot" key={i} />)}
      </div>
    </section>
  )
}
