import { useEffect, useLayoutEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LangProvider, getContent } from './lib/i18n'
import { jumpTo, startSmoothScroll } from './lib/scroll'
import { takePendingAnchor, useRoute } from './lib/router'
import { findPost, tr } from './blog/posts'
import Nav from './components/Nav'
import Cursor from './components/Cursor'
import Hero from './sections/Hero'
import Story from './sections/Story'
import About from './sections/About'
import Work from './sections/Work'
import Career from './sections/Career'
import Writing from './sections/Writing'
import Playground from './sections/Playground'
import Contact from './sections/Contact'
import Post from './blog/Post'

// After a remount, measure the new pins, jump, and land on the finished frame
// instead of scrubbing through every timeline between 0 and the target.
function settleAt(target) {
  ScrollTrigger.refresh()
  jumpTo(target)
  ScrollTrigger.update()
  // getTween() is false (not undefined) for triggers without scrub.
  ScrollTrigger.getAll().forEach((st) => {
    const tween = st.getTween()
    if (tween) tween.progress(1)
  })
}

const lang = 'en'
const content = getContent(lang)
const langValue = { lang, content }

export default function App() {
  const route = useRoute()

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    return startSmoothScroll()
  }, [])

  useEffect(() => {
    const post = route.name === 'post' && findPost(route.slug)
    document.title = post ? `${tr(post.title, lang).join(' ')} — ${content.name}` : `${content.name} — ${content.role}`
  }, [route])

  // New page: start at the top, or at the section the nav asked for.
  useLayoutEffect(() => {
    const id = setTimeout(() => settleAt(takePendingAnchor() ?? 0), 30)
    return () => clearTimeout(id)
  }, [route.name, route.slug])

  const onHome = route.name === 'home'

  return (
    <LangProvider value={langValue}>
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Nav onHome={onHome} />
      <main key={`${route.name}:${route.slug ?? ''}`}>
        {onHome ? (
          <>
            <Hero />
            <Story />
            <About />
            <Work />
            <Career />
            <Writing />
            <Playground />
          </>
        ) : (
          <Post slug={route.slug} />
        )}
        <Contact />
      </main>
    </LangProvider>
  )
}
