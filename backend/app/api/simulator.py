from fastapi import APIRouter, HTTPException
from ..schemas import SimulatorRequest, SimulatorResponse
from ..services.router import route_and_execute_utterance

router = APIRouter(prefix="/api/simulator", tags=["simulator"])

@router.post("/utterance", response_model=SimulatorResponse)
async def process_utterance(payload: SimulatorRequest):
    if not payload.utterance or not payload.utterance.strip():
        raise HTTPException(status_code=400, detail="Utterance cannot be empty")

    source = payload.source or "simulator"
    result = await route_and_execute_utterance(payload.utterance, source=source)
    return result
