import { useState, useEffect } from "react";
import { getMapView } from "../../utils/api";

// Approximate real-world coordinates for common Bengaluru localities.
// Matched against police_station names via substring match, since exact
// lat/long isn't tracked in the current database schema.
const LOCALITY_COORDS = {
  "jp nagar":        [12.9081, 77.5831],
  "koramangala":     [12.9352, 77.6245],
  "btm layout":      [12.9166, 77.6101],
  "indiranagar":     [12.9784, 77.6408],
  "whitefield":      [12.9698, 77.7500],
  "electronic city": [12.8452, 77.6602],
  "jayanagar":       [12.9250, 77.5938],
  "malleshwaram":    [13.0027, 77.5697],
  "rajajinagar":     [12.9915, 77.5526],
  "yeshwanthpur":    [13.0284, 77.5372],
  "hebbal":          [13.0358, 77.5970],
  "hsr layout":      [12.9116, 77.6389],
  "marathahalli":    [12.9569, 77.7011],
  "banashankari":    [12.9250, 77.5667],
  "vijayanagar":     [12.9719, 77.5352],
  "basavanagudi":    [12.9422, 77.5738],
  "ulsoor":          [12.9815, 77.6206],
  "shivajinagar":    [12.9852, 77.6045],
};

const BOUNDS = { minLat: 12.82, maxLat: 13.05, minLng: 77.45, maxLng: 77.76 };
const MAP_W = 760, MAP_H = 460;

function latLngToXY(lat, lng) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * MAP_W;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * MAP_H;
  return [x, y];
}

// Simple deterministic hash so an unmatched station name always lands in
// the same spot on the map (rather than a random one on every render).
function hashToXY(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const x = 60 + (hash % (MAP_W - 120));
  const y = 60 + ((hash >> 8) % (MAP_H - 120));
  return [x, y];
}

function findCoords(stationName) {
  const normalized = stationName.toLowerCase().replace(/\bps\b|\bpolice station\b/g, "").trim();
  for (const key of Object.keys(LOCALITY_COORDS)) {
    if (normalized.includes(key)) {
      return { xy: latLngToXY(...LOCALITY_COORDS[key]), matched: true };
    }
  }
  return { xy: hashToXY(normalized), matched: false };
}

export default function MapView({ auth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMapView(auth.token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [auth.token]);

  const maxCases = data ? Math.max(...data.stations.map((s) => s.total_cases), 1) : 1;
  const anyUnmatched = data ? data.stations.some((s) => !findCoords(s.police_station).matched) : false;

  return (
    <div className="placeholder-page">
      <div className="page-eyebrow">Karnataka State Police · Map View</div>
      <div className="page-title">🗾 Map View</div>
      <div className="page-subtitle">Case distribution by location</div>

      <div className="placeholder-card" style={{ textAlign: "left" }}>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
          Note: exact GPS coordinates aren't tracked in the current dataset. Markers use
          approximate real-world positions for known Bengaluru localities matched from each
          station's name{anyUnmatched ? "; unmatched stations are placed at a fixed approximate position and marked with a dashed ring" : ""}.
        </div>

        {loading && <p>Loading map data...</p>}
        {!loading && error && <div className="error-box">⚠️ {error}</div>}

        {!loading && !error && data && (
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            style={{ width: "100%", height: "480px", background: "#0f172a", borderRadius: "12px", border: "1px solid #334155" }}
          >
            <rect x={4} y={4} width={MAP_W - 8} height={MAP_H - 8} fill="none" stroke="#334155" strokeWidth={2} rx={12} />

            {data.stations.map((s) => {
              const { xy, matched } = findCoords(s.police_station);
              const [x, y] = xy;
              const r = 10 + (s.total_cases / maxCases) * 22;
              const isHovered = hovered === s.police_station;
              return (
                <g key={s.police_station}
                   onMouseEnter={() => setHovered(s.police_station)}
                   onMouseLeave={() => setHovered(null)}
                   style={{ cursor: "pointer" }}>
                  <circle
                    cx={x} cy={y} r={r}
                    fill={isHovered ? "#f59e0b" : "#3b82f6"}
                    fillOpacity={0.75}
                    stroke={matched ? "#93c5fd" : "#94a3b8"}
                    strokeWidth={matched ? 2 : 2}
                    strokeDasharray={matched ? "none" : "4,3"}
                  />
                  <text x={x} y={y - r - 6} textAnchor="middle" fontSize="11" fill="#e2e8f0">
                    {s.police_station}
                  </text>
                  {isHovered && (
                    <text x={x} y={y + r + 16} textAnchor="middle" fontSize="11" fill="#fbbf24">
                      {s.total_cases} total · {s.active_cases} active
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {!loading && !error && data && (
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ marginBottom: "10px" }}>All Stations</h4>
            <div className="msg-table-wrapper">
              <table className="msg-table">
                <thead>
                  <tr>
                    <th>Police Station</th>
                    <th>Total Cases</th>
                    <th>Active Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stations.map((s) => (
                    <tr key={s.police_station}>
                      <td>{s.police_station}</td>
                      <td>{s.total_cases}</td>
                      <td>{s.active_cases}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
