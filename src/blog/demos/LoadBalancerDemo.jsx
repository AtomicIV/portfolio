import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useLang } from '../../lib/i18n'

const W = 1000
const H = 520
const CLIENTS = [
  { x: 90, y: 110, color: '#e8834a' },
  { x: 90, y: 260, color: '#4c8dff' },
  { x: 90, y: 410, color: '#9b7bff' },
]
const LB = { x: 470, y: 260 }
// C is deliberately slow so the algorithms behave differently.
const SERVERS = [
  { x: 870, y: 100, name: 'A', work: 0.9 },
  { x: 870, y: 260, name: 'B', work: 0.9 },
  { x: 870, y: 420, name: 'C', work: 2.6 },
]
const CAPACITY = 8
const HEALTH_INTERVAL = 1.2
const ALGOS = ['rr', 'least', 'hash']
const ALGO_LABEL = { rr: 'Round robin', least: 'Least connections', hash: 'IP hash' }

const T = {
  en: { rate: 'Traffic', served: 'Served', failed: 'Failed', hint: 'Click a server to kill it', up: 'healthy', down: 'down', detecting: 'LB not aware yet', slow: 'slow', reset: 'Reset' },
}

const lerp = (a, b, t) => a + (b - a) * t
const ease = (t) => 1 - (1 - t) * (1 - t)

function freshSim() {
  return {
    dots: [],
    servers: SERVERS.map(() => ({ up: true, lbUp: true, load: 0, served: 0 })),
    rr: 0,
    acc: 0,
    hc: 0,
    served: 0,
    failed: 0,
  }
}

export default function LoadBalancerDemo() {
  const { lang } = useLang()
  const t = T[lang] ?? T.en
  const canvasRef = useRef(null)
  const sim = useRef(freshSim())
  const cfg = useRef({ algo: 'rr', rate: 8 })
  const [algo, setAlgo] = useState('rr')
  const [rate, setRate] = useState(8)
  const [view, setView] = useState({ servers: sim.current.servers, served: 0, failed: 0 })

  useEffect(() => {
    cfg.current = { algo, rate }
  }, [algo, rate])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let visible = true
    let uiTimer = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      canvas.width = w * dpr
      canvas.height = (w * H / W) * dpr
      ctx.setTransform((w * dpr) / W, 0, 0, (w * dpr) / W, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)

    const pick = (s, client) => {
      const alive = s.servers.map((v, i) => (v.lbUp ? i : -1)).filter((i) => i >= 0)
      if (!alive.length) return -1
      const { algo: a } = cfg.current
      if (a === 'least') return alive.reduce((best, i) => (s.servers[i].load < s.servers[best].load ? i : best), alive[0])
      if (a === 'hash') return alive[client % alive.length]
      s.rr = (s.rr + 1) % alive.length
      return alive[s.rr]
    }

    const step = (dt) => {
      const s = sim.current
      s.acc += cfg.current.rate * dt
      while (s.acc >= 1) {
        s.acc -= 1
        const client = (Math.random() * CLIENTS.length) | 0
        s.dots.push({ phase: 'in', t: 0, client, server: -1 })
      }
      s.hc += dt
      if (s.hc >= HEALTH_INTERVAL) {
        s.hc = 0
        s.servers.forEach((v) => (v.lbUp = v.up))
      }
      for (const d of s.dots) {
        if (d.phase === 'in') {
          d.t += dt / 0.45
          if (d.t >= 1) {
            d.server = pick(s, d.client)
            if (d.server < 0) {
              d.phase = 'fail'; d.t = 0; d.at = LB; s.failed++
            } else {
              d.phase = 'out'; d.t = 0; s.servers[d.server].load++
            }
          }
        } else if (d.phase === 'out') {
          d.t += dt / 0.5
          if (d.t >= 1) {
            const sv = s.servers[d.server]
            if (!sv.up) {
              sv.load--; d.phase = 'fail'; d.t = 0; d.at = SERVERS[d.server]; s.failed++
            } else {
              d.phase = 'work'; d.t = 0
              // Overloaded servers slow down — the queue is what hurts.
              d.dur = SERVERS[d.server].work * (1 + Math.max(0, sv.load - CAPACITY) * 0.25)
            }
          }
        } else if (d.phase === 'work') {
          d.t += dt
          if (!s.servers[d.server].up) {
            s.servers[d.server].load--; d.phase = 'fail'; d.t = 0; d.at = SERVERS[d.server]; s.failed++
          } else if (d.t >= d.dur) {
            s.servers[d.server].load--; s.servers[d.server].served++; s.served++
            d.phase = 'back'; d.t = 0
          }
        } else {
          d.t += dt / (d.phase === 'back' ? 0.6 : 0.6)
        }
      }
      s.dots = s.dots.filter((d) => !((d.phase === 'back' || d.phase === 'fail') && d.t >= 1))
    }

    const draw = () => {
      const s = sim.current
      ctx.clearRect(0, 0, W, H)
      // wires
      ctx.lineWidth = 1.5
      CLIENTS.forEach((c) => {
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(LB.x, LB.y); ctx.stroke()
      })
      SERVERS.forEach((sv, i) => {
        const st = s.servers[i]
        ctx.strokeStyle = st.lbUp ? 'rgba(63,184,169,0.35)' : 'rgba(255,255,255,0.06)'
        ctx.setLineDash(st.lbUp ? [] : [6, 6])
        ctx.beginPath(); ctx.moveTo(LB.x, LB.y); ctx.lineTo(sv.x - 70, sv.y); ctx.stroke()
        ctx.setLineDash([])
      })
      // clients
      CLIENTS.forEach((c, i) => {
        ctx.fillStyle = c.color + '22'
        ctx.strokeStyle = c.color
        ctx.beginPath(); ctx.arc(c.x, c.y, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
        ctx.fillStyle = '#f5f5f4'
        ctx.font = '600 14px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`10.0.0.${i + 1}`, c.x, c.y + 50)
      })
      // load balancer
      ctx.fillStyle = '#101214'
      ctx.strokeStyle = '#3fb8a9'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.roundRect(LB.x - 70, LB.y - 46, 140, 92, 16); ctx.fill(); ctx.stroke()
      ctx.fillStyle = '#3fb8a9'
      ctx.font = '600 22px Oswald, sans-serif'
      ctx.fillText('LB', LB.x, LB.y - 4)
      ctx.fillStyle = '#a1a1a6'
      ctx.font = '500 12px Inter, sans-serif'
      ctx.fillText(ALGO_LABEL[cfg.current.algo], LB.x, LB.y + 22)
      // servers
      SERVERS.forEach((sv, i) => {
        const st = s.servers[i]
        const col = !st.up ? '#e5604f' : '#3fb8a9'
        ctx.fillStyle = '#101214'
        ctx.strokeStyle = st.up !== st.lbUp ? '#e3b341' : col
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.roundRect(sv.x - 70, sv.y - 46, 140, 92, 14); ctx.fill(); ctx.stroke()
        ctx.fillStyle = '#f5f5f4'
        ctx.font = '600 20px Oswald, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(sv.name, sv.x - 56, sv.y - 16)
        // load bar
        const ratio = Math.min(st.load / CAPACITY, 1.6)
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect(sv.x - 56, sv.y + 22, 112, 8)
        ctx.fillStyle = st.load > CAPACITY ? '#e5604f' : st.load > CAPACITY * 0.6 ? '#e8834a' : '#3fb8a9'
        ctx.fillRect(sv.x - 56, sv.y + 22, Math.min(112, 112 * ratio / 1), 8)
        ctx.textAlign = 'right'
        ctx.fillStyle = '#a1a1a6'
        ctx.font = '500 12px Inter, sans-serif'
        ctx.fillText(`${st.load} conn`, sv.x + 56, sv.y - 18)
        ctx.textAlign = 'center'
      })
      // requests
      for (const d of s.dots) {
        const c = CLIENTS[d.client]
        let x, y, alpha = 1, r = 6
        if (d.phase === 'in') {
          x = lerp(c.x, LB.x, ease(d.t)); y = lerp(c.y, LB.y, ease(d.t))
        } else if (d.phase === 'out') {
          const sv = SERVERS[d.server]
          x = lerp(LB.x, sv.x - 70, ease(d.t)); y = lerp(LB.y, sv.y, ease(d.t))
        } else if (d.phase === 'work') {
          continue
        } else if (d.phase === 'back') {
          const sv = SERVERS[d.server]
          x = lerp(sv.x - 70, c.x, d.t); y = lerp(sv.y, c.y, d.t); alpha = 0.25 * (1 - d.t); r = 4
        } else {
          const p = d.at
          ctx.strokeStyle = `rgba(229,96,79,${1 - d.t})`
          ctx.lineWidth = 2
          ctx.beginPath(); ctx.arc(p.x - (p === LB ? 0 : 70), p.y, 8 + d.t * 26, 0, Math.PI * 2); ctx.stroke()
          continue
        }
        ctx.globalAlpha = alpha
        ctx.fillStyle = c.color
        ctx.shadowColor = c.color
        ctx.shadowBlur = 12
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      }
      // queued work drawn as a dot grid inside each server
      SERVERS.forEach((sv, i) => {
        const queued = s.dots.filter((d) => d.phase === 'work' && d.server === i)
        queued.slice(0, 24).forEach((d, k) => {
          ctx.fillStyle = CLIENTS[d.client].color
          ctx.beginPath()
          ctx.arc(sv.x - 50 + (k % 12) * 9.5, sv.y + 2 + Math.floor(k / 12) * 10, 3.2, 0, Math.PI * 2)
          ctx.fill()
        })
      })
    }

    const tick = (_time, deltaMs) => {
      if (!visible) return
      const dt = Math.min(deltaMs / 1000, 0.05)
      step(dt)
      draw()
      uiTimer += dt
      if (uiTimer > 0.25) {
        uiTimer = 0
        const s = sim.current
        setView({ servers: s.servers.map((v) => ({ ...v })), served: s.served, failed: s.failed })
      }
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  const toggleServer = (i) => {
    const sv = sim.current.servers[i]
    sv.up = !sv.up
    setView((v) => ({ ...v, servers: sim.current.servers.map((x) => ({ ...x })) }))
  }

  const reset = () => {
    sim.current = freshSim()
    setView({ servers: sim.current.servers, served: 0, failed: 0 })
  }

  return (
    <div className="demo lb-demo">
      <div className="demo-stage">
        <canvas ref={canvasRef} className="lb-canvas" aria-label="Load balancer simulation" />
        {SERVERS.map((sv, i) => {
          const st = view.servers[i]
          const state = !st.up ? (st.lbUp ? 'detecting' : 'down') : st.lbUp ? 'up' : 'detecting'
          return (
            <button
              key={sv.name}
              type="button"
              className={`lb-server-btn ${st.up ? '' : 'is-down'}`}
              style={{ left: `${((sv.x - 70) / W) * 100}%`, top: `${((sv.y - 46) / H) * 100}%`, width: `${(140 / W) * 100}%`, height: `${(92 / H) * 100}%` }}
              onClick={() => toggleServer(i)}
              aria-pressed={!st.up}
              aria-label={`Server ${sv.name}: ${t[state]}`}
            >
              <span className={`lb-badge ${state}`}>
                {sv.work > 1 ? `${t.slow} · ` : ''}{t[state]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="demo-controls">
        <div className="seg" role="group" aria-label="Algorithm">
          {ALGOS.map((a) => (
            <button key={a} type="button" aria-pressed={algo === a} onClick={() => setAlgo(a)}>{ALGO_LABEL[a]}</button>
          ))}
        </div>
        <label className="slider">
          <span>{t.rate} <b>{rate} req/s</b></span>
          <input type="range" min="2" max="24" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </label>
        <div className="demo-stats">
          <span><b className="ok">{view.served}</b> {t.served}</span>
          <span><b className="bad">{view.failed}</b> {t.failed}</span>
          <button type="button" className="chip-btn" onClick={reset}>{t.reset}</button>
        </div>
      </div>
      <p className="demo-hint">{t.hint}</p>
    </div>
  )
}
