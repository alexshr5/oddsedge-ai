export default function OddsTicker({ odds }) {
  if (!odds || odds.length === 0) return null;

  const items = odds.flatMap(game => {
    const bookmaker = game.bookmakers?.[0];
    const market = bookmaker?.markets?.[0];
    if (!market) return [];
    return market.outcomes.map(outcome => ({
      team: outcome.name,
      price: outcome.price > 0 ? `+${outcome.price}` : `${outcome.price}`,
      game: `${game.away_team} @ ${game.home_team}`,
    }));
  });

  const doubled = [...items, ...items];

  return (
    <div style={{
      background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border)",
      overflow: "hidden",
      padding: "8px 0",
      position: "relative",
    }}>
      {/* fade edges */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "60px",
        background: "linear-gradient(to right, var(--bg-secondary), transparent)",
        zIndex: 2,
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "60px",
        background: "linear-gradient(to left, var(--bg-secondary), transparent)",
        zIndex: 2,
      }} />

      <div style={{
        display: "flex",
        gap: "0",
        animation: "ticker 40s linear infinite",
        width: "max-content",
      }}>
        {doubled.map((item, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "0 24px",
            borderRight: "1px solid var(--border)",
            whiteSpace: "nowrap",
          }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
              {item.team}
            </span>
            <span style={{
              color: item.price.startsWith("+") ? "var(--accent-green)" : "var(--accent-red)",
              fontWeight: 600,
              fontSize: "12px",
            }}>
              {item.price}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}