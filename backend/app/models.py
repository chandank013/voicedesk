from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

def utcnow():
    return datetime.now(timezone.utc)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    due_date = Column(DateTime, nullable=True)
    due_display = Column(String(100), nullable=True)  # e.g. "Tomorrow, Oct 21", "Today, 4:00 PM"
    status = Column(String(20), default="open", nullable=False)  # 'open' | 'done'
    priority = Column(String(20), default="medium", nullable=False)  # 'high' | 'medium' | 'low'
    created_at = Column(DateTime, default=utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    text = Column(Text, nullable=False)
    tags = Column(String(255), nullable=True)  # comma-separated or JSON
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

class ToolCall(Base):
    __tablename__ = "tool_calls"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tool = Column(String(100), nullable=False)
    utterance = Column(Text, nullable=True)
    args_json = Column(Text, nullable=True)
    result_json = Column(Text, nullable=True)
    speech = Column(Text, nullable=True)
    ok = Column(Boolean, default=True, nullable=False)
    latency_ms = Column(Integer, default=0, nullable=False)
    source = Column(String(50), default="simulator", nullable=False)  # 'mcp' | 'simulator' | 'ui'
    created_at = Column(DateTime, default=utcnow, nullable=False)
