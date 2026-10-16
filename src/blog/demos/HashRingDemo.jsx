import { useMemo, useState } from 'react'

const KEYS = Array.from({ length: 40 }, (_, i) => `user:${i + 1}`)
const NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const COLORS = ['#3fb8a9', '#4c8dff', '#e8834a', '#9b7bff', '#e3b341', '#ef6f9a', '#62c370', '#8fb3ff']
const VNODES = 8
const R = 120
const CX = 160
const CY = 160

// FNV-1a plus a murmur3-style finaliser: short, similar names like "A#0" / "B#0"
// otherwise land in one clump on the ring.
function hash(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 2 ** 32
}

function ring(nodeCount, virtual) {
  const points = []
  for (let n = 0; n < nodeCount; n++) {
    const copies = virtual ? VNODES : 1
    for (let v = 0; v < copies; v++) points.push({ node: n, pos: hash(`${NAMES[n]}#${v}`) })
  }
  return points.sort((a, b) => a.pos - b.pos)
}

function owners(points) {
  return KEYS.map((k) => {
    const p = hash(k)
    const hit = points.find((pt) => pt.pos >= p) ?? points[0]
    return hit.node
  })
}

const xy = (pos, r = R) => {
  const a = pos * Math.PI * 2 - Math.PI / 2
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r]
}

export default function HashRingDemo() {
  const [count, setCount] = useState(3)
  const [virtual, setVirtual] = useState(false)
  const [moved, setMoved] = useState({ ring: null, modulo: null, ids: new Set(), stamp: 0 })

  const points = useMemo(() => ring(count, virtual), [count, virtual])
  const own = useMemo(() => owners(points), [points])
  const load = Array.from({ length: count }, (_, n) => own.filter((o) => o === n).length)

  const change = (nextCount, nextVirtual) => {
    const before = owners(ring(count, virtual))
    const after = owners(ring(nextCount, nextVirtual))
    const ids = new Set(KEYS.map((_, i) => i).filter((i) => before[i] !== after[i]))
    const modulo = nextCount === count
      ? null
      : KEYS.filter((k) => Math.floor(hash(k) * 2 ** 32) % count !== Math.floor(hash(k) * 2 ** 32) % nextCount).length
    setMoved({ ring: ids.size, modulo, ids, stamp: Date.now() })
    setCount(nextCount)
    setVirtual(nextVirtual)
  }

  return (
    <div className="demo ring-demo">
      <div className="ring-grid">
        <svg viewBox="0 0 320 320" className="ring-svg" role="img" aria-label={`Hash ring with ${count} nodes`}>
          <circle cx={CX} cy={CY} r={R} className="ring-track" />
          {KEYS.map((k, i) => {
            const [x, y] = xy(hash(k))
            return (
              <circle
                key={`${k}-${moved.ids.has(i) ? moved.stamp : 0}`}
                cx={x}
                cy={y}
                r="4"
                fill={COLORS[own[i]]}
                className={`ring-key ${moved.ids.has(i) ? 'moved' : ''}`}
              >
                <title>{k} → {NAMES[own[i]]}</title>
              </circle>
            )
          })}
          {points.map((p, i) => {
            const [x, y] = xy(p.pos, R + 20)
            const [lx, ly] = xy(p.pos, R)
            return (
              <g key={`${p.node}-${i}`} className="ring-node">
                <line x1={lx} y1={ly} x2={x} y2={y} stroke={COLORS[p.node]} />
                <circle cx={x} cy={y} r={virtual ? 5 : 11} fill={COLORS[p.node]} />
                {!virtual && <text x={x} y={y + 4}>{NAMES[p.node]}</text>}
              </g>
            )
          })}
          <text x={CX} y={CY - 6} className="ring-center">{KEYS.length} keys</text>
          <text x={CX} y={CY + 14} className="ring-center dim">{count} nodes{virtual ? ` × ${VNODES}` : ''}</text>
        </svg>

        <div className="ring-side">
          <div className="ring-stats">
            <div>
              <span>Moved on the ring</span>
              <b className="ok">{moved.ring == null ? '—' : `${moved.ring} / ${KEYS.length}`}</b>
            </div>
            <div>
              <span>With hash % N</span>
              <b className="bad">{moved.modulo == null ? '—' : `${moved.modulo} / ${KEYS.length}`}</b>
            </div>
          </div>
          <ul className="ring-load">
            {load.map((n, i) => (
              <li key={NAMES[i]}>
                <span style={{ color: COLORS[i] }}>{NAMES[i]}</span>
                <div><i style={{ width: `${(n / KEYS.length) * 100 * 2}%`, background: COLORS[i] }} /></div>
                <b className="mono">{n}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="demo-controls">
        <div className="demo-actions">
          <button type="button" className="btn small" onClick={() => change(count + 1, virtual)} disabled={count >= NAMES.length}>Add node</button>
          <button type="button" className="chip-btn" onClick={() => change(count - 1, virtual)} disabled={count <= 1}>Remove node</button>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={virtual} onChange={(e) => change(count, e.target.checked)} />
          <span>Virtual nodes (×{VNODES})</span>
        </label>
      </div>
    </div>
  )
}
