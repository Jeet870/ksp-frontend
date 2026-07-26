import { useState, useEffect } from "react";
import { getForecast } from "../../utils/api";

export default function Forecast({ auth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setError("Request timed out. The server may be slow or unreachable.");
        setLoading(false);
      }
    }, 15000);

    getForecast(auth.token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => {
        clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [auth.token]);

  return (
    <div className="placeholder-page">
      <div className="page-eyebrow">Karnataka State Police · Forecast</div>
      <div className="page-title">🔮 Forecast</div>
      <div className="page-subtitle">Predictive crime forecasting</div>

      <div className="placeholder-card" style={{ textAlign: "left" }}>
        {loading && <p>Loading forecast...</p>}
        {!loading && error && <div className="error-box">⚠️ {error}</div>}

        {!loading && !error && data && (
          <>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Method: {data.method}
            </div>

            {(data.predictions || []).length === 0 && (
              <p>Not enough recent case history in {data.district} to project a forecast.</p>
            )}

            {(data.predictions || []).length > 0 && (
              <div className="msg-table-wrapper">
                <table className="msg-table">
                  <thead>
                    <tr>
                      <th>Crime Type</th>
                      <th>Avg. Monthly (last 3 mo)</th>
                      <th>Predicted Next Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.predictions.map((p) => (
                      <tr key={p.crime_type}>
                        <td>{p.crime_type}</td>
                        <td>{p.avg_monthly_last_3mo}</td>
                        <td>{p.predicted_next_month}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
