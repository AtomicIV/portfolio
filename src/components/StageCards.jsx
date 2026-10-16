// The three "objects" the hero story rotates through: code → architecture → team.

export function TerminalCard() {
  return (
    <div className="card glass-strong">
      <div className="card-bar"><i /><i /><i /><span>~/payment/checkout.go</span></div>
      <pre className="code">
{`func (s *Server) Charge(ctx, req) (*Receipt, error) {`}
{'\n'}<span className="c-k">  if</span>{` err := req.Validate(); err != nil {`}
{'\n'}<span className="c-k">    return</span>{` nil, status.Invalid(err)`}
{'\n  }'}
{'\n'}<span className="c-c">  // idempotent: a retry must never double-charge</span>
{'\n  '}<span className="c-k">if</span>{` r, ok := s.cache.Receipt(ctx, req.Key); ok {`}
{'\n    '}<span className="c-k">return</span>{` r, nil`}
{'\n  }'}
{'\n  '}<span className="c-k">return</span>{` s.gateway(req.Provider).Charge(ctx, req)`}
{'\n}'}
      </pre>
      <div className="card-foot"><span className="dot ok" /> review passed <span className="muted">· go test ./... ok</span></div>
    </div>
  )
}

export function ArchCard() {
  return (
    <div className="card glass-strong">
      <div className="card-bar"><i /><i /><i /><span>architecture.md</span></div>
      <div className="arch">
        <div className="node">Web · Mobile · TV</div>
        <div className="wire" />
        <div className="node accent">gRPC Gateway</div>
        <div className="wire" />
        <div className="node-row">
          <div className="node">Content</div>
          <div className="node">User</div>
          <div className="node">Payment</div>
        </div>
        <div className="wire" />
        <div className="node-row">
          <div className="node dim">Kafka</div>
          <div className="node dim">MongoDB</div>
          <div className="node dim">Redis</div>
        </div>
      </div>
    </div>
  )
}

const domains = ['Promotion', 'Payment', 'BOM', 'PLM', 'Pricing']

export function TeamCard() {
  return (
    <div className="card glass-strong">
      <div className="card-bar"><i /><i /><i /><span>backend-team / sprint</span></div>
      <div className="team">
        <div className="domains">
          {domains.map((d, i) => <span key={d} className={`chip chip-${i % 3}`}>{d}</span>)}
        </div>
        <div className="avatars">
          {Array.from({ length: 9 }, (_, i) => <span key={i} className={`av av-${i % 3}`} />)}
          <span className="av more">+16</span>
        </div>
        <ul className="notes">
          <li><span className="dot ok" />AI review on every change</li>
          <li><span className="dot ok" />Runbooks up to date</li>
          <li><span className="dot warn" />Capacity check before campaign</li>
        </ul>
      </div>
    </div>
  )
}
