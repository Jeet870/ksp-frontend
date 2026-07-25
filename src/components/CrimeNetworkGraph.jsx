import { useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import { BASE_URL } from "../utils/api";

// ── Hardcoded test data (Day 15-16) ──────────────────────────────────────────
const TEST_NODES = [
  { data: { id: "a1", label: "Ravi Kumar",    type: "accused", district: "Bengaluru" } },
  { data: { id: "a2", label: "Suresh Naik",   type: "accused", district: "Mysuru"    } },
  { data: { id: "f1", label: "FIR-2024-001",  type: "FIR",     district: "Bengaluru" } },
  { data: { id: "v1", label: "KA-01-AB-1234", type: "vehicle", district: "Bengaluru" } },
  { data: { id: "a3", label: "Mohan Das",     type: "accused", district: "Hubli"     } },
];

const TEST_EDGES = [
  { data: { id: "e1", source: "a1", target: "f1", relationship: "co-accused"  } },
  { data: { id: "e2", source: "a2", target: "f1", relationship: "co-accused"  } },
  { data: { id: "e3", source: "a1", target: "v1", relationship: "financial"   } },
  { data: { id: "e4", source: "a2", target: "a3", relationship: "phone_calls" } },
];

// ── Node & Edge styles (Day 19-21) ───────────────────────────────────────────
const STYLESHEET = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      "text-valign": "bottom",
      "text-halign": "center",
      "font-size": "11px",
      "text-margin-y": "6px",
      width: 45,
      height: 45,
      "border-width": 2,
      "border-color": "#fff",
      color: "#1f2937",
    },
  },
  {
    selector: "node[type='accused']",
    style: { "background-color": "#ef4444" },
  },
  {
    selector: "node[type='FIR']",
    style: {
      "background-color": "#f97316",
      shape: "rectangle",
      width: 60,
      height: 35,
      "font-size": "10px",
    },
  },
  {
    selector: "node[type='vehicle']",
    style: {
      "background-color": "#3b82f6",
      shape: "diamond",
    },
  },
  {
    selector: "edge[relationship='phone_calls']",
    style: {
      "line-style": "dashed",
      "line-color": "#9ca3af",
      width: 2,
      "target-arrow-shape": "triangle",
      "target-arrow-color": "#9ca3af",
      "curve-style": "bezier",
      label: "call",
      "font-size": "9px",
      color: "#6b7280",
    },
  },
  {
    selector: "edge[relationship='financial']",
    style: {
      "line-style": "solid",
      "line-color": "#22c55e",
      width: 2,
      "target-arrow-shape": "triangle",
      "target-arrow-color": "#22c55e",
      "curve-style": "bezier",
      label: "financial",
      "font-size": "9px",
      color: "#16a34a",
    },
  },
  {
    selector: "edge[relationship='co-accused']",
    style: {
      "line-style": "solid",
      "line-color": "#6b7280",
      width: 2,
      "target-arrow-shape": "triangle",
      "target-arrow-color": "#6b7280",
      "curve-style": "bezier",
      label: "co-accused",
      "font-size": "9px",
      color: "#4b5563",
    },
  },
  {
    selector: "node:selected",
    style: {
      "border-color": "#6366f1",
      "border-width": 3,
    },
  },
];

// ── Legend data (Day 19-21) ───────────────────────────────────────────────────
const LEGEND = [
  { label: "Accused",    color: "#ef4444", shape: "circle"  },
  { label: "FIR",        color: "#f97316", shape: "square"  },
  { label: "Vehicle",    color: "#3b82f6", shape: "diamond" },
  { label: "Phone call", color: "#9ca3af", dash: true       },
  { label: "Financial",  color: "#22c55e", dash: false      },
  { label: "Co-accused", color: "#6b7280", dash: false      },
];

export default function CrimeNetworkGraph({ auth }) {
  const cyRef    = useRef(null);
  const [firId,  setFirId]  = useState("");
  const [elements, setElements] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [tooltip,  setTooltip]  = useState(null);
  const [useTest,  setUseTest]  = useState(false);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.on("mouseover", "node", (e) => {
      const node     = e.target;
      const pos      = node.renderedPosition();
      const container = cy.container().getBoundingClientRect();
      setTooltip({
        x:        container.left + pos.x + 10,
        y:        container.top  + pos.y - 40,
        label:    node.data("label"),
        type:     node.data("type"),
        district: node.data("district"),
      });
    });

    cy.on("mouseout", "node", () => setTooltip(null));

    return () => {
      cy.removeListener("mouseover");
      cy.removeListener("mouseout");
    };
  }, [elements]);

  // ── Fetch live data from API (Day 17-18) ───────────────────────────────────
  const fetchGraph = async () => {
    if (!firId.trim()) {
      setError("Please enter a FIR ID.");
      return;
    }
    setLoading(true);
    setError("");
    setTooltip(null);

    try {
      const res = await fetch(
        `${BASE_URL}/graph?fir_id=${encodeURIComponent(firId)}`,
        {
          headers: { Authorization: `Bearer ${auth?.token || ""}` },
        }
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      if (!data.nodes || data.nodes.length === 0) {
        setError("No graph data found for this FIR ID.");
        setElements([]);
        setUseTest(false);
        return;
      }

      const nodes = data.nodes.map((n) => ({
        data: {
          id:       n.id,
          label:    n.label   || n.id,
          type:     n.type    || "accused",
          district: n.district || "N/A",
        },
      }));

      const edges = (data.edges || []).map((e, i) => ({
        data: {
          id:           `e${i}`,
          source:       e.source,
          target:       e.target,
          relationship: e.relationship || "co-accused",
        },
      }));

      setElements([...nodes, ...edges]);
      setUseTest(false);
    } catch (err) {
      setError(`⚠️ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportPNG = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const png = cy.png({ scale: 2, full: true, bg: "#ffffff" });
    const a   = document.createElement("a");
    a.href     = png;
    a.download = `crime-network-${firId || "test"}.png`;
    a.click();
  };

  const resetToTest = () => {
    setElements([...TEST_NODES, ...TEST_EDGES]);
    setUseTest(true);
    setFirId("");
    setError("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0f172a" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>


      <div style={{
        background: "#1e293b",
        borderBottom: "1px solid #334155",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
      }}>
        <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: 0, marginRight: "8px", whiteSpace: "nowrap" }}>
          🕸️ Crime Network Graph
        </h1>

        <input
          type="text"
          value={firId}
          onChange={(e) => setFirId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchGraph()}
          placeholder="Enter FIR number e.g. FIR-2024-JP-002"
          style={{
            flex: "1 1 220px",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #475569",
            background: "#0f172a",
            color: "#f1f5f9",
            fontSize: "14px",
            outline: "none",
          }}
        />

        <button
          onClick={fetchGraph}
          disabled={loading}
          style={{
            background: loading ? "#475569" : "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Loading..." : "Load Graph"}
        </button>

        <button
          onClick={exportPNG}
          style={{
            background: "#16a34a",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Export PNG
        </button>
      </div>

      {error && (
        <div style={{
          margin: "12px 24px 0",
          background: "#450a0a",
          border: "1px solid #7f1d1d",
          color: "#fca5a5",
          fontSize: "14px",
          padding: "10px 16px",
          borderRadius: "10px",
        }}>
          {error}
        </div>
      )}

      <div style={{
        flex: 1, position: "relative", overflow: "hidden", margin: "16px",
        background: "#1e293b", borderRadius: "16px", border: "1px solid #334155",
      }}>

        {loading && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(15,23,42,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10, borderRadius: "16px",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px", height: "40px", border: "4px solid #2563eb",
                borderTopColor: "transparent", borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>Loading graph...</p>
            </div>
          </div>
        )}

        {!loading && elements.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "#64748b" }}>
              <p style={{ fontSize: "36px", marginBottom: "12px" }}>🕸️</p>
              <p style={{ fontWeight: 500 }}>
                {error ? "No graph data found" : "Enter a FIR number above to visualize its case network"}
              </p>
            </div>
          </div>
        )}

        {elements.length > 0 && (
          <CytoscapeComponent
            elements={elements}
            stylesheet={STYLESHEET}
            layout={{ name: "cose", animate: true, padding: 40 }}
            style={{ width: "100%", height: "100%" }}
            cy={(cy) => { cyRef.current = cy; }}
            userZoomingEnabled={true}
            userPanningEnabled={true}
          />
        )}

        <div style={{
          position: "absolute", bottom: "16px", left: "16px",
          background: "#0f172a", border: "1px solid #334155", borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)", padding: "12px 16px", fontSize: "12px",
        }}>
          <p style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: "8px", marginTop: 0 }}>Legend</p>
          {LEGEND.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              {item.shape ? (
                <div
                  style={{
                    width: "12px", height: "12px", flexShrink: 0,
                    backgroundColor: item.color,
                    borderRadius: item.shape === "circle" ? "50%" : "2px",
                    transform: item.shape === "diamond" ? "rotate(45deg)" : "none",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "20px", height: 0, flexShrink: 0,
                    borderTop: item.dash ? `2px dashed ${item.color}` : `2px solid ${item.color}`,
                  }}
                />
              )}
              <span style={{ color: "#cbd5e1" }}>{item.label}</span>
            </div>
          ))}
        </div>

        {tooltip && (
          <div
            style={{
              position: "fixed", zIndex: 50, background: "#0f172a", color: "#fff",
              fontSize: "12px", padding: "8px 12px", borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)", pointerEvents: "none",
              left: tooltip.x, top: tooltip.y,
            }}
          >
            <p style={{ fontWeight: 600, margin: 0 }}>{tooltip.label}</p>
            <p style={{ color: "#94a3b8", margin: 0 }}>Type: {tooltip.type}</p>
            <p style={{ color: "#94a3b8", margin: 0 }}>District: {tooltip.district}</p>
          </div>
        )}
      </div>
    </div>
  );
}
