import { useRef, useState } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../lib/scroll'

const NODES = { client: 90, api: 400, provider: 710 }
const Y = 110

const t = {
  flaky: 'Flaky network — drop the first response',
  key: 'Send an Idempotency-Key',
  pay: 'Pay ₫500,000',
  reset: 'Reset',
  ledger: 'Provider ledger',
  empty: 'No charges yet',
  once: 'Charged once',
  twice: 'Double charge!',
  timeout: 'timeout — retrying…',
  replay: 'replayed from key store',
  charge: 'charge',
}

export default function IdempotencyDemo() {
  const svg = useRef(null)
  const store = useRef(new Map())
  const [flaky, setFlaky] = useState(true)
  const [useKey, setUseKey] = useState(false)
  const [busy, setBusy] = useState(false)
  const [ledger, setLedger] = useState([])
  const [payments, setPayments] = useState([])
  const [note, setNote] = useState('')

  const fast = prefersReducedMotion()

  const send = async (from, to, color, label, { drop = false } = {}) => {
    const g = svg.current.querySelector('.packet')
    const txt = svg.current.querySelector('.packet-label')
    txt.textContent = label
    gsap.set(g, { attr: { cx: NODES[from], fill: color }, opacity: 1, scale: 1, transformOrigin: 'center' })
    gsap.set(txt, { attr: { x: NODES[from] }, opacity: 1 })
    const dur = fast ? 0.01 : 0.9
    if (drop) {
      const mid = (NODES[from] + NODES[to]) / 2
      await Promise.all([
        gsap.to(g, { attr: { cx: mid }, duration: dur / 2, ease: 'power1.in' }),
        gsap.to(txt, { attr: { x: mid }, duration: dur / 2, ease: 'power1.in' }),
      ])
      const x = svg.current.querySelector('.drop-x')
      gsap.set(x, { attr: { transform: `translate(${mid} ${Y})` }, opacity: 1 })
      await gsap.to(g, { opacity: 0, scale: 3, duration: fast ? 0.01 : 0.4 })
      gsap.to(x, { opacity: 0, duration: 0.6, delay: 0.6 })
      gsap.set(txt, { opacity: 0 })
      return
    }
    await Promise.all([
      gsap.to(g, { attr: { cx: NODES[to] }, duration: dur, ease: 'power2.inOut' }),
      gsap.to(txt, { attr: { x: NODES[to] }, duration: dur, ease: 'power2.inOut' }),
    ])
    gsap.to([g, txt], { opacity: 0, duration: 0.2 })
  }

  const pulse = (node) => {
    const el = svg.current.querySelector(`.node-${node}`)
    gsap.fromTo(el, { attr: { 'stroke-width': 5 } }, { attr: { 'stroke-width': 1.5 }, duration: 0.8 })
  }

  const pay = async () => {
    setBusy(true)
    const id = payments.length + 1
    const key = useKey ? `key_${Math.random().toString(36).slice(2, 8)}` : null
    setPayments((p) => [...p, { id, charges: 0 }])
    let attempt = 1

    for (;;) {
      setNote('')
      await send('client', 'api', '#4c8dff', key ? `POST /charge  ${key}` : 'POST /charge')
      pulse('api')
      if (key && store.current.has(key)) {
        setNote(t.replay)
        await send('api', 'client', '#3fb8a9', '200 OK (replay)')
        break
      }
      await send('api', 'provider', '#9b7bff', t.charge)
      pulse('provider')
      setLedger((l) => [...l, { id: l.length + 1, payment: id }])
      setPayments((p) => p.map((x) => (x.id === id ? { ...x, charges: x.charges + 1 } : x)))
      await send('provider', 'api', '#3fb8a9', 'ok')
      if (key) store.current.set(key, true)
      const drop = flaky && attempt === 1
      await send('api', 'client', '#3fb8a9', '200 OK', { drop })
      if (!drop) break
      setNote(t.timeout)
      await new Promise((r) => setTimeout(r, fast ? 50 : 900))
      attempt++
    }
    setBusy(false)
  }

  const reset = () => {
    store.current.clear()
    setLedger([])
    setPayments([])
    setNote('')
  }

  const last = payments[payments.length - 1]

  return (
    <div className="demo idem-demo">
      <svg ref={svg} viewBox="0 0 800 200" className="idem-svg" role="img" aria-label="Client, API and payment provider">
        <line x1={NODES.client} y1={Y} x2={NODES.provider} y2={Y} className="idem-wire" />
        {Object.entries(NODES).map(([k, x]) => (
          <g key={k}>
            <rect className={`idem-node node-${k}`} x={x - 62} y={Y - 34} width="124" height="68" rx="14" />
            <text x={x} y={Y + 5} className="idem-node-label">{k === 'provider' ? 'Provider' : k === 'api' ? 'API' : 'Client'}</text>
          </g>
        ))}
        <circle className="packet" cx={NODES.client} cy={Y} r="9" opacity="0" />
        <text className="packet-label" x={NODES.client} y={Y - 48} opacity="0" />
        <g className="drop-x" opacity="0">
          <path d="M-12 -12 L12 12 M12 -12 L-12 12" stroke="#e5604f" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>

      <div className="demo-controls">
        <label className="toggle">
          <input type="checkbox" checked={flaky} onChange={(e) => setFlaky(e.target.checked)} disabled={busy} />
          <span>{t.flaky}</span>
        </label>
        <label className="toggle">
          <input type="checkbox" checked={useKey} onChange={(e) => setUseKey(e.target.checked)} disabled={busy} />
          <span>{t.key}</span>
        </label>
        <div className="demo-actions">
          <button type="button" className="btn small" onClick={pay} disabled={busy}>{t.pay}</button>
          <button type="button" className="chip-btn" onClick={reset} disabled={busy}>{t.reset}</button>
        </div>
      </div>

      <div className="idem-bottom">
        <div className="idem-status" aria-live="polite">
          {note && <span className="idem-note">{note}</span>}
          {last && !busy && (
            <span className={`idem-verdict ${last.charges > 1 ? 'bad' : 'ok'}`}>
              {last.charges > 1 ? t.twice : t.once}
            </span>
          )}
        </div>
        <div className="ledger">
          <span className="ledger-title">{t.ledger}</span>
          {ledger.length === 0 && <span className="muted">{t.empty}</span>}
          <ol>
            {ledger.map((row) => {
              const dup = ledger.filter((r) => r.payment === row.payment).length > 1
              return (
                <li key={row.id} className={dup ? 'dup' : ''}>
                  <span className="mono">#{String(row.id).padStart(3, '0')}</span>
                  <span>payment {row.payment}</span>
                  <b>−₫500,000</b>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
