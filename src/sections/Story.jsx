import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useContent } from '../lib/i18n'
import { swapDuration, textHide, textIn } from '../lib/swap'
import Lines from '../components/Lines'

const COLS = 5
const ROWS = 3

export default function Story() {
  const root = useRef(null)
  const { story, storyImage } = useContent()

  useGSAP(() => {
    const q = gsap.utils.selector(root)

    // The photo opens up from a rounded window while the section scrolls into place.
    gsap.fromTo(q('.story-media'),
      { clipPath: 'inset(14% 12% 14% 12% round 28px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top top', scrub: true },
      })
    gsap.fromTo(q('.story-img'), { scale: 1.25 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
    })

    const boxes = q('.story-box')
    const k = swapDuration()
    gsap.set(boxes, { clipPath: 'inset(100% 0% 0% 0%)' })
    boxes.forEach((b) => textHide(b, 'p'))

    // Boxes appear once their threshold is passed and always finish animating;
    // only the colour bleed below is tied directly to the scroll position.
    const thresholds = [0.1, 0.5]
    const shown = boxes.map(() => false)
    const sync = (progress) => boxes.forEach((box, i) => {
      const want = progress >= thresholds[i]
      if (want === shown[i]) return
      shown[i] = want
      if (want) {
        gsap.fromTo(box, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8 * k, ease: 'expo.inOut', overwrite: true })
        textIn(box, 'p', 1, 0.35)
      } else {
        gsap.to(box, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.5 * k, ease: 'power2.in', overwrite: true, onComplete: () => textHide(box, 'p') })
      }
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: '+=130%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => sync(self.progress),
        onLeaveBack: () => sync(0),
      },
    })
    // Colour bleeds back into the photo one cell at a time.
    tl.to(q('.cell'), { filter: 'grayscale(0) brightness(1)', duration: 0.5, stagger: { each: 0.12, from: 'random' } }, 0)
    tl.to({}, { duration: 0.6 })
  }, { scope: root })

  return (
    <section className="story" id="story" ref={root}>
      <div className="story-media">
        <div className="story-img" aria-hidden="true">
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            const c = i % COLS
            const r = Math.floor(i / COLS)
            return (
              <span
                key={i}
                className="cell"
                style={{
                  backgroundImage: `url(${storyImage})`,
                  backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                  backgroundPosition: `${(c / (COLS - 1)) * 100}% ${(r / (ROWS - 1)) * 100}%`,
                }}
              />
            )
          })}
        </div>
        <div className="story-grid" aria-hidden="true">
          {Array.from({ length: COLS - 1 }, (_, i) => <span key={`v${i}`} className="sg v" style={{ left: `${((i + 1) / COLS) * 100}%` }} />)}
          {Array.from({ length: ROWS - 1 }, (_, i) => <span key={`h${i}`} className="sg h" style={{ top: `${((i + 1) / ROWS) * 100}%` }} />)}
        </div>
        <div className="story-boxes">
          {story.map((b, i) => (
            <article className={`story-box sb-${i}`} key={i}>
              <Lines as="h2" lines={b.title} />
              <p>{b.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
