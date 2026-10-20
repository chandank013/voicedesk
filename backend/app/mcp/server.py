import json
import time
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from mcp.server.mcpserver import MCPServer

from ..db import SessionLocal
from ..models import ToolCall
from ..events import broadcaster
from ..services import tasks as task_service
from ..services import notes as note_service

mcp_server = MCPServer("voicedesk")

async def log_tool_execution(
    tool: str,
    utterance: Optional[str],
    args: dict,
    result: Any,
    speech: str,
    ok: bool,
    latency_ms: int,
    source: str = "mcp"
) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        call = ToolCall(
            tool=tool,
            utterance=utterance or f"Call {tool}",
            args_json=json.dumps(args),
            result_json=json.dumps(result),
            speech=speech,
            ok=ok,
            latency_ms=latency_ms,
            source=source,
            created_at=datetime.now(timezone.utc)
        )
        db.add(call)
        db.commit()
        db.refresh(call)

        payload = {
            "id": call.id,
            "tool": call.tool,
            "utterance": call.utterance,
            "args_json": call.args_json,
            "result_json": call.result_json,
            "speech": call.speech,
            "ok": call.ok,
            "latency_ms": call.latency_ms,
            "source": call.source,
            "created_at": call.created_at.isoformat()
        }
        await broadcaster.broadcast("tool_call", payload)
        return payload
    finally:
        db.close()

@mcp_server.tool()
async def add_task(title: str, due: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a new task with an optional natural language due date.
    Example: title='Call the bank', due='tomorrow'
    """
    start = time.perf_counter()
    db = SessionLocal()
    try:
        res = task_service.create_task(db, title=title, due=due)
        latency = int((time.perf_counter() - start) * 1000)
        await log_tool_execution("add_task", f"Add {title}{' ' + due if due else ''}", {"title": title, "due": due}, res, res["speech"], True, latency, "mcp")
        await broadcaster.broadcast("task_created", res)
        return res
    except Exception as e:
        latency = int((time.perf_counter() - start) * 1000)
        err_msg = f"Failed to add task: {str(e)}"
        await log_tool_execution("add_task", f"Add {title}", {"title": title, "due": due}, {"error": str(e)}, err_msg, False, latency, "mcp")
        return {"ok": False, "speech": err_msg, "error": str(e)}
    finally:
        db.close()

@mcp_server.tool()
async def list_tasks(status: str = "open", when: str = "all") -> Dict[str, Any]:
    """
    List open or completed tasks filtered by time period ('today', 'week', 'all').
    Example: status='open', when='today'
    """
    start = time.perf_counter()
    db = SessionLocal()
    try:
        res = task_service.list_tasks(db, status=status, when=when)
        latency = int((time.perf_counter() - start) * 1000)
        await log_tool_execution("list_tasks", f"List tasks ({when})", {"status": status, "when": when}, res, res["speech"], True, latency, "mcp")
        return res
    except Exception as e:
        latency = int((time.perf_counter() - start) * 1000)
        err_msg = f"Failed to list tasks: {str(e)}"
        await log_tool_execution("list_tasks", "List tasks", {"status": status, "when": when}, {"error": str(e)}, err_msg, False, latency, "mcp")
        return {"tasks": [], "speech": err_msg, "error": str(e)}
    finally:
        db.close()

@mcp_server.tool()
async def complete_task(query: str) -> Dict[str, Any]:
    """
    Mark a task as complete using a fuzzy title query.
    Example: query='call the bank'
    """
    start = time.perf_counter()
    db = SessionLocal()
    try:
        res = task_service.complete_task(db, query=query)
        latency = int((time.perf_counter() - start) * 1000)
        ok = res.get("ok", False)
        await log_tool_execution("complete_task", f"Complete {query}", {"query": query}, res, res["speech"], ok, latency, "mcp")
        if ok:
            await broadcaster.broadcast("task_completed", res)
        return res
    except Exception as e:
        latency = int((time.perf_counter() - start) * 1000)
        err_msg = f"Failed to complete task: {str(e)}"
        await log_tool_execution("complete_task", f"Complete {query}", {"query": query}, {"error": str(e)}, err_msg, False, latency, "mcp")
        return {"ok": False, "speech": err_msg, "error": str(e)}
    finally:
        db.close()

@mcp_server.tool()
async def save_note(text: str, tags: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Save a note with text content and optional tags.
    Example: text='Use SQLite for the demo', tags=['architecture']
    """
    start = time.perf_counter()
    db = SessionLocal()
    try:
        res = note_service.save_note(db, text=text, tags=tags)
        latency = int((time.perf_counter() - start) * 1000)
        await log_tool_execution("save_note", f"Note: {text[:40]}", {"text": text, "tags": tags}, res, res["speech"], True, latency, "mcp")
        await broadcaster.broadcast("note_created", res)
        return res
    except Exception as e:
        latency = int((time.perf_counter() - start) * 1000)
        err_msg = f"Failed to save note: {str(e)}"
        await log_tool_execution("save_note", f"Note: {text[:40]}", {"text": text, "tags": tags}, {"error": str(e)}, err_msg, False, latency, "mcp")
        return {"ok": False, "speech": err_msg, "error": str(e)}
    finally:
        db.close()

@mcp_server.tool()
async def search_notes(query: str, limit: int = 3) -> Dict[str, Any]:
    """
    Search saved notes by keywords.
    Example: query='SQLite'
    """
    start = time.perf_counter()
    db = SessionLocal()
    try:
        res = note_service.search_notes(db, query=query, limit=limit)
        latency = int((time.perf_counter() - start) * 1000)
        await log_tool_execution("search_notes", f"Search notes: {query}", {"query": query, "limit": limit}, res, res["speech"], True, latency, "mcp")
        return res
    except Exception as e:
        latency = int((time.perf_counter() - start) * 1000)
        err_msg = f"Failed to search notes: {str(e)}"
        await log_tool_execution("search_notes", f"Search notes: {query}", {"query": query}, {"error": str(e)}, err_msg, False, latency, "mcp")
        return {"notes": [], "speech": err_msg, "error": str(e)}
    finally:
        db.close()

@mcp_server.tool()
async def recall(question: str) -> Dict[str, Any]:
    """
    Bedrock-grounded recall over saved notes to answer questions.
    Example: question='What did I note about SQLite?'
    """
    start = time.perf_counter()
    db = SessionLocal()
    try:
        res = await note_service.recall_notes(db, question=question)
        latency = int((time.perf_counter() - start) * 1000)
        await log_tool_execution("recall", question, {"question": question}, res, res["speech"], True, latency, "mcp")
        return res
    except Exception as e:
        latency = int((time.perf_counter() - start) * 1000)
        err_msg = f"Recall error: {str(e)}"
        await log_tool_execution("recall", question, {"question": question}, {"error": str(e)}, err_msg, False, latency, "mcp")
        return {"answer": err_msg, "sources": [], "speech": err_msg, "error": str(e)}
    finally:
        db.close()
