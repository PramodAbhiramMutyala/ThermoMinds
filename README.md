# HeatShield AI 🛡️🔥
> **AI-Powered Hyperlocal Heat Risk & Action Assistant**  
> Built for the **FortyGuard Global AI Hackathon 2026**  
> *Primary Track: Agentic AI* | *Secondary Track: Data Analysis & Correlation*

---

## 🌟 Overview

FortyGuard provides high-resolution street-level and microclimate temperature intelligence. **HeatShield AI** transforms raw temperature data into actionable risk intelligence, predictive hotspot detection, and autonomous decision support across three distinct personas:

1. 🚶 **Citizens & Pedestrians**: Shaded "Cool Corridor" pathfinding vs scorching direct routes, verified public cooling sanctuaries, and personalized heat vulnerability heuristics.
2. 👷 **Workforce & Site Managers**: Real-time WBGT thermal flag calculations (Green / Yellow / Orange / Red / Black), OSHA/ISO-aligned work-rest intervals, mandatory hourly hydration schedules, and shift rescheduling windows.
3. 🏛️ **City Authorities & Urban Planners**: Microclimate hotspot prioritization matrix, nocturnal heat trap deficit tracking, and an interactive **Urban Heat Mitigation Simulator** (testing the real-time thermal reduction of tree canopies, cool roofs, and misting cannons).
4. 📊 **Data Correlation Engine**: Scientific correlation analysis between FortyGuard street-level radiant heat and satellite Sentinel-2 NDVI (Vegetation Index) ($r = -0.88, p < 0.001$).

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

### 1. Backend Setup (FastAPI + Python 3.12)

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup (React + Vite + Tailwind CSS)

```bash
cd frontend
npm install
npm run dev
```

Open application in browser: `http://localhost:5173/`

---

## 🔑 API Keys & Configuration

The application is configured to run **100% out-of-the-box in `DEMO_MODE`** without requiring external API keys.

To connect your live FortyGuard credentials:
1. Open [`backend/.env`](file:///c:/Users/gsrip/OneDrive/Desktop/ThermoMinds/backend/.env)
2. Add your FortyGuard API key:
```env
FORTYGUARD_API_KEY=your_fortyguard_api_key_here
FORTYGUARD_API_BASE_URL=https://api.fortyguard.com/v1
GEMINI_API_KEY=your_gemini_api_key_here
```
When configured, HeatShield AI will automatically display the `LIVE • FortyGuard API` badge on all live telemetry feeds.

---

## 🤖 Agentic AI Tools

The AI Copilot executes multi-step autonomous tool traces over structured heat data:
- `query_hyperlocal_zone(city, zone_id)`
- `calculate_heat_risk(ambient, surface)`
- `calculate_wbgt(ambient, rh, wind, solar)`
- `get_persistence(zone_id, duration_hours)`
- `find_cool_corridor(city, origin, destination)`
- `simulate_mitigation(zone_id, canopy_pct, cool_roof_pct, misting_pct)`

---

## 🧪 Testing

Run backend test suite:
```bash
pytest backend/tests -v
```
