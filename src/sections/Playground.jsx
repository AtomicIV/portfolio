import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useContent, useLang } from '../lib/i18n'
import { openPost } from '../lib/router'
import { scrollTo } from '../lib/scroll'
import { posts, tr } from '../blog/posts'
import { decodeEmail } from '../components/EmailReveal'
import Lines from '../components/Lines'

const SUGGEST = ['help', 'whoami', 'neofetch', 'experience hasaki', 'skills', 'education', 'blog', 'contact', 'sudo hire-me']
const SECTIONS = ['top', 'about', 'work', 'career', 'writing', 'contact']
const FILES = ['about.txt', 'education.txt', 'skills.json', 'contact.txt']
const START_YEAR = 2014

const HELP = [
  ['whoami', 'who is this'],
  ['about', 'the short version'],
  ['neofetch', 'system info, but it’s me'],
  ['experience [company]', 'career, or details for one company'],
  ['projects', 'selected work'],
  ['skills [n|name]', 'core competencies'],
  ['stack', 'tools I build with'],
  ['education', 'degree & school'],
  ['languages', 'spoken languages'],
  ['industries', 'where I have shipped'],
  ['payments', 'payment providers integrated'],
  ['ai', 'how the team uses AI'],
  ['blog', 'interactive posts'],
  ['open <n|slug>', 'open a post'],
  ['goto <section>', SECTIONS.join(' | ')],
  ['contact', 'how to reach me'],
  ['ls / cat <file>', 'browse the home directory'],
  ['uptime · date · echo · history · ping · coffee', 'misc'],
  ['clear', 'wipe the screen'],
]

export default function Playground() {
  const root = useRef(null)
  const input = useRef(null)
  const screen = useRef(null)
  const c = useContent()
  const { lang } = useLang()
  const [lines, setLines] = useState(() => [
    { kind: 'sys', text: 'minh-os 2.0 — type `help`, press Tab to autocomplete, ↑ for history' },
  ])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState([])
  const [hIdx, setHIdx] = useState(-1)

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 70%', toggleActions: 'play none none none' } })
      .from(q('.pg-head .ln > span'), { yPercent: 140, stagger: 0.1, duration: 1.2, ease: 'expo.out' })
      .from(q('.term'), { y: 80, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0.1)
      .from(q('.pg-chips button'), { opacity: 0, y: 12, stagger: 0.04, duration: 0.6 }, 0.5)
  }, { scope: root })

  useEffect(() => {
    const el = screen.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const a = c.about
  const companyMatch = (q) => c.career.find((j) => j.company.toLowerCase().includes(q.toLowerCase()))
  const files = {
    'about.txt': () => [a.summary],
    'education.txt': () => [`${a.degree}`, `${a.school} · ${a.schoolYears}`],
    'skills.json': () => JSON.stringify(Object.fromEntries(a.groups.map((g) => [g.label, g.items])), null, 2).split('\n'),
    'contact.txt': () => ['run `contact` to reveal the address'],
  }

  const commands = {
    help: (say) => HELP.forEach(([cmd, desc]) => say(`${cmd.padEnd(26)} ${desc}`)),
    whoami: (say) => {
      say(`${c.name} — ${c.role}`, 'accent')
      say(`${c.location} · ${new Date().getFullYear() - START_YEAR}+ yrs · ${c.ui.langs}`)
      say(c.ui.contactText)
    },
    about: (say) => say(a.summary),
    neofetch: (say) => {
      const art = ['  __  __ ', ' |  \\/  |', ' | |\\/| |', ' | |  | |', ' |_|  |_|']
      const info = [
        `${c.name}@portfolio`,
        `role      ${c.role}`,
        `uptime    ${new Date().getFullYear() - START_YEAR} years`,
        `team      25 engineers · 5 domains`,
        `peak      50,000 concurrent viewers`,
        `langs     ${a.langLevels.map((l) => l.code).join(' · ')}`,
        `stack     Go · gRPC · Kafka · MongoDB · Redis`,
      ]
      const rows = Math.max(art.length, info.length)
      for (let i = 0; i < rows; i++) say(`${(art[i] || '').padEnd(12)} ${info[i] || ''}`, i === 0 ? 'accent' : 'out')
    },
    experience: (say, args) => {
      if (args[0]) {
        const j = companyMatch(args.join(' '))
        if (!j) return say(`no company matching "${args.join(' ')}" — try: ${c.career.map((x) => x.company.split(' ')[0].toLowerCase()).join(', ')}`, 'err')
        say(`${j.company} · ${j.role} · ${j.years}`, 'accent')
        j.details.forEach((d) => say(`  • ${d}`))
        return
      }
      c.career.forEach((j) => say(`${j.years.padEnd(13)} ${j.company.padEnd(20)} ${j.role}`))
      say('tip: experience vieon', 'sys')
    },
    projects: (say) => c.projects.forEach((p) => say(`${p.org.padEnd(11)} ${p.title.join(' ').padEnd(28)} ${p.metric}`)),
    skills: (say, args) => {
      if (!args[0]) {
        a.groups.forEach((g, i) => say(`${i + 1}. ${g.label}  (${g.items.length})`))
        say('tip: skills 2', 'sys')
        return
      }
      const n = Number(args[0])
      const g = Number.isInteger(n) ? a.groups[n - 1] : a.groups.find((x) => x.label.toLowerCase().startsWith(args.join(' ').toLowerCase()))
      if (!g) return say('no such group — run `skills`', 'err')
      say(g.label, 'accent')
      g.items.forEach((it) => say(`  • ${it}`))
    },
    stack: (say) => say(c.stack.join(' · ')),
    education: (say) => {
      say(a.degree, 'accent')
      say(`${a.school} · ${a.schoolYears}`)
    },
    languages: (say) => a.langLevels.forEach((l, i) => say(`${l.code}  ${a.langNames[i].padEnd(12)} ${a.langNotes[i]}`)),
    industries: (say) => say(a.industryList.join('  →  ')),
    payments: (say) => say(a.providers.join(' · ')),
    ai: (say) => a.groups[1].items.forEach((it) => say(`• ${it}`)),
    blog: (say) => {
      posts.forEach((p, i) => say(`${i + 1}. ${tr(p.title, lang).join(' ')}`, 'link', { slug: p.slug }))
      say('tip: open 1', 'sys')
    },
    open: (say, args) => {
      const n = Number(args[0])
      const p = Number.isInteger(n) ? posts[n - 1] : posts.find((x) => x.slug.startsWith(args[0] || '~'))
      if (!p) return say('usage: open <number|slug>', 'err')
      say(`opening ${p.slug}…`, 'accent')
      setTimeout(() => openPost(p.slug), 400)
    },
    goto: (say, args) => {
      const s = SECTIONS.find((x) => x === (args[0] || '').toLowerCase())
      if (!s) return say(`usage: goto ${SECTIONS.join(' | ')}`, 'err')
      say(`→ #${s}`, 'accent')
      setTimeout(() => scrollTo(`#${s}`), 300)
    },
    contact: (say) => {
      say(decodeEmail(c.emailB64), 'accent')
      say(c.linkedin)
    },
    hire: (say) => say(a.lookingText, 'accent'),
    ls: (say) => say(FILES.join('   ')),
    cat: (say, args) => {
      const f = files[args[0]]
      if (!f) return say(`cat: ${args[0] || ''}: no such file — try \`ls\``, 'err')
      f().forEach((line) => say(line))
    },
    uptime: (say) => say(`up ${new Date().getFullYear() - START_YEAR} years, shipping since ${START_YEAR}, load average: 25 engineers`),
    date: (say) => say(new Date().toString()),
    echo: (say, args) => say(args.join(' ')),
    history: (say) => history.slice().reverse().forEach((h, i) => say(`${String(i + 1).padStart(3)}  ${h}`)),
    ping: (say) => {
      say('PING minh (hcmc.vn): 56 data bytes')
      say('64 bytes from minh: icmp_seq=0 ttl=64 time=0.42 ms — online and replying', 'accent')
    },
    coffee: (say) => say('☕ brewing… estimated time to production: one standup.', 'accent'),
    sudo: (say, args) => {
      if (args.join(' ') !== 'hire-me') return say('nice try.', 'err')
      say('[sudo] password for recruiter: ********')
      say('✓ access granted — opening contact…', 'accent')
      setTimeout(() => scrollTo('#contact'), 700)
    },
  }
  commands.career = commands.experience
  commands.summary = commands.about
  commands.domains = commands.industries
  commands.looking = commands.hire

  const run = (raw) => {
    const cmd = raw.trim()
    if (!cmd) return
    setHistory((h) => [cmd, ...h])
    setHIdx(-1)
    const [name, ...args] = cmd.split(/\s+/)
    if (name.toLowerCase() === 'clear') {
      setLines([])
      return
    }
    const out = []
    const say = (text, kind = 'out', extra = {}) => out.push({ kind, text, ...extra })
    const fn = commands[name.toLowerCase()]
    if (fn) fn(say, args)
    else say(`command not found: ${name} — try \`help\``, 'err')
    setLines((l) => [...l, { kind: 'cmd', text: cmd }, ...out])
  }

  // Tab completes the command, then its argument (sections, posts, files…).
  const complete = (text) => {
    const parts = text.split(' ')
    const pool = parts.length === 1
      ? [...Object.keys(commands), 'clear']
      : {
          goto: SECTIONS,
          open: posts.map((p) => p.slug),
          cat: FILES,
          experience: c.career.map((j) => j.company.split(' ')[0].toLowerCase()),
          sudo: ['hire-me'],
        }[parts[0]] || []
    const last = parts[parts.length - 1]
    const hits = pool.filter((p) => p.startsWith(last))
    if (hits.length === 1) return [...parts.slice(0, -1), hits[0]].join(' ') + (parts.length === 1 ? ' ' : '')
    if (hits.length > 1) setLines((l) => [...l, { kind: 'sys', text: hits.join('   ') }])
    return text
  }

  const onKey = (e) => {
    if (e.key === 'Enter') {
      run(value)
      setValue('')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      setValue(complete(value))
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault()
      const i = Math.min(hIdx + 1, history.length - 1)
      setHIdx(i)
      setValue(history[i])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const i = Math.max(hIdx - 1, -1)
      setHIdx(i)
      setValue(i < 0 ? '' : history[i])
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  return (
    <section className="playground" id="playground" ref={root}>
      <div className="pg-head">
        <p className="section-tag">{c.ui.playground}</p>
        <Lines as="h2" lines={c.ui.playgroundTitle} />
        <p className="pg-hint">{c.ui.playgroundHint}</p>
      </div>

      <div className="term glass-strong" onClick={() => input.current?.focus({ preventScroll: true })}>
        <div className="card-bar"><i /><i /><i /><span>minh@portfolio: ~</span></div>
        <div className="term-screen" ref={screen} aria-live="polite" data-lenis-prevent>
          {lines.map((l, i) =>
            l.kind === 'cmd' ? (
              <div key={i} className="t-line"><span className="t-prompt">❯</span> {l.text}</div>
            ) : l.kind === 'link' ? (
              <button key={i} type="button" className="t-line t-link" onClick={() => openPost(l.slug)}>{l.text}</button>
            ) : (
              <div key={i} className={`t-line t-${l.kind}`}>{l.text}</div>
            ),
          )}
          <label className="t-input">
            <span className="t-prompt">❯</span>
            <input
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              spellCheck="false"
              autoComplete="off"
              autoCapitalize="off"
              aria-label="Terminal command"
            />
          </label>
        </div>
      </div>

      <div className="pg-chips">
        {SUGGEST.map((s) => (
          <button key={s} type="button" className="chip-btn mono" onClick={() => run(s)}>{s}</button>
        ))}
      </div>
    </section>
  )
}
