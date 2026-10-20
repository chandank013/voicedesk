from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db, seed_demo_data
from ..models import Task, Note, ToolCall
from ..schemas import DashboardStats, HealthResponse
from ..config import settings
from ..events import broadcaster

router = APIRouter(tags=["dashboard"])

@router.get("/api/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_start = today_start + timedelta(days=1)

    open_tasks = db.query(Task).filter(Task.status == "open").count()
    notes_captured = db.query(Note).count()
    due_today = db.query(Task).filter(
        Task.status == "open",
        Task.due_date >= today_start,
        Task.due_date < tomorrow_start
    ).count()
    total_tool_calls = db.query(ToolCall).count()

    return {
        "open_tasks": open_tasks,
        "notes_captured": notes_captured,
        "due_today": due_today,
        "total_tool_calls": total_tool_calls
    }

@router.post("/api/reset-demo")
async def reset_demo(db: Session = Depends(get_db)):
    seed_demo_data(db)
    await broadcaster.broadcast("demo_reset", {"status": "reset"})
    return {"ok": True, "message": "Demo data reset successfully to pristine reference state."}

@router.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "ok",
        "version": settings.VERSION,
        "mcp_protocol_version": settings.MCP_PROTOCOL_VERSION,
        "bedrock_enabled": settings.ENABLE_BEDROCK,
        "bedrock_model_id": settings.BEDROCK_MODEL_ID
    }
