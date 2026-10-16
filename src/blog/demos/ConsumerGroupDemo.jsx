import { useEffect, useRef, useState } from 'react'
import { useLang } from '../../lib/i18n'
import Icon from '../../components/Icon'

const PARTITIONS = 6
const MAX_CONSUMERS = 8
const CONSUMER_SPEED = 2.2 // messages per second per consumer
const KEYS = ['#3fb8a9', '#4c8dff', '#e8834a', '#9b7bff', '#e3b341', '#ef6f9a', '#62c370', '#8fb3ff']
const CONSUMER_COLORS = ['#3fb8a9', '#4c8dff', '#e8834a', '#9b7bff', '#e3b341', '#ef6f9a', '#62c370', '#8fb3ff']
const TICK = 0.1
const VISIBLE = 14

const T = {
  en: { rate: 'Producer rate', consumers: 'Consumers', lag: 'lag', idle: 'idle', rebalancing: 'Rebalancing…', total: 'Total lag', offset: 'offset', hot: 'Hot key' },
}

// Round-robin assignment, like Kafka's RoundRobinAssignor.
const assign = (n) => Array.from({ length: PARTITIONS }, (_, p) => p % n)

export default function ConsumerGroupDemo() {
  const { lang } = useLang()
  const t = T[lang] ?? T.en
  const [rate, setRate] = useState(8)
  const [consumers, setConsumers] = useState(2)
  const [hotKey, setHotKey] = useState(false)
  const [state, setState] = useState(() => ({
    queues: Array.from({ length: PARTITIONS }, () => []),
    offsets: Array(PARTITIONS).fill(0),
    pausedUntil: 0,
  }))
  const sim = useRef({ seq: 0, acc: 0, cacc: Array(MAX_CONSUMERS).fill(0), rr: Array(MAX_CONSUMERS).fill(0) })
  const cfg = useRef({ rate, consumers, hotKey })
  const root = useRef(null)

  useEffect(() => {
    cfg.current = { rate, consumers, hotKey }
  }, [rate, consumers, hotKey])

  // Any membership change stops the whole group for a moment.
  const changeConsumers = (delta) => {
    setConsumers((c) => Math.min(MAX_CONSUMERS, Math.max(1, c + delta)))
    setState((s) => ({ ...s, pausedUntil: performance.now() + 900 }))
  }

  useEffect(() => {
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(root.current)
    const id = setInterval(() => {
      if (!visible) return
      setState((prev) => {
        const s = sim.current
        const { rate: r, consumers: n, hotKey: hot } = cfg.current
        const queues = prev.queues.map((q) => q.slice())
        const offsets = prev.offsets.slice()
        s.acc += r * TICK
        while (s.acc >= 1) {
          s.acc -= 1
          const key = hot && Math.random() < 0.6 ? 0 : (Math.random() * KEYS.length) | 0
          const q = queues[key % PARTITIONS]
          if (q.length < 400) q.push({ id: ++s.seq, key })
        }
        if (performance.now() >= prev.pausedUntil) {
          const owner = assign(n)
          for (let c = 0; c < n; c++) {
            const mine = owner.map((o, p) => (o === c ? p : -1)).filter((p) => p >= 0)
            if (!mine.length) continue
            s.cacc[c] += CONSUMER_SPEED * TICK
            while (s.cacc[c] >= 1) {
              s.cacc[c] -= 1
              let taken = false
              for (let k = 0; k < mine.length; k++) {
                const p = mine[(s.rr[c] + k) % mine.length]
                if (queues[p].length) {
                  queues[p].shift()
                  offsets[p]++
                  s.rr[c] = (s.rr[c] + k + 1) % mine.length
                  taken = true
                  break
                }
              }
              if (!taken) { s.cacc[c] = 0; break }
            }
          }
        }
        return { ...prev, queues, offsets }
      })
    }, TICK * 1000)
    return () => {
      clearInterval(id)
      io.disconnect()
    }
  }, [])

  const owner = assign(consumers)
  const totalLag = state.queues.reduce((a, q) => a + q.length, 0)
  const rebalancing = performance.now() < state.pausedUntil

  return (
    <div className="demo kafka-demo" ref={root}>
      <div className="kafka-grid">
        <div className="partitions">
          {state.queues.map((q, p) => {
            const c = owner[p]
            return (
              <div className="partition" key={p}>
                <span className="p-label mono">P{p}</span>
                <div className="p-log">
                  {q.slice(0, VISIBLE).map((m) => (
                    <span key={m.id} className="msg" style={{ background: KEYS[m.key] }} />
                  ))}
                  {q.length > VISIBLE && <span className="msg-more mono">+{q.length - VISIBLE}</span>}
                </div>
                <span className={`p-lag mono ${q.length > 20 ? 'bad' : q.length > 8 ? 'warn' : ''}`}>
                  {t.lag} {q.length}
                </span>
                <span className="p-owner" style={{ background: CONSUMER_COLORS[c] }} title={`consumer ${c + 1}`}>
                  C{c + 1}
                </span>
              </div>
            )
          })}
        </div>

        <div className="consumers">
          {Array.from({ length: consumers }, (_, c) => {
            const mine = owner.map((o, p) => (o === c ? p : -1)).filter((p) => p >= 0)
            return (
              <div className={`consumer ${mine.length ? '' : 'idle'}`} key={c} style={{ '--c': CONSUMER_COLORS[c] }}>
                <b>C{c + 1}</b>
                <span className="mono">{mine.length ? mine.map((p) => `P${p}`).join(' ') : t.idle}</span>
              </div>
            )
          })}
          {rebalancing && <div className="rebalance">{t.rebalancing}</div>}
        </div>
      </div>

      <div className="demo-controls">
        <div className="stepper" role="group" aria-label={t.consumers}>
          <span>{t.consumers}</span>
          <button type="button" onClick={() => changeConsumers(-1)} aria-label="Remove consumer" disabled={consumers <= 1}><Icon name="minus" size={16} /></button>
          <b>{consumers}</b>
          <button type="button" onClick={() => changeConsumers(1)} aria-label="Add consumer" disabled={consumers >= MAX_CONSUMERS}><Icon name="plus" size={16} /></button>
        </div>
        <label className="slider">
          <span>{t.rate} <b>{rate} msg/s</b></span>
          <input type="range" min="2" max="30" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </label>
        <label className="toggle">
          <input type="checkbox" checked={hotKey} onChange={(e) => setHotKey(e.target.checked)} />
          <span>{t.hot}</span>
        </label>
        <div className="demo-stats">
          <span><b className={totalLag > 60 ? 'bad' : 'ok'}>{totalLag}</b> {t.total}</span>
        </div>
      </div>
    </div>
  )
}
