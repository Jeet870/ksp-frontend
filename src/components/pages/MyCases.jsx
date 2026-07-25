import { useState, useEffect } from "react";
import { getMyCases } from "../../utils/api";

export default function MyCases({ auth }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCases() {
      setLoading(true);
      setError("");
      try {
        const data = await getMyCases(auth.token);
        if (!cancelled) setCases(data.cases || []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load cases");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCases();
    return () => { cancelled = true; };
  }, [auth.token]);

  return (
    <div className="placeholder-page">
      <div className="page-eyebrow">Karnataka State Police · My Cases</div>
      <div className="page-title">📁 My Cases</div>
      <div className="page-subtitle">Your assigned cases</div>

      <div className="placeholder-card" style={{ textAlign: "left" }}>
        {loading && <p>Loading your cases...</p>}

        {!loading && error && <div className="error-box">⚠️ {error}</div>}

        {!loading && !error && cases.length === 0 && (
          <>
            <div className="icon">📁</div>
            <p>No cases are currently assigned to you.</p>
          </>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="msg-table-wrapper">
            <table className="msg-table">
              <thead>
                <tr>
                  <th>FIR Number</th>
                  <th>Crime Type</th>
                  <th>Date Filed</th>
                  <th>Status</th>
                  <th>District</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.fir_id}>
                    <td>{c.fir_number}</td>
                    <td>{c.crime_type}</td>
                    <td>{c.date_filed}</td>
                    <td>{c.status}</td>
                    <td>{c.district}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
