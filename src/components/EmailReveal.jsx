import { useEffect, useRef, useState } from 'react'
import { useContent } from '../lib/i18n'
import { prefersReducedMotion } from '../lib/scroll'
import Icon from './Icon'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@._-#$%&'

export const decodeEmail = (b64) => atob(b64)

// The address is only decoded when someone asks for it, then "decrypts" in place.
export default function EmailReveal({ className = '' }) {
  const c = useContent()
  const [email, setEmail] = useState(null)
  const [shown, setShown] = useState('')
  const [copied, setCopied] = useState(false)
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const reveal = () => {
    const target = decodeEmail(c.emailB64)
    setEmail(target)
    if (prefersReducedMotion()) {
      setShown(target)
      return
    }
    const start = performance.now()
    const step = (now) => {
      const settled = Math.floor((now - start) / 28)
      const out = target
        .split('')
        .map((ch, i) => (i < settled ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join('')
      setShown(out)
      if (settled < target.length) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard blocked — the address is visible and selectable anyway
    }
  }

  if (!email) {
    return (
      <button type="button" className={`btn email-btn ${className}`} onClick={reveal}>
        <Icon name="mail" size={16} /> {c.ui.showEmail}
      </button>
    )
  }

  return (
    <div className={`email-revealed ${className}`} aria-live="polite">
      <span className="email-text mono">{shown}</span>
      <button type="button" className="chip-btn" onClick={copy}>
        <Icon name={copied ? 'check' : 'copy'} size={14} /> {copied ? c.ui.copied : c.ui.copy}
      </button>
      <a className="chip-btn" href={`mailto:${email}`}>
        <Icon name="arrow" size={14} /> {c.ui.send}
      </a>
    </div>
  )
}
