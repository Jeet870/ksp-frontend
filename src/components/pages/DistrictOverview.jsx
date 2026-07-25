import { useState, useEffect } from "react";
import { getDistrictOverview } from "../../utils/api";

function Bar({ label, count, max }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
        <span>{label}</span>
        <span>{count}</span>
      </div>
      <div style={{ background: "#1e293b", borderRadius: "6px", height: "8px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: "#eab308", height: "100%" }} />
      </div>
    </div>
  );
}

export default function DistrictOverview({ auth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getDistrictOverview(auth.token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [auth.token]);

  const maxStatus = data ? Math.max(...data.by_status.map((s) => s.count), 1) : 1;
  const maxCrime = data ? Math.max(...data.by_crime_type.map((c) => c.count), 1) : 1;

  return (
    <div className="placeholder-page">
      <div className="page-eyebrow">Karnataka State Police · District Overview</div>
      <div className="page-title">🗺️ District Overview</div>
      <div className="page-subtitle">District-wide activity</div>

      <div className="placeholder-card" style={{ textAlign: "left" }}>
        {loading && <p>Loading district overview...</p>}
        {!loading && error && <div className="error-box">⚠️ {error}</div>}

        {!loading && !error && data && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{data.district}</div>
              <div style={{ fontSize: "32px", fontWeight: 700 }}>{data.total_firs}</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Total FIRs</div>
            </div>

            <h4 style={{ marginBottom: "10px" }}>By Status</h4>
            {data.by_status.map((s) => (
              <Bar key={s.status} label={s.status} count={s.count} max={maxStatus} />
            ))}

            <h4 style={{ margin: "20px 0 10px" }}>By Crime Type</h4>
            {data.by_crime_type.map((c) => (
              <Bar key={c.crime_type} label={c.crime_type} count={c.count} max={maxCrime} />
            ))}

            <h4 style={{ margin: "20px 0 10px" }}>Recent FIRs</h4>
            <div className="msg-table-wrapper">
              <table className="msg-table">
                <thead>
                  <tr>
                    <th>FIR Number</th>
                    <th>Crime Type</th>
                    <th>Date Filed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_firs.map((f, i) => (
                    <tr key={i}>
                      <td>{f.fir_number}</td>
                      <td>{f.crime_type}</td>
                      <td>{f.date_filed}</td>
                      <td>{f.status}</td>
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
