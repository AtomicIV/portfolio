import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useContent } from '../lib/i18n'
import Lines from '../components/Lines'
import Icon from '../components/Icon'

export default function Career() {
  const root = useRef(null)
  const { approach, career, stack, ui } = useContent()
  const [open, setOpen] = useState(0)

  const toggle = (i) => {
    setOpen((o) => (o === i ? -1 : i))
    // Rows below move once the panel finishes growing; re-measure the triggers.
    setTimeout(() => ScrollTrigger.refresh(), 520)
  }

  useGSAP(() => {
    const q = gsap.utils.selector(root)

    gsap.from(q('.career-head .ln > span'), {
      yPercent: 140, stagger: 0.1, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: q('.career-head')[0], start: 'top 80%', toggleActions: 'play none none reverse' },
    })

    q('.ap-card').forEach((card) => {
      const num = card.querySelector('[data-count]')
      const target = Number(num.dataset.count)
      const count = { v: 0 }
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' } })
        .from(card, { y: 60, opacity: 0, duration: 1, ease: 'expo.out' })
        .to(count, {
          v: target, duration: 1.6, ease: 'expo.out',
          onUpdate: () => (num.textContent = String(Math.round(count.v)).padStart(2, '0')),
        }, 0.1)
    })

    q('.job').forEach((row) => {
      gsap.from(row, {
        opacity: 0, y: 40, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 90%', toggleActions: 'play none none reverse' },
      })
      gsap.from(row.querySelector('.job-line'), {
        scaleX: 0, duration: 1.4, ease: 'expo.inOut',
        scrollTrigger: { trigger: row, start: 'top 90%', toggleActions: 'play none none reverse' },
      })
    })

    // The stack marquee drifts on its own and leans into the scroll direction.
    const tracks = q('.mq-track')
    tracks.forEach((track, i) => {
      gsap.fromTo(track, { xPercent: i % 2 ? -50 : 0 }, {
        xPercent: i % 2 ? 0 : -50,
        ease: 'none',
        scrollTrigger: { trigger: q('.marquee')[0], start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      })
    })
  }, { scope: root })

  return (
    <section className="career" id="career" ref={root}>
      <div className="career-head">
        <p className="section-tag">{ui.approach}</p>
        <Lines as="h2" lines={ui.approachTitle} />
      </div>

      <div className="approach">
        {approach.map((a) => (
          <article className={`ap-card glass ap-${a.color}`} key={a.title}>
            <span className="ap-num" data-count={a.value}>{String(a.value).padStart(2, '0')}</span>
            <span className="ap-unit">{a.unit}</span>
            <h3>{a.title}</h3>
            <p>{a.text}</p>
          </article>
        ))}
      </div>

      <div className="marquee" aria-label={ui.stack}>
        {[0, 1].map((r) => (
          <div className="mq-row" key={r}>
            <div className="mq-track" aria-hidden={r === 1}>
              {[...stack, ...stack].map((s, i) => (
                <span key={i} className={i % 4 === r ? 'hot' : ''}>{s}<i>✦</i></span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="career-list">
        <p className="section-tag">{ui.career}</p>
        {career.map((j, i) => (
          <article className={`job${open === i ? ' open' : ''}`} key={j.company}>
            <span className="job-line" aria-hidden="true" />
            <button
              type="button"
              className="job-head"
              aria-expanded={open === i}
              aria-controls={`job-${i}`}
              onClick={() => toggle(i)}
            >
              <span className="job-years">{j.years}</span>
              <h3 className="job-company">{j.company}</h3>
              <span className="job-role">{j.role}</span>
              <span className="job-note">{j.note}</span>
              <span className="job-toggle" aria-hidden="true"><Icon name="plus" size={16} /></span>
            </button>
            <div className="job-body" id={`job-${i}`}>
              <ul>
                {j.details.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
