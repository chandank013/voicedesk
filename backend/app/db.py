import json
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from .config import settings
from .models import Base, Task, Note, ToolCall

# SQLite configuration with WAL mode for fast concurrent reads and writes
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

if "sqlite" in settings.DATABASE_URL:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if database has tasks; if empty, seed demo data
        if db.query(Task).count() == 0:
            seed_demo_data(db)
    finally:
        db.close()

def seed_demo_data(db: Session):
    # Clear existing demo data
    db.query(Task).delete()
    db.query(Note).delete()
    db.query(ToolCall).delete()
    db.commit()

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today_start + timedelta(days=1)

    # 1. Seed Reference Tasks
    # Exact tasks from user prompt reference:
    # - Call the bank — Tomorrow, Oct 21 — High
    # - Finish hackathon demo — Today, 4:00 PM — Medium
    # - Buy groceries — Today, 7:00 PM — Medium
    # - Review PRD and TRD — Oct 22, 10:00 AM — Low
    # - Plan weekend trip — Oct 25, 9:00 AM — Low
    # (plus 3 more to reach 8 open tasks with 3 due today)
    demo_tasks = [
        Task(
            title="Call the bank",
            due_date=tomorrow.replace(hour=10, minute=0),
            due_display="Tomorrow, Oct 21",
            status="open",
            priority="high",
            created_at=now - timedelta(minutes=45)
        ),
        Task(
            title="Finish hackathon demo",
            due_date=today_start.replace(hour=16, minute=0),
            due_display="Today, 4:00 PM",
            status="open",
            priority="medium",
            created_at=now - timedelta(hours=3)
        ),
        Task(
            title="Buy groceries",
            due_date=today_start.replace(hour=19, minute=0),
            due_display="Today, 7:00 PM",
            status="open",
            priority="medium",
            created_at=now - timedelta(hours=5)
        ),
        Task(
            title="Sync team on demo rehearsal",
            due_date=today_start.replace(hour=20, minute=30),
            due_display="Today, 8:30 PM",
            status="open",
            priority="high",
            created_at=now - timedelta(hours=2)
        ),
        Task(
            title="Review PRD and TRD",
            due_date=today_start + timedelta(days=2, hours=10),
            due_display="Oct 22, 10:00 AM",
            status="open",
            priority="low",
            created_at=now - timedelta(hours=8)
        ),
        Task(
            title="Plan weekend trip",
            due_date=today_start + timedelta(days=5, hours=9),
            due_display="Oct 25, 9:00 AM",
            status="open",
            priority="low",
            created_at=now - timedelta(days=1)
        ),
        Task(
            title="Prepare Alexa+ demo slides",
            due_date=today_start + timedelta(days=3, hours=11),
            due_display="Oct 23, 11:00 AM",
            status="open",
            priority="high",
            created_at=now - timedelta(hours=6)
        ),
        Task(
            title="Verify Bedrock Converse API latency",
            due_date=today_start + timedelta(days=2, hours=14),
            due_display="Oct 22, 2:00 PM",
            status="open",
            priority="medium",
            created_at=now - timedelta(hours=4)
        ),
        # Completed tasks for history & filter
        Task(
            title="Configure FastMCP streamable HTTP transport",
            due_date=today_start - timedelta(days=1),
            due_display="Yesterday",
            status="done",
            priority="high",
            created_at=now - timedelta(days=2),
            completed_at=now - timedelta(hours=10)
        ),
        Task(
            title="Scaffold React Vite frontend with design tokens",
            due_date=today_start - timedelta(hours=1),
            due_display="Today, 2:00 PM",
            status="done",
            priority="medium",
            created_at=now - timedelta(days=1),
            completed_at=now - timedelta(hours=2)
        )
    ]
    db.add_all(demo_tasks)

    # 2. Seed Reference Notes (12 notes for Notes Captured = 12)
    # Reference notes:
    # - Use SQLite for the demo
    # - Ideas for Alexa+ features
    # - Budget discussion points
    # - Hackathon presentation outline
    # - Meeting with team
    demo_notes = [
        Note(
            title="Use SQLite for the demo",
            text="Use SQLite with WAL mode for the hackathon demo. Zero latency, self-contained, no external database dependencies required. Works natively with SQLAlchemy.",
            tags="architecture,database,demo",
            summary="Recommended SQLite with WAL mode for sub-millisecond local queries.",
            created_at=now - timedelta(hours=1)
        ),
        Note(
            title="Ideas for Alexa+ features",
            text="Explore multi-step context retention in Alexa+ conversational sessions. Ambient audio suggestions and follow-up prompts for task completion status.",
            tags="alexa+,ideas,voice",
            summary="Context retention and ambient voice suggestions for Alexa+.",
            created_at=now - timedelta(hours=2, minutes=15)
        ),
        Note(
            title="Budget discussion points",
            text="Target cloud budget under $50/mo. Bedrock Converse on Nova Micro keeps cost negligible at ~0.0001 per request. Free-tier tiering for public hosting.",
            tags="finance,budget,aws",
            summary="Cloud cost plan highlighting Bedrock Nova Micro efficiency.",
            created_at=now - timedelta(hours=3, minutes=30)
        ),
        Note(
            title="Hackathon presentation outline",
            text="1. Hook with voice command 'Add call the bank tomorrow'. 2. Trace panel glowing with add_task MCP tool call in 124ms. 3. Bedrock note recall. 4. Code architecture overview.",
            tags="presentation,demo,video",
            summary="2:45 video structure prioritizing live tool trace hook.",
            created_at=now - timedelta(hours=5)
        ),
        Note(
            title="Meeting with team",
            text="Discussed UI layout: 3 columns with dark navy sidebar, bright pastel hero, tasks & notes grid, and prominent live activity feed on right.",
            tags="team,design,meeting",
            summary="Team aligned on 3-column layout and live activity prominence.",
            created_at=now - timedelta(hours=6, minutes=45)
        ),
        Note(
            title="Voice prompt phrasing tips",
            text="Natural voice utterances like 'What's on my list today?' or 'Mark call the bank done' should resolve deterministically via intent router.",
            tags="voice,prompts",
            summary="Guidelines for concise spoken confirmations.",
            created_at=now - timedelta(hours=8)
        ),
        Note(
            title="Bedrock Converse API parameters",
            text="Use system prompt instructing concise answers citing [Note #ID]. Max tokens 150, temperature 0.2 for factual recall.",
            tags="aws,bedrock,ai",
            summary="Converse configuration for grounded note recall.",
            created_at=now - timedelta(hours=12)
        ),
        Note(
            title="Design tokens reference",
            text="Harbor: #E9EFF1, Sheet: #FFFFFF, Spruce: #10302F, Tide: #2F6F73, Signal: #F0A030, Lilac: #6B5A8E, Brick: #B23A2B.",
            tags="design,tokens,css",
            summary="Core brand color tokens from the PRD specification.",
            created_at=now - timedelta(days=1)
        ),
        Note(
            title="MCP Protocol Spec 2025-11-25 notes",
            text="Ensure Streamable HTTP transport compliance. JSON-RPC responses must include structured data and human-friendly speech return fields.",
            tags="mcp,protocol,spec",
            summary="Key compliance requirements for official MCP specification.",
            created_at=now - timedelta(days=1, hours=4)
        ),
        Note(
            title="Friction log item 1: Streamable HTTP headers",
            text="Discovered FastMCP stream response requires proper Content-Type: application/x-ndjson when streaming chunks.",
            tags="friction,docs,mcp",
            summary="Notes on streaming HTTP transport header handling.",
            created_at=now - timedelta(days=1, hours=8)
        ),
        Note(
            title="Audio waveform visualization thoughts",
            text="Microphone visualizer should use smooth sine waves modulated by volume level. Subtle pulse animation during active listening.",
            tags="frontend,animation,audio",
            summary="Motion design principles for voice recording status.",
            created_at=now - timedelta(days=2)
        ),
        Note(
            title="Keyboard accessibility requirements",
            text="Focus ring 2px Tide with offset. '/' key activates speak bar. 'Esc' cancels modal. 'Space' toggles task checkbox.",
            tags="accessibility,a11y",
            summary="Keyboard interaction plan meeting WCAG AA requirements.",
            created_at=now - timedelta(days=2, hours=6)
        )
    ]
    db.add_all(demo_notes)

    # 3. Seed Reference Tool Calls (24 total tool calls to match Total Tool Calls = 24)
    # Primary live trace examples from prompt:
    # 1. "Add call the bank tomorrow" -> Tool: add_task
    # 2. "What's on my list today?" -> Tool: list_tasks
    # 3. "Note: use SQLite for the demo" -> Tool: save_note
    # 4. "What did I note about SQLite?" -> Tool: search_notes
    demo_calls = [
        ToolCall(
            tool="add_task",
            utterance="Add call the bank tomorrow",
            args_json=json.dumps({"title": "Call the bank", "due": "tomorrow"}),
            result_json=json.dumps({"id": 1, "title": "Call the bank", "due_date": "2026-10-21T10:00:00Z", "status": "open"}),
            speech="Added call the bank, due Wednesday, Oct 21.",
            ok=True,
            latency_ms=124,
            source="simulator",
            created_at=now - timedelta(seconds=18)
        ),
        ToolCall(
            tool="list_tasks",
            utterance="What's on my list today?",
            args_json=json.dumps({"status": "open", "when": "today"}),
            result_json=json.dumps({"count": 3, "tasks": ["Finish hackathon demo", "Buy groceries", "Sync team on demo rehearsal"]}),
            speech="You have 3 tasks due today: Finish hackathon demo, Buy groceries, and Sync team on demo rehearsal.",
            ok=True,
            latency_ms=88,
            source="mcp",
            created_at=now - timedelta(minutes=2, seconds=45)
        ),
        ToolCall(
            tool="save_note",
            utterance="Note: use SQLite for the demo",
            args_json=json.dumps({"text": "Use SQLite with WAL mode for the demo. Zero latency, self-contained.", "tags": ["architecture", "database"]}),
            result_json=json.dumps({"id": 1, "title": "Use SQLite for the demo", "saved": True}),
            speech="Saved note: Use SQLite for the demo.",
            ok=True,
            latency_ms=96,
            source="mcp",
            created_at=now - timedelta(minutes=5, seconds=12)
        ),
        ToolCall(
            tool="search_notes",
            utterance="What did I note about SQLite?",
            args_json=json.dumps({"query": "SQLite", "limit": 3}),
            result_json=json.dumps({"matches": 1, "top_match": "Use SQLite with WAL mode for the hackathon demo."}),
            speech="Found 1 note: Use SQLite with WAL mode for the demo. Zero latency, self-contained, no external database dependencies.",
            ok=True,
            latency_ms=142,
            source="simulator",
            created_at=now - timedelta(minutes=9, seconds=30)
        ),
        ToolCall(
            tool="complete_task",
            utterance="Mark scaffold React Vite frontend done",
            args_json=json.dumps({"query": "scaffold React Vite frontend"}),
            result_json=json.dumps({"id": 10, "title": "Scaffold React Vite frontend with design tokens", "status": "done"}),
            speech="Marked 'Scaffold React Vite frontend with design tokens' as completed.",
            ok=True,
            latency_ms=115,
            source="mcp",
            created_at=now - timedelta(minutes=15)
        ),
        ToolCall(
            tool="add_task",
            utterance="Add finish hackathon demo today at 4pm",
            args_json=json.dumps({"title": "Finish hackathon demo", "due": "today 4pm"}),
            result_json=json.dumps({"id": 2, "title": "Finish hackathon demo", "due_display": "Today, 4:00 PM"}),
            speech="Added task: Finish hackathon demo, due today at 4:00 PM.",
            ok=True,
            latency_ms=110,
            source="simulator",
            created_at=now - timedelta(minutes=24)
        ),
        ToolCall(
            tool="save_note",
            utterance="Note: ideas for Alexa+ features include ambient audio suggestions",
            args_json=json.dumps({"text": "Ideas for Alexa+ features: ambient audio suggestions and follow-up prompts", "tags": ["alexa+", "ideas"]}),
            result_json=json.dumps({"id": 2, "title": "Ideas for Alexa+ features"}),
            speech="Saved note: Ideas for Alexa+ features.",
            ok=True,
            latency_ms=105,
            source="ui",
            created_at=now - timedelta(minutes=35)
        ),
        ToolCall(
            tool="recall",
            utterance="What is our cloud budget plan?",
            args_json=json.dumps({"question": "What is our cloud budget plan?"}),
            result_json=json.dumps({"answer": "Target cloud budget is under $50/mo using Bedrock Nova Micro.", "sources": [3]}),
            speech="Based on your notes: Target cloud budget is under $50/mo. Bedrock Nova Micro keeps cost negligible at ~0.0001 per request.",
            ok=True,
            latency_ms=310,
            source="simulator",
            created_at=now - timedelta(minutes=42)
        )
    ]

    # Add 16 more realistic background tool calls to reach 24 total
    tools_pool = ["list_tasks", "search_notes", "add_task", "save_note", "complete_task"]
    for i in range(16):
        t_name = tools_pool[i % len(tools_pool)]
        demo_calls.append(
            ToolCall(
                tool=t_name,
                utterance=f"System check and sync routine #{i+1}",
                args_json=json.dumps({"op": f"sync_{i+1}", "status": "ok"}),
                result_json=json.dumps({"synced": True, "records": 8 + (i % 5)}),
                speech=f"Routine sync {t_name} completed.",
                ok=True,
                latency_ms=75 + (i * 7) % 110,
                source="mcp" if i % 2 == 0 else "simulator",
                created_at=now - timedelta(hours=1, minutes=i * 6)
            )
        )

    db.add_all(demo_calls)
    db.commit()
