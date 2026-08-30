# HeatShield AI 🛡️🔥
> **AI-Powered Hyperlocal Heat Risk & Action Assistant**  
> Built for the **FortyGuard Global AI Hackathon 2026**  
> *Primary Track: Agentic AI* | *Secondary Track: Data Analysis & Correlation*

---

## 🌟 Overview

FortyGuard provides high-resolution street-level and microclimate temperature intelligence. **HeatShield AI** transforms raw temperature data into actionable risk intelligence, predictive hotspot detection, and autonomous decision support across three distinct personas and six unified views:

1. 🛰️ **Live Mission Control Command Center**: Real-time unified HeatShield score ring (0–100), 4-metric bento grid (Risk Matrix, Thermal Conditions, Persistence, Critical Exceedance), 24-hour diurnal sinusoidal scrubber with peak heat window alerts, and interactive GeoJSON vector heatmap.
2. 👥 **Operational Safety & Action Hubs**:
   - 👷 **Site Managers & Workforce**: Real-time ISO 7243 / OSHA WBGT thermal flag calculations (Green / Yellow / Orange / Red / Black), mandatory work-rest intervals (e.g. 15m work / 45m rest), hourly hydration schedules, AI shift rescheduling window (05:30–09:30), and cool corridor logistics.
   - 🚶 **Pedestrians & Commuters**: Shaded "Cool Corridor" pathfinding vs scorching direct routes (with $-8.4^\circ\text{C}$ surface heat reduction), verified public cooling sanctuaries, and personalized heat vulnerability heuristics.
   - 🏛️ **City Planners**: Prioritized municipal hotspot intervention registry and rapid cooling response.
3. 🎛️ **Urban Mitigation Simulator**: Interactive simulation sliders (+0–50% Tree Canopy, +0–50% Cool Roofs/Albedo, +0–30% Smart Misting Cannons) with projected thermal relief ($-3.2^\circ\text{C}$ ambient, $-9.5^\circ\text{C}$ surface) and estimated population impact (~14,200 residents relieved).
4. 🔥 **Hotspots & Vulnerability Registry**: Autonomous microclimate hotspot prioritization table sorted in descending risk score.
5. 🤖 **Agentic AI Copilot & Autonomous Trace Feed**: Dual-panel interactive assistant with prompt chips, action decision cards, and live tool execution traces with millisecond latencies.
6. 📊 **Scientific Data Correlation Engine**: Empirical correlation analysis between FortyGuard street-level radiant heat and satellite Sentinel-2 NDVI ($r = -0.88, R^2 = 0.77, p < 0.001$).

---

## 🏗️ System Architecture & Data Hierarchy

```text
                    FortyGuard API
                          │
                          ▼
               Real Hyperlocal Data (or DEMO HeatShield Simulation)
                          │
               ┌──────────┴──────────┐
               ▼                     ▼
        HeatShield Analytics     External Data (Sentinel-2 NDVI / OSM)
               │                     │
               └──────────┬──────────┘
                          │
                          ▼
              HeatShield Risk Engine (Score 0-100, WBGT, Persistence, Exceedance)
                          │
                          ▼
               Agentic AI Controller (Tool Calling & Orchestration)
                          │
               ┌──────────┼──────────┐
               ▼          ▼          ▼
            Citizen     Worker     Authority
         (Cool Route)  (WBGT Rest) (Mitigation)
```

### The Unified HeatShield Score (0–100)

$$\text{HeatShield Score} = S_{\text{temp}} (35) + S_{\text{persist}} (25) + S_{\text{exceed}} (20) + S_{\text{env}} (20)$$

- **Heat Exposure Formula**: $\text{Heat Exposure} = \text{Intensity} \times \text{Duration} \times \text{Context}$

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI + Python 3.12/3.13)

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- Backend API Swagger Docs: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/health`

### 2. Frontend Setup (React + Vite + Tailwind CSS)

```bash
cd frontend
npm install
npm run dev
```

- Open application in browser: `http://localhost:5173/`

---

## 🔑 API Keys & Configuration

The application is configured to run **100% out-of-the-box in `DEMO_MODE`** without requiring external API keys.

To connect your live FortyGuard credentials and optional LLM keys:
1. Open [`backend/.env`](file:///g:/ThermoMinds/backend/.env) (or copy from [`.env.example`](file:///g:/ThermoMinds/.env.example))
2. Add your API credentials:

```env
# 1. FortyGuard Temperature Intelligence API
FORTYGUARD_API_KEY=your_fortyguard_api_key_here
FORTYGUARD_API_BASE_URL=https://api.fortyguard.com/v1

# 2. Hugging Face Inference API / Router (Optional for AI Copilot LLM Synthesis)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct
HUGGINGFACE_API_BASE_URL=https://router.huggingface.co/v1

# 3. Application Defaults
DEFAULT_CITY=Phoenix
```

When configured, HeatShield AI automatically displays the `LIVE • FortyGuard API` badge on all live telemetry feeds.

---

## 🤖 Agentic AI Tools

The AI Copilot executes multi-step autonomous tool traces over structured heat data:
- `query_hyperlocal_zone(city, zone_id)` — Fetches microclimate telemetry for a targeted city sector.
- `calculate_heat_risk(ambient, surface)` — Evaluates deterministic HeatShield composite score.
- `calculate_wbgt(ambient, rh, wind, solar)` — Computes OSHA/ISO-aligned Wet Bulb Globe Temperature and thermal flag.
- `get_persistence(zone_id, duration_hours)` — Quantifies consecutive hours above the $35^\circ\text{C}$ threshold.
- `find_cool_corridor(city, origin, destination)` — Optimizes shaded pedestrian routing against direct arterial corridors.
- `simulate_mitigation(zone_id, canopy_pct, cool_roof_pct, misting_pct)` — Projects thermal reductions from tree canopies, cool roofs, and misting cannons.

---

## 🌓 Theme Switcher

HeatShield AI includes an interactive **Light / Dark Mode Switcher**:
- **Dark Mode**: High-contrast cyber-meteorology space background (`#05070c`) with glowing thermal gauges and telemetry borders.
- **Light Mode**: Ultra-clean enterprise climate dashboard (`#f8fafc`) with frosted glass panels and high-contrast typography.
- Preference is automatically persisted in `localStorage`.

---

## 🧪 Testing

Run backend test suite:
```bash
cd backend
python -m pytest tests -v
```
*(60/60 unit tests covering risk engines, FortyGuard client, mitigation models, and API endpoints)*
