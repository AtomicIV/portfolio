import { useEffect, useRef, useState } from 'react'
import { useContent } from '../lib/i18n'
import { goHome } from '../lib/router'
import { lockScroll, scrollTo } from '../lib/scroll'

const targets = ['#about', '#work', '#career', '#writing', '#contact']

export default function Nav({ onHome }) {
  const c = useContent()
  const [open, setOpen] = useState(false)
  const menuBtn = useRef(null)
  const firstLink = useRef(null)

  const go = (e, target) => {
    e.preventDefault()
    // Unlock first: a stopped Lenis ignores scrollTo.
    setOpen(false)
    lockScroll(false)
    if (onHome) scrollTo(target)
    else goHome(target)
  }

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    firstLink.current?.focus()
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      menuBtn.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => () => lockScroll(false), [])

  return (
    <header className={`site-nav ${open ? 'menu-open' : ''}`}>
      <a href="#top" className="brand" onClick={(e) => go(e, '#top')}>
        <span className="brand-mark">M</span>{c.name}
      </a>
      <nav aria-label="Primary">
        {targets.map((href, i) => (
          <a key={href} href={href} onClick={(e) => go(e, href)}>{c.ui.nav[i]}</a>
        ))}
      </nav>
      <div className="nav-right">
        <a className="nav-cta" href="#contact" onClick={(e) => go(e, '#contact')}>{c.ui.talk}</a>
        <button
          ref={menuBtn}
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span />
        </button>
      </div>

      <div className="mobile-menu" id="mobile-menu" inert={!open}>
        <nav aria-label="Mobile">
          {targets.map((href, i) => (
            <a
              key={href}
              ref={i === 0 ? firstLink : undefined}
              href={href}
              style={{ '--i': i }}
              onClick={(e) => go(e, href)}
            >
              <small>0{i + 1}</small>{c.ui.nav[i]}
            </a>
          ))}
        </nav>
        <p className="mobile-menu-foot">{c.role} · {c.location}</p>
      </div>
    </header>
  )
}
