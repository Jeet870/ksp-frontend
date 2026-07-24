import { useState, useRef } from "react";
import { askQuestion } from "../utils/api";

export default function ChatInterface({ auth }) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState([
    {
      id: 1, role: "agent",
      text: `Namaskara ${auth.name}! I am the KSP Intelligence Assistant. How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = {
      id: Date.now(), role: "user", text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const data = await askQuestion(userMsg.text, sessionId, auth.token);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "agent",
        text: data.answer,
        responseType: data.response_type,
        records: data.records,
        recordCount: data.record_count,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, role: "agent", text: `⚠️ ${e.message}`, time: "",
      }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((prev) => [...prev, {
        id: Date.now(), role: "agent",
        text: "⚠️ Voice input isn't supported in this browser. Try Chrome or Edge.",
        time: "",
      }]);
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Renders a simple table for multi-row backend responses.
  const renderTable = (records) => {
    if (!records || records.length === 0) return null;
    const columns = Object.keys(records[0]);
    return (
      <div className="msg-table-wrapper">
        <table className="msg-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col.replace(/_/g, " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col}>{String(row[col] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-avatar">KS</div>
        <div>
          <div className="chat-name">KSP Intelligence Assistant</div>
          <div className="chat-status">● Online · Secure Channel</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`msg-row ${msg.role}`}>
            <div className={`msg-bubble ${msg.role}`}>
              <div>{msg.text}</div>
              {msg.responseType === "table" && renderTable(msg.records)}
              {msg.time && <div className="msg-time">{msg.time}</div>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg-row agent">
            <div className="msg-bubble agent" style={{color:'var(--text-muted)'}}>
              Analysing...
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <div className="chat-input-row">
          <button
            className={`mic-btn${listening ? " mic-btn-active" : ""}`}
            aria-label="Voice input"
            onClick={handleMicClick}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10a7 7 0 0 1-14 0M12 19v4M8 23h8"/>
            </svg>
          </button>
          <input
            className="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? "Listening..." : "Ask about cases, FIRs, suspects..."}
          />
          <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading}>
            Send
          </button>
        </div>
        <div className="session-id">Session: {sessionId.slice(0,8)} · Secure</div>
      </div>
    </div>
  );
}
