import os
import httpx
import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List

load_dotenv()

app = FastAPI(title="OddsEdge AI", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allows your React frontend to talk to this backend without browser blocks.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Clients ───────────────────────────────────────────────────────────────────
ODDS_API_KEY = os.getenv("ODDS_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ODDS_BASE_URL = "https://api.the-odds-api.com/v4"

anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


# ── Pydantic Models ───────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    sport: str
    home_team: str
    away_team: str
    market: str
    odds: dict


class ScoreRequest(BaseModel):
    sport: str
    home_team: str
    away_team: str
    market: str
    odds: dict


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {"status": "OddsEdge AI is live 🚀"}


@app.get("/odds")
async def get_odds(sport: str = "basketball_nba", markets: str = "h2h"):
    if not ODDS_API_KEY:
        raise HTTPException(status_code=500, detail="ODDS_API_KEY not configured")

    url = f"{ODDS_BASE_URL}/sports/{sport}/odds"
    params = {
        "apiKey": ODDS_API_KEY,
        "regions": "us",
        "markets": markets,
        "oddsFormat": "american",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Odds API error: {response.text}"
        )

    return response.json()


@app.get("/sports")
async def get_sports():
    if not ODDS_API_KEY:
        raise HTTPException(status_code=500, detail="ODDS_API_KEY not configured")

    url = f"{ODDS_BASE_URL}/sports"
    params = {"apiKey": ODDS_API_KEY}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


@app.post("/analyze")
async def analyze_bet(req: AnalyzeRequest):
    prompt = f"""You are OddsEdge AI, an expert sports betting analyst. Analyze the following bet.

Game: {req.away_team} @ {req.home_team}
Sport: {req.sport}
Market: {req.market}
Current Odds: {req.odds}

Respond ONLY with this JSON structure, no extra text:
{{
  "recommendation": "STRONG BET | LEAN | PASS | FADE",
  "confidence": <number 1-100>,
  "summary": "<2-3 sentence plain English summary>",
  "value_analysis": "<paragraph on whether the odds represent good value>",
  "key_factors": ["<factor 1>", "<factor 2>", "<factor 3>"],
  "risks": ["<risk 1>", "<risk 2>"],
  "sharp_money_note": "<brief note on what sharp bettors would think>"
}}"""

    message = anthropic_client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text
    import json
    try:
        analysis = json.loads(raw)
    except json.JSONDecodeError:
        import re
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            analysis = json.loads(match.group())
        else:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")

    return analysis


@app.post("/score")
async def score_bet(req: ScoreRequest):
    prompt = f"""You are a sports betting analyst. Score this bet from 0-100.

Game: {req.away_team} @ {req.home_team}
Sport: {req.sport}
Market: {req.market}
Odds: {req.odds}

Respond ONLY with this JSON, no extra text:
{{"score": <0-100>, "label": "STRONG BET|GOOD VALUE|NEUTRAL|LEAN AWAY|AVOID"}}"""

    message = anthropic_client.messages.create(
        model="claude-opus-4-5",
        max_tokens=100,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text
    import json
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"score": 50, "label": "NEUTRAL"}


@app.post("/chat")
async def chat(req: ChatRequest):
    system_prompt = """You are OddsEdge AI, a world-class sports betting analyst.
You have deep expertise in all major sports, betting markets, bankroll management,
line movement, and statistical analysis. You are direct, confident, and data-driven.
Always include a brief disclaimer about responsible gambling when giving specific recommendations."""

    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    response = anthropic_client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        system=system_prompt,
        messages=messages,
    )

    return {"reply": response.content[0].text}