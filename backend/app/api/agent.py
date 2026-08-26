from fastapi import APIRouter
from app.schemas.agent import AgentChatRequest, AgentChatResponse
from app.services.agent_service import agent_service

router = APIRouter(prefix="/agent", tags=["Agentic AI Decision Support"])

@router.post("/chat", response_model=AgentChatResponse)
async def chat_with_agent(req: AgentChatRequest):
    """
    Executes multi-step Agentic AI reasoning with live tool execution traces.
    """
    return await agent_service.execute_agent(req)
