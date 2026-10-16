import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useContent, useLang } from '../lib/i18n'
import { goHome, openPost } from '../lib/router'
import Lines from '../components/Lines'
import Icon from '../components/Icon'
import ScrollSteps from './ScrollSteps'
import { findPost, posts, tr } from './posts'
import LoadBalancerDemo from './demos/LoadBalancerDemo'
import IdempotencyDemo from './demos/IdempotencyDemo'
import ConsumerGroupDemo from './demos/ConsumerGroupDemo'
import AgentLoopDemo from './demos/AgentLoopDemo'
import RagDemo from './demos/RagDemo'
import TokenBucketDemo from './demos/TokenBucketDemo'
import HashRingDemo from './demos/HashRingDemo'

const demos = {
  lb: LoadBalancerDemo,
  idem: IdempotencyDemo,
  kafka: ConsumerGroupDemo,
  agent: AgentLoopDemo,
  rag: RagDemo,
  bucket: TokenBucketDemo,
  ring: HashRingDemo,
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })

function Block({ block, accent, lang }) {
  switch (block.type) {
    case 'p':
      return <p className="reveal">{tr(block.text, lang)}</p>
    case 'h2':
      return <h2 className="reveal">{tr(block.text, lang)}</h2>
    case 'list':
      return (
        <ol className="post-list reveal">
          {block.items.map((it, i) => <li key={i}>{tr(it, lang)}</li>)}
        </ol>
      )
    case 'callout':
      return <aside className="callout reveal">{tr(block.text, lang)}</aside>
    case 'code':
      return (
        <div className="code-block reveal">
          <div className="card-bar"><i /><i /><i /><span>{block.lang}</span></div>
          <pre><code>{block.code}</code></pre>
        </div>
      )
    case 'steps':
      return <ScrollSteps nodes={block.nodes} steps={block.steps} accent={accent} />
    case 'demo': {
      const Demo = demos[block.demo]
      return <div className="demo-wrap reveal"><Demo /></div>
    }
    default:
      return null
  }
}

export default function Post({ slug }) {
  const root = useRef(null)
  const { lang } = useLang()
  const c = useContent()
  const post = findPost(slug)
  const idx = posts.indexOf(post)
  const next = posts[(idx + 1) % posts.length]

  useGSAP(() => {
    if (!post) return
    const q = gsap.utils.selector(root)
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from(q('.post-head .ln > span'), { yPercent: 140, stagger: 0.12, duration: 1.4 })
      .from(q('.post-meta, .post-excerpt, .post-back'), { opacity: 0, y: 20, stagger: 0.1, duration: 1 }, 0.3)
      .from(q('.post-glow'), { opacity: 0, scale: 0.6, duration: 2 }, 0)

    gsap.fromTo(q('.read-progress'), { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: q('.post-body')[0], start: 'top 80%', end: 'bottom bottom', scrub: true },
    })

    gsap.set(q('.reveal'), { opacity: 0, y: 40 })
    gsap.set(q('.next-card'), { opacity: 0, y: 80 })

    // Reveal once and stay revealed: reversing or scrubbing these left paragraphs
    // half-faded when the reader paused or scrolled back up.
    ScrollTrigger.batch(q('.reveal'), {
      start: 'top 90%',
      once: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.08, duration: 1, ease: 'expo.out', overwrite: true }),
    })

    ScrollTrigger.create({
      trigger: q('.next-card')[0],
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.fromTo(q('.next-card'), { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }),
    })
  }, { scope: root })

  if (!post) {
    return (
      <section className="post post-missing">
        <h1>404</h1>
        <button type="button" className="btn" onClick={() => goHome('#writing')}>{c.ui.allWriting}</button>
      </section>
    )
  }

  return (
    <article className="post" ref={root} style={{ '--accent': `var(--${post.accent})` }}>
      <span className="read-progress" aria-hidden="true" />
      <header className="post-head">
        <span className="post-glow" aria-hidden="true" />
        <button type="button" className="post-back" onClick={() => goHome('#writing')}>
          <Icon name="back" size={16} /> {c.ui.allWriting}
        </button>
        <div className="post-meta mono">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>·</span>
          <span>{post.read} {c.ui.minRead}</span>
          <span>·</span>
          <span className="badge">{c.ui.interactive}</span>
        </div>
        <Lines as="h1" lines={tr(post.title, lang)} />
        <p className="post-excerpt">{tr(post.excerpt, lang)}</p>
        <ul className="tags">{post.tags.map((t) => <li key={t}>{t}</li>)}</ul>
      </header>

      <div className="post-body">
        {post.blocks.map((b, i) => <Block key={i} block={b} accent={post.accent} lang={lang} />)}
      </div>

      <footer className="post-foot">
        <p className="section-tag">{c.ui.nextRead}</p>
        <button type="button" className="next-card glass" style={{ '--accent': `var(--${next.accent})` }} onClick={() => openPost(next.slug)}>
          <span className="next-title">{tr(next.title, lang).join(' ')}</span>
          <span className="next-excerpt">{tr(next.excerpt, lang)}</span>
          <span className="next-go"><Icon name="arrow" size={22} /></span>
        </button>
      </footer>
    </article>
  )
}
