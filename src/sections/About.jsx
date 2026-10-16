import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useContent } from '../lib/i18n'
import { swapDuration } from '../lib/swap'
import Lines from '../components/Lines'

function Competencies({ groups, label }) {
  const [active, setActive] = useState(0)
  const panel = useRef(null)

  const pick = (i) => {
    if (i === active) return
    setActive(i)
    // Let React paint the new list, then cascade it in.
    requestAnimationFrame(() => {
      const k = swapDuration()
      gsap.fromTo(panel.current.querySelectorAll('li'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.5 * k, ease: 'expo.out', overwrite: true })
    })
  }

  const onKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (active + (e.key === 'ArrowRight' ? 1 : groups.length - 1)) % groups.length
    pick(next)
    e.currentTarget.querySelectorAll('[role=tab]')[next]?.focus()
  }

  return (
    <div className="bento-card comp glass a-card">
      <span className="bento-label">{label}</span>
      <div className="comp-tabs" role="tablist" aria-label={label} onKeyDown={onKey}>
        {groups.map((g, i) => (
          <button
            key={g.label}
            type="button"
            role="tab"
            id={`comp-tab-${i}`}
            aria-selected={active === i}
            aria-controls="comp-panel"
            tabIndex={active === i ? 0 : -1}
            onClick={() => pick(i)}
          >
            {g.label}
          </button>
        ))}
      </div>
      <ul className="comp-list" id="comp-panel" role="tabpanel" aria-labelledby={`comp-tab-${active}`} ref={panel}>
        {groups[active].items.map((it) => <li key={it}>{it}</li>)}
      </ul>
    </div>
  )
}

export default function About() {
  const root = useRef(null)
  const { about: a } = useContent()
  // Words for spaced scripts, clauses for Japanese (no spaces to split on).
  const words = a.summary.match(/[^、。\s]+[、。]?\s?/g)

  useGSAP(() => {
    const q = gsap.utils.selector(root)

    gsap.from(q('.about-head .ln > span'), {
      yPercent: 140, stagger: 0.1, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: root.current, start: 'top 75%', toggleActions: 'play none none none' },
    })

    // Reading highlight: words brighten as the paragraph passes through the viewport.
    gsap.fromTo(q('.sum-word'), { opacity: 0.18 }, {
      opacity: 1, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: q('.about-summary')[0], start: 'top 80%', end: 'bottom 45%', scrub: true },
    })

    q('.a-card').forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, y: 60 }, {
        opacity: 1, y: 0, duration: 1, delay: (i % 3) * 0.08, ease: 'expo.out',
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
      })
    })

    const path = q('.ind-path')[0]
    gsap.timeline({ scrollTrigger: { trigger: q('.industries')[0], start: 'top 80%', toggleActions: 'play none none none' } })
      .fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
      .fromTo(q('.ind-node'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.25, duration: 0.6, ease: 'back.out(2)' }, 0.1)
  }, { scope: root })

  return (
    <section className="about" id="about" ref={root}>
      <div className="about-head">
        <p className="section-tag">{a.tag}</p>
        <Lines as="h2" lines={a.title} />
      </div>

      <p className="about-summary">
        {words.map((w, i) => <span className="sum-word" key={i}>{w}</span>)}
      </p>

      <div className="bento">
        <div className="bento-card edu glass a-card">
          <span className="bento-label">{a.education}</span>
          <svg className="edu-icon" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M4 18 24 8l20 10-20 10z" />
            <path d="M12 22v10c0 3 6 6 12 6s12-3 12-6V22" />
            <path d="M44 18v12" />
          </svg>
          <h3>{a.degree}</h3>
          <p>{a.school}</p>
          <span className="mono muted">{a.schoolYears}</span>
        </div>

        <div className="bento-card langs glass a-card">
          <span className="bento-label">{a.languages}</span>
          <ul>
            {a.langLevels.map((l, i) => (
              <li key={l.code}>
                <span className={`lang-code ${l.color}`}>{l.code}</span>
                <div>
                  <b>{a.langNames[i]}</b>
                  <span>{a.langNotes[i]}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bento-card looking glass a-card">
          <span className="bento-label">{a.looking}</span>
          <p>{a.lookingText}</p>
          <span className="pulse-dot" aria-hidden="true" />
        </div>

        <div className="bento-card industries glass a-card">
          <span className="bento-label">{a.industries}</span>
          <div className="ind-track">
            <svg viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
              <path className="ind-path" pathLength="1" d="M20 20 H980" />
            </svg>
            <ol>
              {a.industryList.map((name, i) => (
                <li key={name}>
                  <span className="ind-node" />
                  <span className="mono">0{i + 1}</span>
                  <b>{name}</b>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <Competencies groups={a.groups} label={a.competencies} />

        <div className="bento-card providers glass a-card">
          <span className="bento-label">{a.providersLabel}</span>
          <ul>
            {a.providers.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}
