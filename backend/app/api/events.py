from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from ..events import broadcaster

router = APIRouter(tags=["events"])

@router.get("/api/events")
async def events_stream():
    return StreamingResponse(
        broadcaster.subscribe(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
