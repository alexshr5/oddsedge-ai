 import { useState, useRef, useEffect } from "react";

const API = "http://localhost:8000";

export default function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to OddsEdge AI. I'm your personal sports betting analyst. Ask me anything — line movement, value bets, bankroll strategy, or breakdowns on any game.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Connection error. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 200,
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "480px",
        background: "var(--bg-secondary)",
        borderLeft: "1px solid var(--border)",
        zIndex: 201,
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <div style={{
              fontSize: "10px",
              color: "var(--accent-blue)",
              letterSpacing: "2px",
              marginBottom: "4px",
            }}>
              AI SPORTS ANALYST
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>
              Ask me anything
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "4px 10px",
              fontFamily: "inherit",
              fontSize: "12px",
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                fontSize: "9px",
                color: "var(--text-dim)",
                letterSpacing: "1px",
                marginBottom: "4px",
              }}>
                {msg.role === "user" ? "YOU" : "ODDSEDGE AI"}
              </div>
              <div style={{
                maxWidth: "85%",
                padding: "12px 14px",
                background: msg.role === "user" ? "var(--accent-blue)" : "var(--bg-card)",
                border: `1px solid ${msg.role === "user" ? "var(--accent-blue)" : "var(--border)"}`,
                color: msg.role === "user" ? "#000" : "var(--text-primary)",
                fontSize: "12px",
                lineHeight: 1.7,
                fontFamily: "inherit",
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{
                fontSize: "9px",
                color: "var(--text-dim)",
                letterSpacing: "1px",
                marginBottom: "4px",
              }}>
                ODDSEDGE AI
              </div>
              <div style={{
                padding: "12px 14px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-dim)",
                fontSize: "12px",
                letterSpacing: "2px",
              }}>
                ANALYZING...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: "8px",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any game, bet, or strategy..."
            rows={2}
            style={{
              flex: 1,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              padding: "10px 12px",
              fontFamily: "inherit",
              fontSize: "12px",
              resize: "none",
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: "0 16px",
              background: loading || !input.trim() ? "var(--border)" : "var(--accent-green)",
              color: "#000",
              border: "none",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          >
            SEND
          </button>
        </div>

      </div>
    </>
  );
}