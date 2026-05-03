import { useState, useEffect } from "react";

const API = "http://localhost:8000";

export default function BetCard({ game, sport, onSelect }) {
  const [score, setScore] = useState(null);
  const [loadingScore, setLoadingScore] = useState(true);

  const bookmaker = game.bookmakers?.[0];
  const market = bookmaker?.markets?.[0];
  const outcomes = market?.outcomes || [];

  useEffect(() => {
    fetchScore();
  }, [game.id]);

  async function fetchScore() {
    try {
      const odds = {};
      outcomes.forEach(o => { odds[o.name] = o.price; });

      const res = await fetch(`${API}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport,
          home_team: game.home_team,
          away_team: game.away_team,
          market: "h2h",
          odds,
        }),
      });
      const data = await res.json();
      setScore(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScore(false);
    }
  }

  function scoreColor(s) {
    if (s >= 70) return "var(--accent-green)";
    if (s >= 50) return "var(--accent-yellow)";
    return "var(--accent-red)";
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div
      onClick={() => onSelect({ game, sport })}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.15s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = "1px solid var(--border-bright)";
        e.currentTarget.style.background = "var(--bg-hover)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = "1px solid var(--border)";
        e.currentTarget.style.background = "var(--bg-card)";
      }}
    >
      {/* AI Score Bar */}
      {!loadingScore && score && (
        <div style={{
          position: "absolute",
          top: 0, left: 0,
          height: "2px",
          width: `${score.score}%`,
          background: scoreColor(score.score),
          transition: "width 1s ease",
        }} />
      )}

      {/* Sport + Date */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "12px",
      }}>
        <span style={{
          fontSize: "10px",
          color: "var(--accent-blue)",
          letterSpacing: "2px",
        }}>
          {sport.split("_")[1]?.toUpperCase()}
        </span>
        <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>
          {formatDate(game.commence_time)}
        </span>
      </div>

      {/* Teams */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "4px",
        }}>
          {game.away_team}
        </div>
        <div style={{ fontSize: "10px", color: "var(--text-dim)", marginBottom: "4px" }}>
          @
        </div>
        <div style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--text-primary)",
        }}>
          {game.home_team}
        </div>
      </div>

      {/* Odds */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "16px",
      }}>
        {outcomes.map((outcome, i) => (
          <div key={i} style={{
            flex: 1,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            padding: "8px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "10px", color: "var(--text-dim)", marginBottom: "4px" }}>
              {outcome.name.split(" ").slice(-1)[0].toUpperCase()}
            </div>
            <div style={{
              fontSize: "15px",
              fontWeight: 700,
              color: outcome.price > 0 ? "var(--accent-green)" : "var(--accent-red)",
            }}>
              {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
            </div>
          </div>
        ))}
      </div>

      {/* AI Score */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid var(--border)",
        paddingTop: "12px",
      }}>
        {loadingScore ? (
          <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>
            AI SCORING...
          </span>
        ) : score ? (
          <>
            <span style={{
              fontSize: "10px",
              color: scoreColor(score.score),
              letterSpacing: "1px",
            }}>
              {score.label}
            </span>
            <span style={{
              fontSize: "18px",
              fontWeight: 700,
              color: scoreColor(score.score),
            }}>
              {score.score}
            </span>
          </>
        ) : null}
        <span style={{
          fontSize: "10px",
          color: "var(--text-dim)",
          marginLeft: "auto",
          paddingLeft: "8px",
        }}>
          CLICK TO ANALYZE →
        </span>
      </div>
    </div>
  );
}