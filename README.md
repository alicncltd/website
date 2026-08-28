# Ali CNC Pakistan Monorepo

Welcome to the **Ali CNC Pakistan** monorepo—a proprietary enterprise system integrating CAD/CAM vector compilation, quantitative algorithmic cryptocurrency trading, automated WhatsApp voice call agents, and advanced software engineering utilities.

---

## 🏗️ Project Architecture
This project is configured as a monorepo containing three core components:
1. **Frontend (`/frontend`)**: Next.js v16.2.4 application compiled with Turbopack, styled using Tailwind CSS v4 and Vanilla HSL variables, and animated via Framer Motion. 
2. **Backend (`/backend`)**: Node.js Express server orchestrating WebSocket streams, child processes, background crons, and headless browser scraping.
3. **Database Schema (`/supabase`)**: PostgreSQL schema definitions, RLS (Row Level Security) policies, and persistence adapters for WhatsApp sessions and logs.

---

## 🔒 Proprietary License & Usage Restrictions

```text
Copyright (c) 2026 Ali CNC Pakistan / Muhammad Ali. All rights reserved.

---

## 🚀 Core Features

### 1. Headless WhatsApp Voice CRM Agent
- **Automated Puppeteer Interception**: Spawns a headless Chrome browser running WhatsApp Web. Injects a WebRTC listener script to hook incoming voice streams.
- **Urdu Translation & TTS Streaming**: Runs browser-side Voice Activity Detection (VAD) to segment audio, uploads WebM files, transcribes speech utilizing `gemini-2.5-flash`, generates humorous Urdu audio responses using `gemini-3.1-flash-tts-preview`'s `Aoede` voice, and plays it back directly inside the active Webrtc call.
- **Active Admin Interception**: Features a secure dashboard enabling a human operator to bypass the AI, capturing the mic input and streaming audio live to takeover the call.

### 2. 6-Hour Geopolitical Intel Aggregator & Cron
- **RSS Feed Crawler**: Running a background cron scheduler every 6 hours to pull international feeds (Google News, Reuters, Truth Social feeds like `@realDonaldTrump.rss`, and simulated Twitter statement fallbacks).
- **Gemini Intelligence Summarization**: Analyzes feed snapshots to compile geopolitical, global trade, and policy changes.
- **Automated PDF Auditor**: Renders an institutional PDF audit report detailing system logs, engineers' changelogs, and AI news briefings, mailing it directly to the administrator using the Resend API.

---

## 🛠️ Advanced Tools Suite

### 3. Oracle AI Trading Analyst (`/tools/oracle`)
- **Multi-Committee Scoring**: Scores assets based on Technical indicators (RSI, EMA, Bollinger, MACD), derivatives flows (open interest, funding rates, long/short ratio), and spot whale buy/sell volumes.
- **Gemini AI Judge Arbitration**: Feeds raw committee metrics and parsed macro geopolitical headings to `models/gemini-3.6-flash` to challenge the prediction, outputting entry ranges, exits, and risk reward ratings.

### 4. Multi-Model AI Router (`/tools/router`)
- **Difficulty Classifier**: Evaluates prompt complexity and token lengths, dynamically routing queries to the cost-optimal model (`gemini-2.5-flash` for simple requests, `gemini-2.5-pro` for programming or reasoning).
- **Analytics Tracker**: Visualizes LLM decision nodes and logs costs, latency durations, and token usages.

### 5. ETL Scraper & Crawler (`/tools/scraper`)
- **Parallel HTML Crawler**: Crawls queue lists of URLs, extracts main page details, and utilizes Gemini as an ETL block to map pages to clean JSON schemas. Supports CSV spreadsheets downloading.

### 6. Collaborative Sketchboard (`/tools/workspace`)
- **Multiplayer WS Board**: Vector canvas synchronizing drawing brush strokes and pointer positions across active clients in real-time via WebSockets.

### 7. Webhook Ingestion Simulator (`/tools/webhook`)
- **Developer Sandbox**: Dispatches simulated Stripe events, processes idempotency guard checks to block duplicates, logs transactions, and manages manual sync retries in the Dead-Letter Queue (DLQ).

---

## ⚙️ Configuration & Environment

Set up the following variables in your environment files:

### Backend Configuration (`backend/.env`)
```ini
PORT=8080
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...
GEMINI_API_KEY=AIzaSy...
RESEND_API_KEY=re_...
CLOUDINARY_URL=cloudinary://...
BACKEND_API_KEY=your_private_api_key_123
FRONTEND_URL=https://alicnc.pk
```

### Frontend Configuration (`frontend/.env.local`)
```ini
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
BACKEND_API_KEY=your_private_api_key_123
NEXT_PUBLIC_SITE_URL=https://alicnc.pk
```

---

## 🏃 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+) with `venv` module

### Run the Backend Server
```bash
cd backend
# Create Python virtual environment for Oracle AI
python -m venv oracle_ai/venv
# Activate venv and install dependencies
source oracle_ai/venv/bin/activate  # Or: oracle_ai\venv\Scripts\activate on Windows
pip install -r oracle_ai/requirements.txt
pip install google-genai
# Run backend
npm install
node server.js
```

### Run the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
