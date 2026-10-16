import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useContent } from '../lib/i18n'
import { slotOf, stepper, swapDuration, textHide, textIn, textOut } from '../lib/swap'
import Lines from '../components/Lines'
import { screens } from '../components/Screens'

function revealScreen(screen, k) {
  gsap.fromTo(screen, { clipPath: 'inset(100% 0% 0% 0%)', opacity: 1, scale: 1 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9 * k, ease: 'power3.inOut', overwrite: true })
  gsap.fromTo(screen.querySelectorAll('.bar'), { scaleY: 0 }, { scaleY: 1, stagger: 0.04, duration: 0.7 * k, delay: 0.35 * k, ease: 'expo.out', overwrite: true })
  gsap.fromTo(screen.querySelectorAll('.row'), { opacity: 0, x: -16 }, { opacity: 1, x: 0, stagger: 0.06, duration: 0.5 * k, delay: 0.35 * k, overwrite: true })
  gsap.fromTo(screen.querySelectorAll('.draw'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1 * k, delay: 0.35 * k, ease: 'power2.out', overwrite: true })
}

export default function Work() {
  const root = useRef(null)
  const { projects, ui } = useContent()

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const texts = q('.project')
    const screenEls = q('.scr-wrap')
    const labels = q('.wp-label')

    texts.forEach((t) => textHide(t, '.p-fade'))
    gsap.set(screenEls, { clipPath: 'inset(100% 0% 0% 0%)' })

    const k = swapDuration()
    const project = stepper((next, prev, dir) => {
      texts.forEach((t, i) => {
        if (i === prev) textOut(t, '.p-fade', dir)
        else if (i !== next) textHide(t, '.p-fade')
      })
      if (next >= 0) textIn(texts[next], '.p-fade', dir, prev >= 0 ? 0.3 : 0.1)

      screenEls.forEach((el, i) => {
        if (i === prev) gsap.to(el, { opacity: 0, scale: 0.94, duration: 0.6 * k, overwrite: true })
        else if (i !== next) gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' })
      })
      if (next >= 0) revealScreen(screenEls[next], k)

      labels.forEach((l, i) => gsap.to(l, { opacity: i <= next ? 1 : 0.35, duration: 0.3 * k, overwrite: true }))
    })

    // First project plays in as the section arrives, before the pin takes over.
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top 55%',
      onEnter: () => project.go(0),
      onLeaveBack: () => project.go(-1),
    })

    gsap.from(q('.browser'), {
      y: 120, rotateX: 18, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 20%', scrub: true },
    })

    gsap.fromTo(q('.wp-fill'), { scaleX: 1 / projects.length }, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: `+=${projects.length * 55}%`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => project.go(slotOf(self.progress, projects.length)),
      },
    })
  }, { scope: root })

  return (
    <section className="work" id="work" ref={root}>
      <div className="grid-lines" aria-hidden="true">
        <span className="gl v static" style={{ left: '12%' }} />
        <span className="gl v static" style={{ left: '38%' }} />
        <span className="gl h static" style={{ top: '30%' }} />
        <span className="gl h static" style={{ top: '70%' }} />
      </div>

      <p className="section-tag">{ui.work}</p>

      <div className="projects">
        {projects.map((p) => (
          <article className="project" key={p.name}>
            <span className="p-org p-fade">{p.org}</span>
            <Lines as="h2" lines={p.title} />
            <div className="p-body p-fade">
              <p>{p.text}</p>
              <div className="p-metric">{p.metric}</div>
              <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>

      <div className="browser-wrap">
        <div className="browser glass-strong">
          <div className="card-bar"><i /><i /><i /><span>internal.dashboard</span></div>
          <div className="browser-body">
            {projects.map((p) => {
              const Screen = screens[p.screen]
              return <div className="scr-wrap" key={p.name}><Screen /></div>
            })}
          </div>
        </div>
      </div>

      <div className="work-progress" aria-hidden="true">
        <div className="wp-labels">
          {projects.map((p, i) => (
            <span className="wp-label" key={p.name}><small>{String(i + 1).padStart(2, '0')}</small>{p.name}</span>
          ))}
        </div>
        <div className="wp-track"><span className="wp-fill" /></div>
      </div>
    </section>
  )
}
