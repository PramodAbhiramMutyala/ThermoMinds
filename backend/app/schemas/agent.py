from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ToolCallTrace(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    status: str = "success"  # success, warning, error
    execution_time_ms: int = 45
    summary: str
    data_source: str = "LIVE - FortyGuard / HeatShield Analytics"

class ActionCard(BaseModel):
    title: str
    badge: str
    type: str  # "route" | "mitigation" | "work_rest" | "alert" | "cooling_center"
    description: str
    data: Dict[str, Any]

class AgentChatRequest(BaseModel):
    message: str
    persona: str = Field("citizen", description="citizen | worker | authority")
    city: str = Field("Phoenix", description="Phoenix | Dubai | London")
    zone_id: Optional[str] = None
    user_profile: Optional[str] = "General"  # Senior, Child, Athlete, Outdoor Worker

class AgentChatResponse(BaseModel):
    response_text: str
    persona: str
    city: str
    heatshield_score: Optional[int] = None
    risk_level: Optional[str] = None
    tool_traces: List[ToolCallTrace] = []
    action_cards: List[ActionCard] = []
    suggested_followups: List[str] = []
    timestamp: str
