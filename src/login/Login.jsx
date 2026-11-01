import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Password field whose "show password" is a flashlight: only the characters inside the
// beam are revealed. The real <input> keeps focus, caret and autofill; its own text is
// transparent and two layers drawn on top show bullets outside the beam and letters inside.
// Turning the light on from the keyboard (no pointer to aim) floods the whole field.
function FlashlightPassword({ value, onChange, on, setOn, invalid }) {
  const field = useRef(null)
  const input = useRef(null)
  const [beamX, setBeamX] = useState(null) // px from the field's left edge
  const [flood, setFlood] = useState(false)
  const [scroll, setScroll] = useState(0)

  const syncScroll = () => {
    requestAnimationFrame(() => setScroll(input.current?.scrollLeft || 0))
  }
  useLayoutEffect(syncScroll, [value, on])

  // Aim follows the pointer anywhere on the page, clamped to the field.
  useEffect(() => {
    if (!on) return
    const aim = (e) => {
      const r = field.current.getBoundingClientRect()
      setBeamX(Math.min(Math.max(e.clientX - r.left, 0), r.width))
      setFlood(false)
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`)
      document.documentElement.style.setProperty('--my', `${e.clientY}px`)
    }
    window.addEventListener('pointermove', aim)
    window.addEventListener('pointerdown', aim)
    return () => {
      window.removeEventListener('pointermove', aim)
      window.removeEventListener('pointerdown', aim)
    }
  }, [on])

  useEffect(() => {
    document.body.classList.toggle('torch-on', on)
    return () => document.body.classList.remove('torch-on')
  }, [on])

  const toggle = (e) => {
    const next = !on
    setOn(next)
    // detail === 0: activated by keyboard, so there is nothing to aim with.
    setFlood(next && e.detail === 0)
    if (next && e.detail !== 0) {
      const r = field.current.getBoundingClientRect()
      setBeamX(e.clientX - r.left)
    }
    input.current?.focus()
  }

  const radius = flood ? 4000 : 54
  const x = beamX ?? 0
  const style = { '--bx': `${x}px`, '--br': `${radius}px`, '--scroll': `${-scroll}px` }

  return (
    <div className={`pw ${on ? 'is-on' : ''} ${invalid ? 'is-invalid' : ''}`} ref={field} style={style}>
      <input
        ref={input}
        id="password"
        name="password"
        // Text while the light is on so screen readers can read what is shown.
        type={on ? 'text' : 'password'}
        autoComplete="current-password"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyUp={syncScroll}
        onSelect={syncScroll}
        aria-invalid={invalid || undefined}
        aria-describedby="pw-hint"
      />
      <div className="pw-layer pw-dots" aria-hidden="true">
        <span>{'•'.repeat(value.length)}</span>
      </div>
      <div className="pw-layer pw-real" aria-hidden="true">
        <span>{value}</span>
      </div>
      {on && !flood && beamX !== null && <div className="pw-cone" aria-hidden="true" />}
      <button
        type="button"
        className="torch"
        aria-pressed={on}
        aria-label={on ? 'Turn the flashlight off (hide password)' : 'Turn the flashlight on (show password)'}
        onClick={toggle}
      >
        <svg viewBox="0 0 48 24" aria-hidden="true">
          <path className="torch-body" d="M4 7h22l8-4v18l-8-4H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
          <rect className="torch-switch" x="11" y="9.5" width="6" height="5" rx="1.5" />
          <path className="torch-lens" d="M34 3v18" />
          <path className="torch-glow" d="M36 6l10-4M37 12h10M36 18l10 4" />
        </svg>
      </button>
    </div>
  )
}

function Bat({ className }) {
  return (
    <svg className={`bat ${className}`} viewBox="0 0 64 28" aria-hidden="true">
      <path d="M32 9c2-4 5-4 6 0 6-6 14-7 26-3-6 2-9 6-9 11-4-3-8-3-11 1-2-4-5-5-8-3-3-2-6-1-8 3-3-4-7-4-11-1 0-5-3-9-9-11 12-4 20-3 26 3 1-4 4-4 6 0z" />
    </svg>
  )
}

function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <div className="stars" />
      <div className="moon" />
      <Bat className="b1" />
      <Bat className="b2" />
      <Bat className="b3" />
      <svg className="house" viewBox="0 0 400 260" preserveAspectRatio="xMaxYMax meet">
        <path d="M60 260V150l-20 10 70-90 20 26V60h22v52l38 48-20-10v110zM230 260V120l-18 8 58-78 58 78-18-8v140zM20 260h380v-14H20z" />
        <rect className="win" x="92" y="168" width="18" height="24" rx="9" />
        <rect className="win flicker" x="140" y="196" width="16" height="20" />
        <rect className="win" x="258" y="150" width="22" height="28" rx="11" />
        <rect className="win flicker" x="262" y="206" width="16" height="22" />
      </svg>
      <svg className="pumpkin" viewBox="0 0 120 100">
        <path className="stem" d="M56 18c0-8 4-14 10-16l3 4c-5 2-7 7-7 13z" />
        <ellipse className="skin" cx="60" cy="60" rx="54" ry="38" />
        <path className="rib" d="M60 22c-14 10-14 66 0 76M60 22c14 10 14 66 0 76M34 26c-18 14-18 56 0 68M86 26c18 14 18 56 0 68" />
        <path className="face" d="M30 48l12-10 10 10zM68 48l10-10 12 10zM52 60l8-9 8 9zM28 70c12 14 52 14 64 0-4 10-12 16-20 17l-2-6-6 6-8 0-6-6-2 6c-8-1-16-7-20-17z" />
      </svg>
      <div className="fog f1" />
      <div className="fog f2" />
      <div className="dark" />
    </div>
  )
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [torch, setTorch] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | error | done
  const [message, setMessage] = useState('')
  const [shake, setShake] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setStatus('error')
      setMessage('Both the name and the secret word, please.')
      setShake(true)
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went bump in the night. Try again.')
      setStatus('done')
      setMessage('The door creaks open…')
      setTimeout(() => window.location.replace('/'), 900)
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
      setShake(true)
    }
  }

  const invalid = status === 'error'

  return (
    <div className={`login ${status === 'done' ? 'is-done' : ''}`}>
      <Scene />
      <main className="card-wrap">
        <form className={`card ${shake ? 'shake' : ''}`} onSubmit={submit} onAnimationEnd={() => setShake(false)} noValidate>
          <p className="eyebrow">Minh · private house</p>
          <h1>Who goes there?</h1>
          <p className="sub">Say the words and the door will open. Lost? Shine the flashlight on your password.</p>

          <label htmlFor="username">Name</label>
          <input
            id="username"
            name="username"
            className="text"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={invalid || undefined}
          />

          <label htmlFor="password">Secret word</label>
          <FlashlightPassword value={password} onChange={setPassword} on={torch} setOn={setTorch} invalid={invalid} />
          <p id="pw-hint" className="hint">{torch ? 'Point the light at the letters.' : 'Click the flashlight to look.'}</p>

          <p className={`msg ${status}`} role={status === 'error' ? 'alert' : 'status'}>{message}</p>

          <button className="enter" type="submit" disabled={status === 'loading' || status === 'done'}>
            {status === 'loading' ? <span className="spin" aria-hidden="true" /> : null}
            {status === 'loading' ? 'Knocking…' : status === 'done' ? 'Welcome' : 'Enter if you dare'}
          </button>
        </form>
      </main>
    </div>
  )
}
