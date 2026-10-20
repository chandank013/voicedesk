from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

# --- Tasks ---
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, description="Task title")
    due_date: Optional[datetime] = None
    due_display: Optional[str] = None
    priority: Optional[str] = Field("medium", description="'high', 'medium', or 'low'")
    status: Optional[str] = Field("open", description="'open' or 'done'")

class TaskCreate(TaskBase):
    due: Optional[str] = None  # natural language e.g. "tomorrow", "today 4pm"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    due_date: Optional[datetime] = None
    due_display: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class TaskOut(TaskBase):
    id: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Notes ---
class NoteBase(BaseModel):
    title: str
    text: str
    tags: Optional[str] = None
    summary: Optional[str] = None

class NoteCreate(BaseModel):
    title: Optional[str] = None
    text: str
    tags: Optional[List[str] | str] = None

class NoteOut(NoteBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Tool Calls ---
class ToolCallOut(BaseModel):
    id: int
    tool: str
    utterance: Optional[str] = None
    args_json: Optional[str] = None
    result_json: Optional[str] = None
    speech: Optional[str] = None
    ok: bool
    latency_ms: int
    source: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Simulator & Router ---
class SimulatorRequest(BaseModel):
    utterance: str
    source: Optional[str] = "simulator"

class SimulatorResponse(BaseModel):
    tool: str
    utterance: str
    args: dict[str, Any]
    result: Any
    speech: str
    latency_ms: int
    ok: bool

# --- Statistics & Health ---
class DashboardStats(BaseModel):
    open_tasks: int
    notes_captured: int
    due_today: int
    total_tool_calls: int

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    mcp_protocol_version: str
    bedrock_enabled: bool
    bedrock_model_id: str
