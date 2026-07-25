import { useState, useEffect } from "react";
import { getAnalytics } from "../../utils/api";

export default function Analytics({ auth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAnalytics(auth.token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [auth.token]);

  const maxMonth = data ? Math.max(...data.monthly_trend.map((m) => m.count), 1) : 1;

  return (
    <div className="placeholder-page">
      <div className="page-eyebrow">Karnataka State Police · Analytics</div>
      <div className="page-title">📊 Analytics</div>
      <div className="page-subtitle">Crime trends and statistics</div>

      <div className="placeholder-card" style={{ textAlign: "left" }}>
        {loading && <p>Loading analytics...</p>}
        {!loading && error && <div className="error-box">⚠️ {error}</div>}

        {!loading && !error && data && (
          <>
            <div style={{ display: "flex", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "28px", fontWeight: 700 }}>{data.closure_rate_percent}%</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Closure Rate</div>
              </div>
              <div>
                <div style={{ fontSize: "28px", fontWeight: 700 }}>{data.total_closed}</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Closed</div>
              </div>
              <div>
                <div style={{ fontSize: "28px", fontWeight: 700 }}>{data.total_pending}</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Pending</div>
              </div>
            </div>

            <h4 style={{ marginBottom: "10px" }}>Monthly Trend (last 12 months)</h4>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "140px", marginBottom: "24px" }}>
              {data.monthly_trend.map((m) => (
                <div key={m.month} style={{ flex: 1, textAlign: "center" }}>
                  <div
                    title={`${m.month}: ${m.count}`}
                    style={{
                      background: "#eab308",
                      height: `${Math.max((m.count / maxMonth) * 100, 4)}px`,
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                  <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {m.month.slice(5)}
                  </div>
                </div>
              ))}
            </div>

            <h4 style={{ margin: "20px 0 10px" }}>Top Crime Types</h4>
            <div className="msg-table-wrapper">
              <table className="msg-table">
                <thead>
                  <tr>
                    <th>Crime Type</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_crime_types.map((c) => (
                    <tr key={c.crime_type}>
                      <td>{c.crime_type}</td>
                      <td>{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
