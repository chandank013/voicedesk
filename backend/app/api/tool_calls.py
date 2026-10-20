from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..db import get_db
from ..models import ToolCall
from ..schemas import ToolCallOut

router = APIRouter(prefix="/api/tool-calls", tags=["tool_calls"])

@router.get("", response_model=List[ToolCallOut])
def get_tool_calls(
    limit: int = Query(50, ge=1, le=200),
    source: Optional[str] = Query(None, description="'mcp', 'simulator', 'ui', or None for all"),
    tool: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(ToolCall)
    if source and source != "all":
        query = query.filter(ToolCall.source == source)
    if tool:
        query = query.filter(ToolCall.tool == tool)

    calls = query.order_by(desc(ToolCall.created_at)).limit(limit).all()
    return calls
