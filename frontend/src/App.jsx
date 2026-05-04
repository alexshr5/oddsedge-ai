import { useState, useEffect } from "react";
import OddsTicker from "./components/OddsTicker";
import BetCard from "./components/BetCard";
import AnalysisPanel from "./components/AnalysisPanel";
import ChatPanel from "./components/ChatPanel";
import "./index.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [odds, setOdds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [sport, setSport] = useState("mma_mixed_martial_arts");

  const sports = [
    { key: "mma_mixed_martial_arts", label: "UFC 🥊" },
    { key: "basketball_nba", label: "NBA" },
    { key: "americanfootball_nfl", label: "NFL" },
    { key: "baseball_mlb", label: "MLB" },
    { key: "icehockey_nhl", label: "NHL" },
    { key: "soccer_epl", label: "EPL" },
  ];

  useEffect(() => {
    fetchOdds();
  }, [sport]);

  async function fetchOdds() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/odds?sport=${sport}&markets=h2h`);
      const data = await res.json();
      setOdds(Array.isArray(data) ? data.slice(0, 12) : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>

      {/* ── Header ── */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-secondary)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "var(--accent-green)",
            color: "#000",
            fontWeight: 700,
            padding: "4px 10px",
            fontSize: "14px",
            letterSpacing: "2px",
          }}>
            ODDSEDGE
          </div>
          <span style={{ color: "var(--text-dim)", fontSize: "11px" }}>
            AI SPORTS INTELLIGENCE
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "6px", height: "6px",
            borderRadius: "50%",
            background: "var(--accent-green)",
            boxShadow: "0 0 6px var(--accent-green)",
          }} />
          <span style={{ color: "var(--accent-green)", fontSize: "11px" }}>LIVE</span>
        </div>
      </header>

      {/* ── Ticker ── */}
      <OddsTicker odds={odds} />

      {/* ── Sport Selector ── */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        gap: "8px",
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <span style={{ color: "var(--text-dim)", marginRight: "8px", fontSize: "11px" }}>
          MARKET:
        </span>
        {sports.map(s => (
          <button
            key={s.key}
            onClick={() => setSport(s.key)}
            style={{
              padding: "4px 14px",
              background: sport === s.key ? "var(--accent-green)" : "transparent",
              color: sport === s.key ? "#000" : "var(--text-secondary)",
              border: `1px solid ${sport === s.key ? "var(--accent-green)" : "var(--border)"}`,
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: "inherit",
              fontWeight: sport === s.key ? 700 : 400,
              letterSpacing: "1px",
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}

        <button
          onClick={fetchOdds}
          style={{
            marginLeft: "auto",
            padding: "4px 14px",
            background: "transparent",
            color: "var(--accent-blue)",
            border: "1px solid var(--accent-blue)",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "inherit",
            letterSpacing: "1px",
          }}
        >
          ↻ REFRESH
        </button>

        <button
          onClick={() => setChatOpen(true)}
          style={{
            padding: "4px 14px",
            background: "var(--accent-blue)",
            color: "#000",
            border: "none",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "inherit",
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          AI ANALYST →
        </button>
      </div>

      {/* ── Main Grid ── */}
      <main style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "80px",
            color: "var(--text-dim)",
            letterSpacing: "3px",
          }}>
            LOADING LIVE ODDS...
          </div>
        ) : odds.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px",
            color: "var(--text-dim)",
            letterSpacing: "3px",
          }}>
            NO GAMES AVAILABLE
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "16px",
          }}>
            {odds.map(game => (
              <BetCard
                key={game.id}
                game={game}
                sport={sport}
                onSelect={setSelectedBet}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Panels ── */}
      {selectedBet && (
        <AnalysisPanel
          bet={selectedBet}
          onClose={() => setSelectedBet(null)}
        />
      )}

      {chatOpen && (
        <ChatPanel onClose={() => setChatOpen(false)} />
      )}
    </div>
  );
}