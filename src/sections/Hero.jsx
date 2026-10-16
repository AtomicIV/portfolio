import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useContent } from '../lib/i18n'
import { slotOf, stepper, swapDuration, textHide, textIn, textOut } from '../lib/swap'
import Lines from '../components/Lines'
import Ring from '../components/Ring'
import Icon from '../components/Icon'
import { TerminalCard, ArchCard, TeamCard } from '../components/StageCards'

const cards = [TerminalCard, ArchCard, TeamCard]
// Where each ring drifts to as the hero title clears away.
const ringExit = [[-80, 40], [90, -60], [60, 90]]

export default function Hero() {
  const root = useRef(null)
  const { chapters, heroStats, name, role, ui } = useContent()

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(
      // matchMedia only runs this when a condition matches, so `reduce` keeps it running
      // for reduced-motion desktops too.
      { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 767px)' },
      (ctx) => {
        const { motion, mobile } = ctx.conditions
        const q = gsap.utils.selector(root)
        const cardEls = q('.card')
        const texts = q('.chapter')
        const pills = q('.pill')
        const navItems = q('.cn-item')

        if (motion) {
          gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.4 } })
            .from(q('.gl'), { scale: 0, duration: 1.8, stagger: 0.1 })
            .from(q('.hero-eyebrow'), { opacity: 0, y: 12, duration: 1 }, 0.2)
            .from(q('.hero-title .ln > span'), { yPercent: 140, stagger: 0.12 }, 0.25)
            .from(q('.stage-inner'), { opacity: 0, y: 90, rotateX: 28, duration: 2 }, 0.35)
            .from(q('.ring-inner'), { opacity: 0, scale: 0.7, y: 30, stagger: 0.12 }, 0.6)
            .from(q('.chapter-nav, .scroll-hint > *'), { opacity: 0, duration: 1.2 }, 0.9)
        }

        gsap.set(cardEls.slice(1), { opacity: 0, rotateY: -70, xPercent: 35 })
        texts.forEach((t) => textHide(t, '.ch-fade'))
        gsap.set(pills, { opacity: 0, y: 30, scale: 0.92 })

        const k = swapDuration()
        const chapter = stepper((next, prev, dir) => {
          texts.forEach((t, i) => {
            if (i === prev) textOut(t, '.ch-fade', dir)
            else if (i !== next) textHide(t, '.ch-fade')
          })
          if (next >= 0) textIn(texts[next], '.ch-fade', dir, prev >= 0 ? 0.3 : 0.1)

          pills.forEach((p, i) => {
            if (i === prev) gsap.to(p, { opacity: 0, y: -30 * dir, duration: 0.4 * k, overwrite: true })
            else if (i !== next) gsap.set(p, { opacity: 0 })
          })
          if (next >= 0) {
            const num = pills[next].querySelector('[data-count]')
            const count = { v: 0 }
            gsap.fromTo(pills[next], { opacity: 0, y: 30 * dir, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 * k, delay: 0.3 * k, ease: 'expo.out', overwrite: true })
            gsap.to(count, {
              v: chapters[next].pill.value, duration: 1.2 * k, delay: 0.3 * k, ease: 'power2.out',
              onUpdate: () => (num.textContent = Math.round(count.v).toLocaleString('en-US')),
            })
          }

          // Card 0 is already on stage in the title state, so only swap past it.
          const showCard = Math.max(next, 0)
          const hideCard = Math.max(prev, 0)
          if (showCard !== hideCard) {
            cardEls.forEach((cd, i) => {
              if (i === hideCard) gsap.to(cd, { opacity: 0, rotateY: 70 * dir, xPercent: -35 * dir, duration: 0.7 * k, ease: 'power2.in', overwrite: true })
              else if (i !== showCard) gsap.set(cd, { opacity: 0 })
            })
            gsap.fromTo(cardEls[showCard], { opacity: 0, rotateY: -70 * dir, xPercent: 35 * dir }, { opacity: 1, rotateY: 0, xPercent: 0, duration: 1 * k, delay: 0.2 * k, ease: 'expo.out', overwrite: true })
          }

          navItems.forEach((n, i) => gsap.to(n, { opacity: i <= next ? 1 : 0.4, duration: 0.3 * k, overwrite: true }))
        })

        // Scroll scrubs only the continuous parts: the title clearing away,
        // the stage turning, and the chapter rail filling.
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=230%',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onUpdate: (self) => chapter.go(self.progress < 0.15 ? -1 : slotOf((self.progress - 0.15) / 0.85, chapters.length)),
          },
        })

        tl.to(q('.hero-head, .scroll-hint'), { y: -80, opacity: 0, duration: 1 }, 0)
          .to(q('.ring'), {
            opacity: 0,
            scale: 0.8,
            x: (i) => ringExit[i][0],
            y: (i) => ringExit[i][1],
            duration: 0.8,
          }, 0)
          .to(q('.stage'), {
            x: mobile ? 0 : '-14vw',
            y: mobile ? '-10vh' : 0,
            rotateY: mobile ? -8 : -16,
            rotateX: 6,
            duration: 1.1,
          }, 0)
          .to({}, { duration: 4.4 })
        tl.fromTo(q('.cn-fill'), { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: tl.duration() }, 0)
      },
    )
  }, { scope: root })

  return (
    <section className="hero" id="top" ref={root}>
      <div className="grid-lines" aria-hidden="true">
        <span className="gl v" style={{ left: '50%' }} />
        <span className="gl v" style={{ left: '75%' }} />
        <span className="gl h" style={{ top: '38%' }} />
        <span className="gl h" style={{ top: '74%' }} />
      </div>

      <aside className="chapter-nav" aria-hidden="true">
        <span className="plus">+</span>
        <div className="cn-track"><span className="cn-fill" /></div>
        {chapters.map((c) => (
          <div className="cn-item" key={c.no}>
            <small>{c.no}</small>
            <span>{c.label}</span>
          </div>
        ))}
        <span className="plus">+</span>
      </aside>

      <div className="hero-head">
        <p className="hero-eyebrow">{name} · {role}</p>
        <Lines as="h1" className="hero-title" lines={ui.heroTitle} />
      </div>

      <div className="stage-wrap">
        <div className="stage">
          <div className="stage-inner">
            {cards.map((Card, i) => <Card key={i} />)}
          </div>
        </div>

        {heroStats.map((s, i) => (
          <div className={`ring ring-${i}`} key={s.label}>
            <Ring {...s} delay={0.9 + i * 0.15} />
          </div>
        ))}

        {chapters.map((c) => (
          <div className="pill glass" key={c.no}>
            <div>
              <b data-count>{c.pill.value.toLocaleString('en-US')}</b>
              <span>{c.pill.label}</span>
            </div>
            <span className="pill-icon"><Icon name={c.pill.icon} /></span>
          </div>
        ))}
      </div>

      <div className="chapters">
        {chapters.map((c) => (
          <article className="chapter" key={c.no}>
            <span className="ch-no ch-fade">{c.no} — {c.label} · {c.years}</span>
            <Lines as="h2" lines={c.title} />
            <p className="ch-fade">{c.text}</p>
          </article>
        ))}
      </div>

      <div className="scroll-hint" aria-hidden="true">
        <span>{ui.scroll}</span>
        <i />
      </div>
    </section>
  )
}
