import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useLang } from '../../lib/i18n'
import { prefersReducedMotion } from '../../lib/scroll'

const TOOLS = ['read_file', 'grep', 'edit_file', 'run_tests']

// Scripted runs: the point is the shape of the loop, not a real model.
const TASKS = {
  test: {
    goal: 'Fix the failing payment test',
    steps: [
      { think: 'Start by running the tests to see what fails.' },
      { tool: 'run_tests', arg: './payment/...', result: 'FAIL TestCharge_Retry — charged twice', tokens: 1400 },
      { think: 'The retry path charges again. Read the handler.' },
      { tool: 'read_file', arg: 'payment/charge.go', result: '142 lines', tokens: 2600 },
      { think: 'Check where the idempotency key is used.' },
      { tool: 'grep', arg: '"IdempotencyKey"', result: '3 matches, none before provider.Charge', tokens: 700 },
      { think: 'Claim the key before charging, replay on retry.' },
      { tool: 'edit_file', arg: 'payment/charge.go (+7 −1)', result: 'patched', tokens: 900, edit: true },
      { tool: 'run_tests', arg: './payment/...', result: 'ok — 214 passed', tokens: 600 },
      { done: 'Done: retries now replay the stored receipt.' },
    ],
  },
  limit: {
    goal: 'Add rate limiting to POST /login',
    steps: [
      { think: 'Find how routes and middleware are wired.' },
      { tool: 'grep', arg: '"Use(" router/', result: '4 middleware registered', tokens: 800 },
      { tool: 'read_file', arg: 'router/router.go', result: '96 lines', tokens: 2100 },
      { think: 'Reuse the Redis client; add a token-bucket middleware.' },
      { tool: 'read_file', arg: 'platform/redis.go', result: '58 lines', tokens: 1500 },
      { tool: 'edit_file', arg: 'router/ratelimit.go (new, +64)', result: 'created', tokens: 1300, edit: true },
      { tool: 'edit_file', arg: 'router/router.go (+2)', result: 'patched', tokens: 500, edit: true },
      { tool: 'run_tests', arg: './router/...', result: 'ok — 37 passed', tokens: 600 },
      { done: 'Done: /login allows 5 attempts per minute per IP.' },
    ],
  },
}
const THINK_TOKENS = 180
const PROMPT_TOKENS = 1200

const T = {
  en: { task: 'Task', small: 'Small context window', approve: 'Ask before editing', run: 'Run agent', reset: 'Reset', context: 'Context', compacted: 'Earlier steps summarised', approveBtn: 'Approve edit', waiting: 'Waiting for your approval…', tasks: { test: 'Fix failing test', limit: 'Add rate limiting' } },
}

export default function AgentLoopDemo() {
  const { lang } = useLang()
  const t = T[lang] ?? T.en
  const [task, setTask] = useState('test')
  const [small, setSmall] = useState(false)
  const [approve, setApprove] = useState(true)
  const [log, setLog] = useState([])
  const [tokens, setTokens] = useState(0)
  const [running, setRunning] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [activeTool, setActiveTool] = useState(null)
  const runId = useRef(0)
  const approveResolve = useRef(null)
  const stage = useRef(null)
  const logRef = useRef(null)

  const limit = small ? 5000 : 12000
  const fast = prefersReducedMotion()

  useEffect(() => () => { runId.current++ }, [])
  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log])

  const sleep = (ms) => new Promise((r) => setTimeout(r, fast ? 0 : ms))

  const fly = async (toolName, back) => {
    const root = stage.current
    if (!root || fast) return
    const dot = root.querySelector('.ag-packet')
    const model = root.querySelector('.ag-model').getBoundingClientRect()
    const tool = root.querySelector(`[data-tool="${toolName}"]`).getBoundingClientRect()
    const base = root.getBoundingClientRect()
    const a = { x: model.left + model.width / 2 - base.left, y: model.top + model.height / 2 - base.top }
    const b = { x: tool.left + 10 - base.left, y: tool.top + tool.height / 2 - base.top }
    const [from, to] = back ? [b, a] : [a, b]
    gsap.set(dot, { x: from.x, y: from.y, opacity: 1, backgroundColor: back ? '#3fb8a9' : '#9b7bff' })
    await gsap.to(dot, { x: to.x, y: to.y, duration: 0.55, ease: 'power2.inOut' })
    gsap.set(dot, { opacity: 0 })
  }

  const run = async () => {
    const id = ++runId.current
    const alive = () => id === runId.current
    setRunning(true)
    setLog([{ kind: 'goal', text: TASKS[task].goal, tokens: PROMPT_TOKENS }])
    let used = PROMPT_TOKENS
    setTokens(used)
    let entries = [{ kind: 'goal', text: TASKS[task].goal, tokens: PROMPT_TOKENS }]

    const push = (entry) => {
      entries = [...entries, entry]
      used += entry.tokens
      // Compaction: once over budget, fold everything but the goal and the last
      // two entries into a short summary — that's what agents do to keep going.
      if (used > limit && entries.length > 4) {
        const keep = entries.slice(-2)
        const folded = entries.slice(1, -2)
        const summary = { kind: 'summary', text: `${t.compacted} (${folded.length})`, tokens: 400 }
        entries = [entries[0], summary, ...keep]
        used = entries.reduce((s, e) => s + e.tokens, 0)
      }
      setLog(entries)
      setTokens(used)
    }

    for (const step of TASKS[task].steps) {
      if (!alive()) return
      if (step.think) {
        await sleep(500)
        push({ kind: 'think', text: step.think, tokens: THINK_TOKENS })
        continue
      }
      if (step.done) {
        await sleep(400)
        push({ kind: 'done', text: step.done, tokens: 120 })
        break
      }
      if (step.edit && approve) {
        setWaiting(true)
        await new Promise((r) => (approveResolve.current = r))
        setWaiting(false)
        if (!alive()) return
      }
      setActiveTool(step.tool)
      push({ kind: 'call', text: `${step.tool}(${step.arg})`, tokens: 60 })
      await fly(step.tool, false)
      await sleep(350)
      await fly(step.tool, true)
      if (!alive()) return
      push({ kind: 'result', text: step.result, tokens: step.tokens })
      setActiveTool(null)
      await sleep(250)
    }
    if (alive()) setRunning(false)
  }

  const reset = () => {
    runId.current++
    approveResolve.current?.()
    setRunning(false)
    setWaiting(false)
    setActiveTool(null)
    setLog([])
    setTokens(0)
  }

  const pct = Math.min(100, (tokens / limit) * 100)

  return (
    <div className="demo agent-demo">
      <div className="ag-ctx">
        <span>{t.context}</span>
        <div className="ag-bar"><span style={{ width: `${pct}%` }} className={pct > 85 ? 'hot' : ''} /></div>
        <b className="mono">{tokens.toLocaleString('en-US')} / {limit.toLocaleString('en-US')}</b>
      </div>

      <div className="ag-grid">
        <div className="ag-stage" ref={stage}>
          <div className="ag-model"><span>LLM</span></div>
          <div className="ag-tools">
            {TOOLS.map((tool) => (
              <div key={tool} data-tool={tool} className={`ag-tool mono ${activeTool === tool ? 'on' : ''}`}>{tool}</div>
            ))}
          </div>
          <span className="ag-packet" aria-hidden="true" />
          <span className="ag-mcp mono">MCP</span>
        </div>

        <ol className="ag-log mono" ref={logRef} aria-live="polite" data-lenis-prevent>
          {log.map((e, i) => (
            <li key={i} className={`ag-${e.kind}`}>
              <span>{e.kind === 'call' ? '→ ' : e.kind === 'result' ? '← ' : ''}{e.text}</span>
              <small>{e.tokens}</small>
            </li>
          ))}
          {waiting && (
            <li className="ag-wait">
              <span>{t.waiting}</span>
              <button type="button" className="btn small" onClick={() => approveResolve.current?.()}>{t.approveBtn}</button>
            </li>
          )}
        </ol>
      </div>

      <div className="demo-controls">
        <div className="seg" role="group" aria-label={t.task}>
          {Object.keys(TASKS).map((k) => (
            <button key={k} type="button" aria-pressed={task === k} disabled={running} onClick={() => setTask(k)}>{t.tasks[k]}</button>
          ))}
        </div>
        <label className="toggle">
          <input type="checkbox" checked={small} disabled={running} onChange={(e) => setSmall(e.target.checked)} />
          <span>{t.small}</span>
        </label>
        <label className="toggle">
          <input type="checkbox" checked={approve} disabled={running} onChange={(e) => setApprove(e.target.checked)} />
          <span>{t.approve}</span>
        </label>
        <div className="demo-actions">
          <button type="button" className="btn small" onClick={run} disabled={running}>{t.run}</button>
          <button type="button" className="chip-btn" onClick={reset}>{t.reset}</button>
        </div>
      </div>
    </div>
  )
}
