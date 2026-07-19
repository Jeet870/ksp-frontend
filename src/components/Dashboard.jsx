const CONSTABLE_ITEMS = [
  { label: "My Cases",  icon: "📁", desc: "View and manage your assigned cases" },
  { label: "Search",    icon: "🔍", desc: "Search records and case files" },
];

const SP_ITEMS = [
  { label: "District Overview", icon: "🗺️", desc: "District-wide activity and reports" },
  { label: "Analytics",         icon: "📊", desc: "Crime trends, stats and analytics" },
  { label: "Forecast",          icon: "🔮", desc: "Predictive crime forecasting" },
  { label: "Crime Graph",       icon: "🕸️", desc: "Network visualization" },
  { label: "Map",               icon: "🗾", desc: "Geographic crime map" },
  { label: "Search",            icon: "🔍", desc: "Search all records" },
];

const STATS = [
  { label: "Active Cases",  value: "142", accent: false },
  { label: "Solved Today",  value: "08",  accent: true  },
  { label: "Pending FIRs",  value: "23",  accent: false },
  { label: "Active Alerts", value: "05",  accent: false },
];

export default function Dashboard({ role, name }) {
  const items = role === "SP" ? SP_ITEMS : CONSTABLE_ITEMS;

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Karnataka State Police · Dashboard</div>
        <div className="page-title">Welcome, {name}</div>
        <div className="page-subtitle">
          {role} · {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </div>
      </div>

      <div className="stat-grid" style={{marginTop:'24px'}}>
        {STATS.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value${s.accent ? " stat-accent" : ""}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{padding:'0 32px 8px'}}>
        <div className="page-eyebrow">Quick Access</div>
      </div>

      <div className="card-grid">
        {items.map((item) => (
          <div className="card" key={item.label}>
            <div className="card-icon">{item.icon}</div>
            <div className="card-title">{item.label}</div>
            <div className="card-desc">{item.desc}</div>
            <div className="card-arrow">Open →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
