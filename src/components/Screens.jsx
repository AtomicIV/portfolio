// Abstract product UIs shown inside the browser mockup. Elements with
// .bar / .row / .draw are animated by the Work section timeline.
// Illustrative only — the real numbers live in content.js.

function Dashboard() {
  const bars = [30, 42, 38, 55, 48, 70, 62, 96, 88, 58, 50, 44]
  return (
    <div className="scr scr-dash">
      <div className="kpis">
        {[['Campaign', '11.11'], ['Rules', 'Live'], ['Cache', 'Sentinel']].map(([k, v]) => (
          <div className="kpi row" key={k}><span>{k}</span><b>{v}</b></div>
        ))}
      </div>
      <div className="bars">
        {bars.map((h, i) => <span key={i} className="bar" style={{ height: `${h}%` }} />)}
      </div>
      <div className="scr-caption">Checkout traffic · campaign day</div>
    </div>
  )
}

function Chart() {
  return (
    <div className="scr scr-chart">
      <div className="kpis">
        <div className="kpi row"><span>Peak CCU</span><b>50,000</b></div>
        <div className="kpi row"><span>Formats</span><b>HLS · DASH</b></div>
      </div>
      <svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
        <path className="draw line-a" pathLength="1" d="M0 100 L25 96 L50 92 L75 85 L100 88 L125 70 L150 62 L175 40 L200 18 L225 12 L250 30 L275 52 L300 60" />
        <path className="draw line-b" pathLength="1" d="M0 112 L25 110 L50 108 L75 104 L100 105 L125 98 L150 94 L175 86 L200 78 L225 76 L250 84 L275 92 L300 96" />
      </svg>
      <div className="scr-caption">Concurrent viewers · live event</div>
    </div>
  )
}

function List() {
  const rows = [['ZaloPay', 'Domestic'], ['VNPay', 'Domestic'], ['Techcombank', 'Domestic'], ['Stripe', 'International'], ['Fiserv US', 'International']]
  return (
    <div className="scr scr-list">
      {rows.map(([name, scope]) => (
        <div className="svc row" key={name}>
          <span className="dot ok" /><span className="mono">{name}</span><span className="muted">{scope}</span>
          <span className="deploy">gRPC</span>
        </div>
      ))}
    </div>
  )
}

function Org() {
  return (
    <div className="scr scr-org">
      <div className="org-node row lead">Backend group · 25</div>
      <div className="org-row">
        {['Promotion', 'Payment', 'BOM', 'PLM', 'Pricing'].map((t) => (
          <div className="org-col row" key={t}>
            <div className="org-node">{t}</div>
            <div className="org-dots"><i /><i /><i /><i /><i /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const screens = { dashboard: Dashboard, chart: Chart, list: List, org: Org }
