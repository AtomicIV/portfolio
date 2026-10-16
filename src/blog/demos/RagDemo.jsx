import { useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useLang } from '../../lib/i18n'
import { prefersReducedMotion } from '../../lib/scroll'

const W = 160
const H = 100
const TOPICS = {
  pay: { color: '#e8834a', label: 'Payments' },
  stream: { color: '#4c8dff', label: 'Streaming' },
  events: { color: '#9b7bff', label: 'Events' },
  team: { color: '#3fb8a9', label: 'Team' },
}
// A pretend engineering wiki, already embedded and projected to 2D.
const DOCS = [
  ['pay', 34, 26, 'Idempotency keys for the charge API'], ['pay', 42, 34, 'Double-charge postmortem'], ['pay', 28, 36, 'Payment timeout handling'],
  ['pay', 48, 22, 'Stripe webhook retries'], ['pay', 22, 22, 'VNPay settlement job'], ['pay', 38, 42, 'Refund state machine'],
  ['stream', 112, 22, 'HLS segment sizes'], ['stream', 124, 30, 'CDN routing rules'], ['stream', 104, 32, 'Transcode queue'],
  ['stream', 132, 18, 'Peak CCU runbook'], ['stream', 118, 40, 'Player buffering metrics'], ['stream', 98, 18, 'DRM licence flow'],
  ['events', 112, 70, 'Consumer lag alerts'], ['events', 124, 78, 'Choosing a partition count'], ['events', 102, 80, 'Outbox pattern'],
  ['events', 132, 66, 'CDC with Kafka Connect'], ['events', 118, 88, 'Rebalance storms'], ['events', 96, 66, 'Dead-letter topics'],
  ['team', 34, 72, 'Backend interview loop'], ['team', 46, 80, 'Onboarding checklist'], ['team', 26, 84, 'Code review guidelines'],
  ['team', 40, 64, 'On-call rotation'], ['team', 54, 70, 'Career ladder'], ['team', 30, 60, 'AI review bot setup'],
].map(([topic, x, y, title], id) => ({ id, topic, x, y, title }))

const QUERIES = {
  en: [['How do we avoid double charges?', 36, 32], ['Why is consumer lag growing?', 112, 76], ['Viewers report buffering at peak', 120, 32], ['How does a new engineer get started?', 40, 76]],
}

const T = {
  en: { k: 'Top-k', hint: 'Click anywhere on the map to ask from there', context: 'Sent to the LLM', tokens: 'tokens', custom: 'Your point' },
}
const MAX_DIST = Math.hypot(W, H) / 2

export default function RagDemo() {
  const { lang } = useLang()
  const t = T[lang] ?? T.en
  const queries = QUERIES[lang] ?? QUERIES.en
  const [q, setQ] = useState({ label: queries[0][0], x: queries[0][1], y: queries[0][2], preset: 0 })
  const [k, setK] = useState(3)
  const [pulse, setPulse] = useState(0)
  const svg = useRef(null)
  const qDot = useRef(null)

  const ranked = useMemo(
    () => DOCS.map((d) => ({ ...d, dist: Math.hypot(d.x - q.x, d.y - q.y) }))
      .sort((a, b) => a.dist - b.dist)
      .map((d) => ({ ...d, score: Math.max(0, 1 - d.dist / MAX_DIST) })),
    [q],
  )
  const top = ranked.slice(0, k)
  const topIds = new Set(top.map((d) => d.id))

  const moveTo = (next) => {
    const from = { x: q.x, y: q.y }
    setQ(next)
    setPulse((p) => p + 1)
    if (qDot.current && !prefersReducedMotion()) {
      gsap.fromTo(qDot.current, { attr: { cx: from.x, cy: from.y } }, { attr: { cx: next.x, cy: next.y }, duration: 0.7, ease: 'expo.out' })
    }
  }

  const onMapClick = (e) => {
    const pt = svg.current.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(svg.current.getScreenCTM().inverse())
    moveTo({ label: t.custom, x: Math.round(p.x), y: Math.round(p.y), preset: -1 })
  }

  return (
    <div className="demo rag-demo">
      <div className="rag-queries" role="group" aria-label="Questions">
        {queries.map(([label, x, y], i) => (
          <button key={label} type="button" className="chip-btn" aria-pressed={q.preset === i} onClick={() => moveTo({ label, x, y, preset: i })}>
            {label}
          </button>
        ))}
      </div>

      <div className="rag-grid">
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="rag-map" onClick={onMapClick} role="img" aria-label="Embedding map">
          {[40, 80, 120].map((x) => <line key={x} x1={x} y1="0" x2={x} y2={H} className="rag-grid-line" />)}
          {[33, 66].map((y) => <line key={y} x1="0" y1={y} x2={W} y2={y} className="rag-grid-line" />)}
          {top.map((d) => (
            <line key={`${pulse}-${d.id}`} x1={q.x} y1={q.y} x2={d.x} y2={d.y} className="rag-link" pathLength="1" />
          ))}
          {DOCS.map((d) => (
            <circle
              key={d.id}
              cx={d.x}
              cy={d.y}
              r={topIds.has(d.id) ? 2.6 : 1.7}
              fill={TOPICS[d.topic].color}
              className={`rag-doc ${topIds.has(d.id) ? 'hit' : ''}`}
            >
              <title>{d.title}</title>
            </circle>
          ))}
          <circle ref={qDot} cx={q.x} cy={q.y} r="3" className="rag-query" />
          <circle key={pulse} cx={q.x} cy={q.y} r="3" className="rag-ping" />
        </svg>

        <div className="rag-side">
          <p className="rag-q">“{q.label}”</p>
          <ol className="rag-results">
            {top.map((d, i) => (
              <li key={`${pulse}-${d.id}`} style={{ '--c': TOPICS[d.topic].color, animationDelay: `${i * 60}ms` }}>
                <span className="mono">#{i + 1}</span>
                <span>{d.title}</span>
                <b className="mono">{d.score.toFixed(2)}</b>
              </li>
            ))}
          </ol>
          <div className="rag-ctx mono">
            {t.context}: {k} chunks · ~{(k * 350).toLocaleString('en-US')} {t.tokens}
          </div>
        </div>
      </div>

      <div className="demo-controls">
        <label className="slider">
          <span>{t.k} <b>{k}</b></span>
          <input type="range" min="1" max="8" value={k} onChange={(e) => setK(Number(e.target.value))} />
        </label>
        <div className="rag-legend">
          {Object.values(TOPICS).map((tp) => <span key={tp.label}><i style={{ background: tp.color }} />{tp.label}</span>)}
        </div>
      </div>
      <p className="demo-hint">{t.hint}</p>
    </div>
  )
}
