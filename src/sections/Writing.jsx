import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useContent, useLang } from '../lib/i18n'
import { openPost } from '../lib/router'
import { posts, tr } from '../blog/posts'
import { formatDate } from '../blog/Post'
import Lines from '../components/Lines'
import Icon from '../components/Icon'
import { swapDuration } from '../lib/swap'

const TOPICS = ['all', 'ai', 'systems', 'payments']

// Looping mini-diagrams so each card hints at its demo.
function Preview({ kind }) {
  if (kind === 'lb') {
    return (
      <svg viewBox="0 0 240 140" className="pv" aria-hidden="true">
        <rect x="100" y="52" width="40" height="36" rx="8" className="pv-box accent" />
        {[30, 70, 110].map((y) => <rect key={y} x="196" y={y - 12} width="30" height="24" rx="6" className="pv-box" />)}
        {[30, 70, 110].map((y) => <line key={y} x1="140" y1="70" x2="196" y2={y} className="pv-wire" />)}
        <line x1="14" y1="70" x2="100" y2="70" className="pv-wire" />
        {[0, 1, 2].map((i) => (
          <circle key={i} r="4" className="pv-dot">
            <animateMotion dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" path={`M14 70 L100 70 L140 70 L196 ${[30, 70, 110][i]}`} />
          </circle>
        ))}
      </svg>
    )
  }
  if (kind === 'idem') {
    return (
      <svg viewBox="0 0 240 140" className="pv" aria-hidden="true">
        <rect x="14" y="52" width="44" height="36" rx="8" className="pv-box" />
        <rect x="182" y="52" width="44" height="36" rx="8" className="pv-box accent" />
        <line x1="58" y1="70" x2="182" y2="70" className="pv-wire" />
        <circle r="5" className="pv-dot">
          <animateMotion dur="2s" repeatCount="indefinite" path="M58 70 L182 70" />
        </circle>
        <text x="120" y="40" className="pv-text">key_9f2a</text>
        <text x="120" y="110" className="pv-text dim">×1 charge</text>
      </svg>
    )
  }
  if (kind === 'agent') {
    return (
      <svg viewBox="0 0 240 140" className="pv" aria-hidden="true">
        <circle cx="62" cy="70" r="24" className="pv-box accent" />
        <text x="62" y="74" className="pv-text">LLM</text>
        {[28, 58, 88, 118].map((y, i) => (
          <g key={y}>
            <rect x="150" y={y - 11} width="76" height="20" rx="6" className="pv-box" />
            <text x="188" y={y + 3} className="pv-text dim">{['read', 'grep', 'edit', 'test'][i]}</text>
          </g>
        ))}
        {[28, 58, 88, 118].map((y, i) => (
          <circle key={y} r="4" className="pv-dot">
            <animateMotion dur="4s" begin={`${i}s`} repeatCount="indefinite" path={`M86 70 L150 ${y} L86 70`} />
          </circle>
        ))}
      </svg>
    )
  }
  if (kind === 'rag') {
    const pts = [[40, 30], [52, 42], [34, 48], [170, 28], [184, 40], [160, 46], [172, 104], [190, 96], [150, 110], [46, 100], [60, 112], [34, 116]]
    return (
      <svg viewBox="0 0 240 140" className="pv" aria-hidden="true">
        {pts.slice(0, 3).map(([x, y]) => <line key={x} x1="58" y1="58" x2={x} y2={y} className="pv-wire" />)}
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" className={i < 3 ? 'pv-dot' : 'pv-box'} />)}
        <circle cx="58" cy="58" r="6" className="pv-query" />
      </svg>
    )
  }
  if (kind === 'bucket') {
    return (
      <svg viewBox="0 0 240 140" className="pv" aria-hidden="true">
        <path d="M84 30 L92 120 L148 120 L156 30" className="pv-box" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={104 + (i % 3) * 16} cy={108 - Math.floor(i / 3) * 16} r="6" className="pv-token" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
        <circle r="4" className="pv-dot">
          <animateMotion dur="2.4s" repeatCount="indefinite" path="M14 70 L120 70 L226 70" />
        </circle>
        <text x="200" y="40" className="pv-text dim">429</text>
      </svg>
    )
  }
  if (kind === 'ring') {
    return (
      <svg viewBox="0 0 240 140" className="pv" aria-hidden="true">
        <g className="pv-spin">
          <circle cx="120" cy="70" r="48" className="pv-wire" fill="none" />
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2
            return <circle key={i} cx={120 + Math.cos(a) * 48} cy={70 + Math.sin(a) * 48} r="3" className={i % 4 === 0 ? 'pv-dot' : 'pv-box'} />
          })}
        </g>
        {[0.3, 2.4, 4.4].map((a) => <circle key={a} cx={120 + Math.cos(a) * 62} cy={70 + Math.sin(a) * 62} r="8" className="pv-box accent" />)}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 240 140" className="pv" aria-hidden="true">
      {[0, 1, 2, 3].map((r) => (
        <g key={r} transform={`translate(14 ${18 + r * 28})`}>
          <rect width="170" height="18" rx="5" className="pv-box" />
          {[0, 1, 2, 3, 4].map((m) => (
            <rect key={m} y="4" width="10" height="10" rx="2" className="pv-msg" style={{ animationDelay: `${(r * 5 + m) * 0.17}s` }} x={8 + m * 16} />
          ))}
          <rect x="196" width="30" height="18" rx="5" className="pv-box accent" />
        </g>
      ))}
    </svg>
  )
}

export default function Writing() {
  const root = useRef(null)
  const c = useContent()
  const { lang } = useLang()
  const [topic, setTopic] = useState('all')
  const first = useRef(true)

  // Filtering changes the track width, so the pinned scroll has to be re-measured.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    ScrollTrigger.refresh()
    const cards = root.current.querySelectorAll('.post-card:not([hidden])')
    gsap.fromTo(cards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.6 * swapDuration(), ease: 'expo.out', overwrite: true })
  }, [topic])

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    gsap.from(q('.writing-head .ln > span'), {
      yPercent: 140, stagger: 0.1, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: root.current, start: 'top 70%', toggleActions: 'play none none none' },
    })

    // Desktop: the row of cards slides sideways while the section is pinned.
    mm.add('(min-width: 900px)', () => {
      const track = q('.writing-track')[0]
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80)
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance() + window.innerHeight * 0.5}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    })
    mm.add('(max-width: 899px)', () => {
      q('.post-card').forEach((card) => {
        gsap.fromTo(card, { y: 60, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
        })
      })
    })

    // Cards lean toward the pointer.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const cleanups = q('.post-card').map((card) => {
      const rx = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power3' })
      const ry = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power3' })
      const move = (e) => {
        const r = card.getBoundingClientRect()
        ry(((e.clientX - r.left) / r.width - 0.5) * 10)
        rx(-((e.clientY - r.top) / r.height - 0.5) * 10)
        card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
        card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
      }
      const leave = () => { rx(0); ry(0) }
      card.addEventListener('pointermove', move)
      card.addEventListener('pointerleave', leave)
      return () => {
        card.removeEventListener('pointermove', move)
        card.removeEventListener('pointerleave', leave)
      }
    })
    return () => cleanups.forEach((f) => f())
  }, { scope: root })

  return (
    <section className="writing" id="writing" ref={root}>
      <div className="writing-track">
        <div className="writing-head">
          <p className="section-tag">{c.ui.writing}</p>
          <Lines as="h2" lines={c.ui.writingTitle} />
          <p className="writing-text">{c.ui.writingText}</p>
          <div className="topic-filter" role="group" aria-label="Filter posts">
            {TOPICS.map((tp) => (
              <button key={tp} type="button" aria-pressed={topic === tp} onClick={() => setTopic(tp)}>
                {c.ui.topics[tp]}
                <small>{tp === 'all' ? posts.length : posts.filter((p) => p.topic === tp).length}</small>
              </button>
            ))}
          </div>
        </div>
        {posts.map((p, i) => (
          <a
            key={p.slug}
            href={`#/blog/${p.slug}`}
            className="post-card glass"
            hidden={topic !== 'all' && p.topic !== topic}
            style={{ '--accent': `var(--${p.accent})` }}
            onClick={(e) => { e.preventDefault(); openPost(p.slug) }}
          >
            <span className="pc-shine" aria-hidden="true" />
            <div className="pc-top mono">
              <span>0{i + 1}</span>
              <span className="badge">{c.ui.interactive}</span>
            </div>
            <Preview kind={p.preview} />
            <h3>{tr(p.title, lang).join(' ')}</h3>
            <p>{tr(p.excerpt, lang)}</p>
            <div className="pc-foot mono">
              <span>{formatDate(p.date)} · {p.read} {c.ui.minRead}</span>
              <span className="pc-go">{c.ui.read} <Icon name="arrow" size={14} /></span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
