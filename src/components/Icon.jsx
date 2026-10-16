const paths = {
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
  nodes: 'M12 3v6M6 15v-3h12v3M4 15h4v5H4zM16 15h4v5h-4zM9 3h6v6H9z',
  people: 'M9 11a4 4 0 100-8 4 4 0 000 8zM2 21v-1a6 6 0 0112 0v1M16 3.5a4 4 0 010 7.5M22 21v-1a6 6 0 00-4-5.6',
  arrow: 'M7 17L17 7M8 7h9v9',
  back: 'M19 12H5M11 6l-6 6 6 6',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  check: 'M5 12l5 5L20 7',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  play: 'M7 5l12 7-12 7z',
  reset: 'M4 4v6h6M20 12a8 8 0 10-2.3 5.7M4 10a8 8 0 012-3.5',
  chevron: 'M6 9l6 6 6-6',
}

export default function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}
