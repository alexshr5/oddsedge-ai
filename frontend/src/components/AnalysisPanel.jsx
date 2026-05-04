import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AnalysisPanel({ bet, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const { game, sport } = bet;
  const bookmaker = game.bookmakers?.[0];
  const market = bookmaker?.markets?.[0];
  const outcomes = market?.outcomes || [];

  useEffect(() => {
    fetchAnalysis();
  }, [game.id]);

  async function fetchAnalysis() {
    setLoading(true);
    try {
      const odds = {};
      outcomes.forEach(o => { odds[o.name] = o.price; });

      const res = await fetch(`${API}/analyze`, {
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
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function recommendationColor(rec) {
    if (!rec) return "var(--text-dim)";
    if (rec.includes("STRONG")) return "var(--accent-green)";
    if (rec.includes("LEAN")) return "var(--accent-yellow)";
    if (rec.includes("FADE")) return "var(--accent-red)";
    return "var(--text-secondary)";
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
        overflowY: "auto",
        padding: "24px",
      }}>

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}>
          <div>
            <div style={{
              fontSize: "10px",
              color: "var(--accent-green)",
              letterSpacing: "2px",
              marginBottom: "6px",
            }}>
              AI ANALYSIS
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600 }}>
              {game.away_team}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", margin: "2px 0" }}>
              @ {game.home_team}
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

        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--text-dim)",
            letterSpacing: "2px",
          }}>
            <div style={{ marginBottom: "12px", fontSize: "24px" }}>⚡</div>
            CLAUDE IS ANALYZING...
          </div>
        ) : analysis ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Recommendation */}
            <div style={{
              border: `1px solid ${recommendationColor(analysis.recommendation)}`,
              padding: "16px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "10px", color: "var(--text-dim)", marginBottom: "8px" }}>
                RECOMMENDATION
              </div>
              <div style={{
                fontSize: "22px",
                fontWeight: 700,
                color: recommendationColor(analysis.recommendation),
                letterSpacing: "3px",
              }}>
                {analysis.recommendation}
              </div>
              <div style={{
                marginTop: "8px",
                fontSize: "13px",
                color: recommendationColor(analysis.recommendation),
              }}>
                {analysis.confidence}/100 CONFIDENCE
              </div>
            </div>

            {/* Summary */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              padding: "16px",
            }}>
              <div style={{
                fontSize: "10px",
                color: "var(--text-dim)",
                letterSpacing: "2px",
                marginBottom: "10px",
              }}>
                SUMMARY
              </div>
              <p style={{
                color: "var(--text-primary)",
                lineHeight: 1.7,
                fontSize: "12px",
              }}>
                {analysis.summary}
              </p>
            </div>

            {/* Value Analysis */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              padding: "16px",
            }}>
              <div style={{
                fontSize: "10px",
                color: "var(--text-dim)",
                letterSpacing: "2px",
                marginBottom: "10px",
              }}>
                VALUE ANALYSIS
              </div>
              <p style={{
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                fontSize: "12px",
              }}>
                {analysis.value_analysis}
              </p>
            </div>

            {/* Key Factors */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              padding: "16px",
            }}>
              <div style={{
                fontSize: "10px",
                color: "var(--text-dim)",
                letterSpacing: "2px",
                marginBottom: "10px",
              }}>
                KEY FACTORS
              </div>
              {analysis.key_factors?.map((f, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "8px",
                  fontSize: "12px",
                }}>
                  <span style={{ color: "var(--accent-green)" }}>▸</span>
                  <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Risks */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              padding: "16px",
            }}>
              <div style={{
                fontSize: "10px",
                color: "var(--text-dim)",
                letterSpacing: "2px",
                marginBottom: "10px",
              }}>
                RISKS
              </div>
              {analysis.risks?.map((r, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "8px",
                  fontSize: "12px",
                }}>
                  <span style={{ color: "var(--accent-red)" }}>▸</span>
                  <span style={{ color: "var(--text-secondary)" }}>{r}</span>
                </div>
              ))}
            </div>

            {/* Sharp Money */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--accent-blue)",
              padding: "16px",
            }}>
              <div style={{
                fontSize: "10px",
                color: "var(--accent-blue)",
                letterSpacing: "2px",
                marginBottom: "10px",
              }}>
                SHARP MONEY NOTE
              </div>
              <p style={{
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                fontSize: "12px",
              }}>
                {analysis.sharp_money_note}
              </p>
            </div>

          </div>
        ) : (
          <div style={{ color: "var(--accent-red)", textAlign: "center", padding: "40px" }}>
            FAILED TO LOAD ANALYSIS
          </div>
        )}
      </div>
    </>
  );
}