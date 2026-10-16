import { useEffect, useState } from 'react'
import { jumpTo } from './scroll'

// Tiny hash router: '#/blog/<slug>' is a post, anything else is the home page.
// Plain '#section' anchors are never written to the URL (nav scrolls in JS).

function parse() {
  const h = window.location.hash
  if (h.startsWith('#/blog/')) return { name: 'post', slug: decodeURIComponent(h.slice(7)) }
  return { name: 'home' }
}

export function useRoute() {
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

let pendingAnchor = null

export function openPost(slug) {
  // Leave the current page from the top so its pins unwind cleanly.
  jumpTo(0)
  window.location.hash = `/blog/${slug}`
}

// Go back to the home page and scroll to a section once it has mounted.
export function goHome(anchor = '#top') {
  pendingAnchor = anchor
  jumpTo(0)
  window.location.hash = '/'
}

export function takePendingAnchor() {
  const a = pendingAnchor
  pendingAnchor = null
  return a
}
