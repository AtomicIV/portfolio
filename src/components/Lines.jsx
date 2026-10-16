// Each line sits in an overflow-hidden mask so it can slide up into view.
export default function Lines({ lines, as: Tag = 'span', className = '' }) {
  return (
    <Tag className={className}>
      {lines.map((line) => (
        <span className="ln" key={line}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  )
}
