import { useState, useEffect } from "react";
import { getMapView } from "../../utils/api";

function StationBar({ station, total, active, max }) {
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
        <span>{station}</span>
        <span>{total} total · {active} active</span>
      </div>
      <div style={{ background: "#1e293b", borderRadius: "6px", height: "10px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: "#3b82f6", height: "100%" }} />
      </div>
    </div>
  );
}

export default function MapView({ auth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMapView(auth.token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [auth.token]);

  const max = data ? Math.max(...data.stations.map((s) => s.total_cases), 1) : 1;

  return (
    <div className="placeholder-page">
      <div className="page-eyebrow">Karnataka State Police · Map View</div>
      <div className="page-title">🗾 Map View</div>
      <div className="page-subtitle">Case distribution by police station</div>

      <div className="placeholder-card" style={{ textAlign: "left" }}>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
          Note: geographic coordinates aren't tracked in the current dataset — this shows
          case volume grouped by police station instead of a pin-drop map.
        </div>

        {loading && <p>Loading station data...</p>}
        {!loading && error && <div className="error-box">⚠️ {error}</div>}

        {!loading && !error && data && data.stations.map((s) => (
          <StationBar
            key={s.police_station}
            station={s.police_station}
            total={s.total_cases}
            active={s.active_cases}
            max={max}
          />
        ))}
      </div>
    </div>
  );
}
