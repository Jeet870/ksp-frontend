import { useState } from "react";
import { search } from "../utils/api";

export default function Search({ auth }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await search(query.trim(), auth.token);
      setResults(data.results || []);
      setTotal(data.total ?? data.results?.length ?? 0);
    } catch (e) {
      setError(e.message || "Search failed");
      setResults([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="placeholder-page">
      <div className="page-eyebrow">Karnataka State Police · Search</div>
      <div className="page-title">🔍 Search</div>
      <div className="page-subtitle">Search records and FIRs</div>

      <div className="placeholder-card" style={{ textAlign: "left" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search FIRs, crime types, stations..."
            className="form-input"
            style={{ flex: 1 }}
          />
          <button className="send-btn" onClick={handleSearch} disabled={!query.trim() || loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}

        {!error && total !== null && (
          <div style={{ marginBottom: "12px", color: "var(--text-muted)" }}>
            {total} result{total !== 1 ? "s" : ""} found
          </div>
        )}

        {results.length > 0 && (
          <div className="msg-table-wrapper">
            <table className="msg-table">
              <thead>
                <tr>
                  {Object.keys(results[0]).map((col) => (
                    <th key={col}>{col.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr key={i}>
                    {Object.keys(results[0]).map((col) => (
                      <td key={col}>{String(row[col] ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && total === 0 && (
          <div className="icon">🔍
            <p>No records found for "{query}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
