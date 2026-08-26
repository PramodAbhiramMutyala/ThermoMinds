from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.temperature import router as temp_router
from app.api.hotspots import router as hotspots_router
from app.api.risk import router as risk_router
from app.api.routes import router as routes_router
from app.api.mitigation import router as mitigation_router
from app.api.correlation import router as correlation_router
from app.api.agent import router as agent_router
from app.api.fortyguard import router as fortyguard_router
from app.services.fortyguard_client import fortyguard_client

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Hyperlocal heat risk and actionable decision support assistant powered by FortyGuard intelligence."
)

# Enable CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(temp_router, prefix=settings.API_V1_STR)
app.include_router(hotspots_router, prefix=settings.API_V1_STR)
app.include_router(risk_router, prefix=settings.API_V1_STR)
app.include_router(routes_router, prefix=settings.API_V1_STR)
app.include_router(mitigation_router, prefix=settings.API_V1_STR)
app.include_router(correlation_router, prefix=settings.API_V1_STR)
app.include_router(agent_router, prefix=settings.API_V1_STR)
app.include_router(fortyguard_router, prefix=settings.API_V1_STR)
app.include_router(hotspots_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "project": "HeatShield AI",
        "tagline": "AI-Powered Hyperlocal Heat Risk & Action Assistant",
        "hackathon": "FortyGuard Global AI Hackathon 2026",
        "tracks": ["Agentic AI (Primary)", "Data Analysis & Correlation (Secondary)"],
        "status": "Operational",
        "data_source_mode": "LIVE - FortyGuard" if fortyguard_client.is_live else "DEMO - HeatShield Simulation",
        "api_docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "live_api_configured": fortyguard_client.is_live,
        "default_city": settings.DEFAULT_CITY
    }
