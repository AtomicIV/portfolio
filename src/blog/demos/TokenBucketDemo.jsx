import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../lib/scroll'

const HISTORY = 48

export default function TokenBucketDemo() {
  const [capacity, setCapacity] = useState(10)
  const [refill, setRefill] = useState(3)
  const [auto, setAuto] = useState(false)
  const [autoRate, setAutoRate] = useState(6)
  const [view, setView] = useState({ tokens: 10, ok: 0, bad: 0, history: [] })
  const sim = useRef({ tokens: 10, ok: 0, bad: 0, history: [], acc: 0 })
  const cfg = useRef({ capacity, refill, auto, autoRate })
  const lane = useRef(null)

  useEffect(() => {
    cfg.current = { capacity, refill, auto, autoRate }
    sim.current.tokens = Math.min(sim.current.tokens, capacity)
  }, [capacity, refill, auto, autoRate])

  const flyDot = (ok) => {
    const el = lane.current
    if (!el || prefersReducedMotion()) return
    const dot = document.createElement('span')
    dot.className = `tb-dot ${ok ? 'ok' : 'bad'}`
    el.appendChild(dot)
    const w = el.clientWidth
    const tl = gsap.timeline({ onComplete: () => dot.remove() })
    tl.fromTo(dot, { x: 0, opacity: 1 }, { x: w * 0.42, duration: 0.35, ease: 'power1.in' })
    if (ok) tl.to(dot, { x: w - 14, duration: 0.45, ease: 'power1.out' }).to(dot, { opacity: 0, duration: 0.15 })
    else tl.to(dot, { x: w * 0.12, y: -18, duration: 0.45, ease: 'power2.out' }).to(dot, { opacity: 0, duration: 0.2 }, '-=0.15')
  }

  const request = () => {
    const s = sim.current
    const ok = s.tokens >= 1
    if (ok) {
      s.tokens -= 1
      s.ok++
    } else {
      s.bad++
    }
    s.history = [...s.history, ok].slice(-HISTORY)
    flyDot(ok)
  }

  useEffect(() => {
    let ui = 0
    const tick = (_t, deltaMs) => {
      const dt = Math.min(deltaMs / 1000, 0.1)
      const s = sim.current
      const c = cfg.current
      s.tokens = Math.min(c.capacity, s.tokens + c.refill * dt)
      if (c.auto) {
        s.acc += c.autoRate * dt
        while (s.acc >= 1) {
          s.acc -= 1
          request()
        }
      }
      ui += dt
      if (ui > 0.06) {
        ui = 0
        setView({ tokens: s.tokens, ok: s.ok, bad: s.bad, history: s.history })
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  const burst = () => {
    for (let i = 0; i < 10; i++) setTimeout(request, i * 45)
  }

  const reset = () => {
    sim.current = { tokens: capacity, ok: 0, bad: 0, history: [], acc: 0 }
  }

  const whole = Math.floor(view.tokens)
  const cols = 4
  const rows = Math.ceil(capacity / cols)

  return (
    <div className="demo tb-demo">
      <div className="tb-stage">
        <div className="tb-lane" ref={lane}>
          <span className="tb-end mono">client</span>
          <span className="tb-end right mono">API</span>
        </div>

        <svg viewBox="0 0 120 150" className="tb-bucket" aria-label={`${whole} of ${capacity} tokens`} role="img">
          <path d="M14 22 L22 140 Q24 146 30 146 L90 146 Q96 146 98 140 L106 22" className="tb-shell" />
          <rect x="22" y={140 - (view.tokens / capacity) * 112} width="76" height={(view.tokens / capacity) * 112} className="tb-level" />
          {Array.from({ length: capacity }, (_, i) => {
            const c = i % cols
            const r = Math.floor(i / cols)
            return (
              <circle
                key={i}
                cx={36 + c * 16}
                cy={132 - r * (108 / Math.max(rows, 1))}
                r="6"
                className={`tb-token ${i < whole ? 'full' : ''}`}
              />
            )
          })}
          <text x="60" y="14" className="tb-label">{view.tokens.toFixed(1)} / {capacity}</text>
        </svg>
      </div>

      <div className="tb-history" aria-label="Recent requests">
        {view.history.map((ok, i) => <span key={i} className={ok ? 'ok' : 'bad'} />)}
      </div>

      <div className="demo-controls">
        <div className="demo-actions">
          <button type="button" className="btn small" onClick={request}>Send request</button>
          <button type="button" className="chip-btn" onClick={burst}>Burst ×10</button>
          <button type="button" className="chip-btn" onClick={reset}>Reset</button>
        </div>
        <label className="slider">
          <span>Capacity <b>{capacity}</b></span>
          <input type="range" min="2" max="20" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
        </label>
        <label className="slider">
          <span>Refill <b>{refill} / s</b></span>
          <input type="range" min="1" max="10" value={refill} onChange={(e) => setRefill(Number(e.target.value))} />
        </label>
        <label className="toggle">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          <span>Background traffic</span>
        </label>
        {auto && (
          <label className="slider">
            <span>Traffic <b>{autoRate} req/s</b></span>
            <input type="range" min="1" max="20" value={autoRate} onChange={(e) => setAutoRate(Number(e.target.value))} />
          </label>
        )}
        <div className="demo-stats">
          <span><b className="ok">{view.ok}</b> 200 OK</span>
          <span><b className="bad">{view.bad}</b> 429</span>
        </div>
      </div>
    </div>
  )
}
