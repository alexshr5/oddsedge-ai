# OddsEdge AI 🎯

An AI-powered sports betting analysis platform that combines live odds data with Claude AI to deliver real-time bet recommendations, confidence scoring, and conversational analysis.

**Live Demo:** [oddsedge-ai.vercel.app](https://oddsedge-ai.vercel.app)

---

## What It Does

OddsEdge AI pulls live odds from major sportsbooks and runs them through an AI analyst to help users make more informed betting decisions. It is built as a portfolio project to demonstrate full-stack AI product development.

- **Live Odds Feed** — Pulls real-time odds across sports and markets via The Odds API
- **AI Bet Analysis** — Sends odds data to Claude (claude-opus-4-5) for structured analysis including recommendation, confidence score, value assessment, key factors, and risks
- **Bet Scoring** — Scores any bet 0–100 with a label (Strong Bet → Avoid)
- **AI Chat** — Conversational sports betting analyst powered by Claude with responsible gambling reminders built in

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, CSS |
| Backend | Python, FastAPI, Uvicorn |
| AI | Anthropic Claude API (claude-opus-4-5) |
| Odds Data | The Odds API |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Architecture

```
User Browser
    │
    ▼
Vercel (React/Vite Frontend)
    │  VITE_API_URL
    ▼
Render (FastAPI Backend)
    ├── /odds      → The Odds API
    ├── /analyze   → Anthropic Claude API
    ├── /score     → Anthropic Claude API
    └── /chat      → Anthropic Claude API
```

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- Anthropic API key
- The Odds API key ([free tier available](https://the-odds-api.com))

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `/backend`:

```
ANTHROPIC_API_KEY=your_key_here
ODDS_API_KEY=your_key_here
```

Start the server:

```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/odds?sport=&markets=` | Live odds for a sport/market |
| GET | `/sports` | List of available sports |
| POST | `/analyze` | AI analysis of a specific bet |
| POST | `/score` | 0–100 score for a bet |
| POST | `/chat` | Conversational AI analyst |

---

## Deployment

**Backend → Render**
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment variables: `ANTHROPIC_API_KEY`, `ODDS_API_KEY`

**Frontend → Vercel**
- Root directory: `frontend`
- Environment variables: `VITE_API_URL=https://your-render-url.onrender.com`

> Note: Render free tier spins down after inactivity. First request after idle may take ~30 seconds.

---

## Disclaimer

OddsEdge AI is a portfolio and educational project. It is not financial or gambling advice. Always gamble responsibly and within your means.
