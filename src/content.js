// All copy lives here. Numbers come from the CV — keep them factual.
// `shared` holds language-neutral data; `text[lang]` holds the words,
// in the same order as the matching shared arrays.

import { aboutShared, aboutText } from './about'


const shared = {
  name: 'Minh',
  wordmark: 'MINH',
  // Base64 so the address never sits in the page as plain text; decoded on click.
  emailB64: 'ZGFtcXVhbmdtaW5oMDEwMTAxQGdtYWlsLmNvbQ==',
  linkedin: 'https://linkedin.com/in/riotjester',
  storyImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80',
  heroStats: [
    { value: 12, max: 15, suffix: '+', color: 'orange' },
    { value: 50, max: 60, suffix: 'K', color: 'blue' },
    { value: 25, max: 30, suffix: '', color: 'teal' },
  ],
  chapters: [
    { no: '01', years: '2014 — 2020', pill: { value: 6, icon: 'code' } },
    { no: '02', years: '2020 — 2023', pill: { value: 50000, icon: 'nodes' } },
    { no: '03', years: '2024 — now', pill: { value: 25, icon: 'people' } },
  ],
  projects: [
    { name: 'Promotion', org: 'Hasaki.vn', tags: ['Go', 'MongoDB', 'Redis Sentinel', 'gRPC'], screen: 'dashboard' },
    { name: 'Payments', org: 'Hasaki.vn', tags: ['Go', 'Kafka Connect', 'RabbitMQ'], screen: 'list' },
    { name: 'Streaming', org: 'VieON', tags: ['Go', 'Python', 'gRPC gateway'], screen: 'chart' },
    { name: 'Team', org: 'Hasaki.vn', tags: ['Hiring', 'Roadmap', 'AI workflow'], screen: 'org' },
  ],
  approach: [
    { value: 6, color: 'orange' },
    { value: 5, color: 'blue' },
    { value: 25, color: 'teal' },
  ],
  career: [
    { years: '2024 — Now', company: 'Hasaki.vn' },
    { years: '2020 — 2023', company: 'VieON' },
    { years: '2020', company: 'MangoAds' },
    { years: '2018 — 2020', company: 'GMO Internet Group' },
    { years: '2014 — 2018', company: 'FOIS ICT PRO' },
  ],
  stack: [
    'Go', 'gRPC', 'Kafka', 'Kafka Connect', 'RabbitMQ', 'MongoDB', 'MySQL', 'Redis Sentinel',
    'Docker', 'CI/CD', 'Python', 'PHP', 'Java', 'C#', 'Next.js', 'Microservices', 'Event-driven', 'CDC',
  ],
}

const text = {
  en: {
    role: 'Backend Technical Lead',
    location: 'Ho Chi Minh City, Vietnam',
    ui: {
      nav: ['About', 'Work', 'Career', 'Writing', 'Contact'],
      talk: "Let's talk",
      scroll: 'Scroll to begin',
      heroTitle: ['From code', 'to teams'],
      work: 'Selected work',
      approach: 'Approach',
      approachTitle: ['Pick the right tool,', 'not the favourite one'],
      career: 'Career',
      stack: 'Tech stack',
      contactTag: 'Next chapter',
      contactTitle: ['Building', "what's next"],
      contactSide: ['Engineer at heart,', 'leader by choice'],
      contactText: 'Looking for a Backend Engineering Manager role — owning both the platform and the people who build it.',
      contactCta: 'Get in touch',
      langs: 'Vietnamese · English · Japanese',
      showEmail: 'Show email',
      copy: 'Copy',
      copied: 'Copied',
      send: 'Send',
      details: 'Details',
      writing: 'Writing',
      writingTitle: ['Tech, explained', 'with moving parts'],
      writingText: 'Short essays on systems I work with — each one has a simulation you can poke at.',
      read: 'Read',
      minRead: 'min read',
      interactive: 'Interactive',
      allWriting: 'All writing',
      nextRead: 'Next read',
      playground: 'Playground',
      playgroundTitle: ['Ask the', 'terminal'],
      playgroundHint: 'Type a command, or tap one below.',
      topics: { all: 'All', ai: 'AI', systems: 'Systems', payments: 'Payments' },
    },
    heroStats: ['Years', 'Peak CCU', 'Engineers'],
    chapters: [
      {
        label: 'Engineer',
        title: ['Write', 'the code'],
        text: 'Five years on banking systems for Japanese enterprise clients — three on-site in Nagoya — then Go microservices over gRPC at GMO Internet.',
        pill: 'Languages in production',
      },
      {
        label: 'Architect',
        title: ['Scale', 'the platform'],
        text: 'At VieON, set the architecture and standards for new services and moved Python & PHP to Go — without interrupting a single subscriber.',
        pill: 'Concurrent viewers',
      },
      {
        label: 'Lead',
        title: ['Grow', 'the team'],
        text: 'At Hasaki.vn, set the backend up from scratch and grew it to 25 engineers across five product domains.',
        pill: 'Engineers on the team',
      },
    ],
    story: [
      { title: ['Built', 'from zero'], text: 'Set up Hasaki’s backend from an empty repo: Go, microservices, gRPC contracts and the standards 25 engineers now build on.' },
      { title: ['Shipped', 'at scale'], text: '50,000 concurrent viewers at VieON. Peak-campaign checkout at Vietnam’s largest beauty e-commerce platform.' },
    ],
    projects: [
      { title: ['Promotion', 'engine'], text: 'A high-performance service resolving complex discount and voucher rules at checkout — sequenced against live campaign traffic.', metric: 'Peak-campaign ready' },
      { title: ['Payment', 'platform'], text: 'Checkout and settlement across ZaloPay, VNPay, Techcombank, Stripe and Fiserv US — behind one typed gRPC contract.', metric: '5 payment providers' },
      { title: ['Streaming', 'at 50K CCU'], text: 'Content, User and Payment services, transcoding to HLS/DASH, a CI-style task pipeline and rule-based CDN routing.', metric: '50,000 concurrent viewers' },
      { title: ['25 engineers,', '5 domains'], text: 'Promotion, Payment, BOM, PLM and Market Price — one backend group, with AI review on every change and runbooks new hires onboard from.', metric: 'From zero to 25' },
    ],
    approach: [
      { unit: 'languages', title: 'Language-agnostic', text: 'Go, Python, PHP, Java, C# and JavaScript in production. With AI in the loop, design and judgement matter more than syntax.' },
      { unit: 'industries', title: 'Domain-agnostic', text: 'Japanese banking → infrastructure → ad-tech → OTT streaming → e-commerce & manufacturing. Each entered cold, each delivered.' },
      { unit: 'engineers', title: 'Early on new tooling', text: 'Rebuilt the team’s workflow around AI while it was still optional — automated review, task visibility and custom agent skills.' },
    ],
    career: [
      { role: 'Backend Technical Lead', note: 'Vietnam’s largest beauty e-commerce · team of 25', details: ["Set the project up from scratch; chose Go and microservices, and standardised service-to-service calls on typed gRPC contracts.","Designed the data and messaging layer: Redis Sentinel, MongoDB, Kafka Connect for change-data capture, RabbitMQ for async work.","Rolled AI through the workflow — automated review on every change, task visibility, and custom agent skills written against the codebase.","Own the backend roadmap: break epics into tasks and sequence them against live promotion campaigns."] },
      { role: 'Senior Software Engineer', note: 'OTT streaming · 50K CCU · Python/PHP → Go', details: ["Worked on scaling the platform to 50,000 concurrent viewers at peak.","Led the incremental migration of Content, User and Payment from Python and PHP to Go, without interrupting subscribers.","Built Transcode (HLS/DASH), a GitLab-CI-style Task Pipeline, and rule-based CDN routing for playback.","Designed the local → staging → production CI/CD pipeline with the Systems team; onboarded and trained new engineers."] },
      { role: 'Senior Software Engineer', note: 'Ad-tech · Laravel → Go · Next.js storefront', details: ["Migrated a Laravel application to Go.","Built the Hoa Sen Group e-commerce storefront with Next.js."] },
      { role: 'Senior Software Engineer', note: 'Go & PHP microservices over gRPC', details: ["Built and maintained microservices in Go and PHP on MySQL, communicating over gRPC."] },
      { role: 'Software Developer', note: 'Japanese banking & e-commerce · on-site in Nagoya', details: ["Maintained and extended banking systems, e-commerce sites and Android apps in PHP, C# and Java.","Five years with Japanese enterprise clients — three of them on-site in Nagoya."] },
    ],
  },
}

const zip = (base, words) => base.map((b, i) => ({ ...b, ...words[i] }))

export function getContent(lang) {
  const t = text[lang] ?? text.en
  return {
    ...shared,
    role: t.role,
    location: t.location,
    ui: t.ui,
    heroStats: shared.heroStats.map((s, i) => ({ ...s, label: t.heroStats[i] })),
    chapters: shared.chapters.map((c, i) => ({
      ...c,
      ...t.chapters[i],
      pill: { ...c.pill, label: t.chapters[i].pill },
    })),
    story: t.story,
    projects: zip(shared.projects, t.projects),
    approach: zip(shared.approach, t.approach),
    career: zip(shared.career, t.career),
    about: { ...aboutShared, ...(aboutText[lang] ?? aboutText.en) },
  }
}
