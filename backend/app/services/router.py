import re
import time
from typing import Dict, Any, Tuple
from ..db import SessionLocal
from ..services import tasks as task_service
from ..services import notes as note_service
from ..mcp.server import log_tool_execution
from ..events import broadcaster

async def route_and_execute_utterance(utterance: str, source: str = "simulator") -> Dict[str, Any]:
    text = utterance.strip()
    lower = text.lower()
    start_time = time.perf_counter()

    # 1. Intent: Add Task
    # Matches: "add [task] tomorrow", "remind me to [task] at [time]", "new task [task]", "schedule [task]"
    add_match = re.match(r"^(?:add(?:\s+task)?|remind(?:\s+me)?\s+to|create(?:\s+task)?|schedule)\s+(.+)$", lower, re.IGNORECASE)
    if add_match:
        content = add_match.group(1).strip()
        # Look for trailing date indicators (tomorrow, today ..., next ..., oct ..., on ...)
        date_split = re.search(r"\b(tomorrow|today(?:\s+at\s+\d+(?::\d+)?\s*(?:am|pm)?)?|next\s+[a-z]+|by\s+[a-z0-9\s:]+|on\s+[a-z0-9\s:]+)\b", content, re.IGNORECASE)
        
        due = None
        title = content
        if date_split:
            due = date_split.group(0)
            title = content[:date_split.start()].strip()
            # If title is empty or just "by", keep original
            if not title:
                title = content
                due = None

        # Clean trailing prepositions
        title = re.sub(r"\s+(?:by|for|on|due)\s*$", "", title).strip()
        if not title:
            title = content

        title = title[0].upper() + title[1:] if len(title) > 0 else title

        db = SessionLocal()
        try:
            res = task_service.create_task(db, title=title, due=due)
            latency = int((time.perf_counter() - start_time) * 1000)
            await log_tool_execution("add_task", utterance, {"title": title, "due": due}, res, res["speech"], True, latency, source)
            await broadcaster.broadcast("task_created", res)
            return {
                "tool": "add_task",
                "utterance": utterance,
                "args": {"title": title, "due": due},
                "result": res,
                "speech": res["speech"],
                "latency_ms": latency,
                "ok": True
            }
        finally:
            db.close()

    # 2. Intent: Complete / Mark Done
    # Matches: "mark [task] done", "complete [task]", "done with [task]", "check off [task]"
    complete_match = re.match(r"^(?:mark(?:\s+task)?\s+(.+)\s+(?:done|completed|finished)|complete(?:\s+task)?\s+(.+)|done\s+with\s+(.+)|check\s+off\s+(.+))$", lower, re.IGNORECASE)
    if complete_match:
        query = next(g for g in complete_match.groups() if g is not None).strip()
        db = SessionLocal()
        try:
            res = task_service.complete_task(db, query=query)
            latency = int((time.perf_counter() - start_time) * 1000)
            ok = res.get("ok", False)
            await log_tool_execution("complete_task", utterance, {"query": query}, res, res["speech"], ok, latency, source)
            if ok:
                await broadcaster.broadcast("task_completed", res)
            return {
                "tool": "complete_task",
                "utterance": utterance,
                "args": {"query": query},
                "result": res,
                "speech": res["speech"],
                "latency_ms": latency,
                "ok": ok
            }
        finally:
            db.close()

    # 3. Intent: List Tasks
    # Matches: "what's on my list today", "what is due today", "list tasks", "show my tasks"
    if any(p in lower for p in ["list", "what's on my list", "what is on my list", "tasks due", "show tasks", "my tasks"]):
        when = "today" if "today" in lower else ("week" if "week" in lower else "all")
        status = "done" if "completed" in lower or "done" in lower else "open"
        db = SessionLocal()
        try:
            res = task_service.list_tasks(db, status=status, when=when)
            latency = int((time.perf_counter() - start_time) * 1000)
            await log_tool_execution("list_tasks", utterance, {"status": status, "when": when}, res, res["speech"], True, latency, source)
            return {
                "tool": "list_tasks",
                "utterance": utterance,
                "args": {"status": status, "when": when},
                "result": res,
                "speech": res["speech"],
                "latency_ms": latency,
                "ok": True
            }
        finally:
            db.close()

    # 4. Intent: Save Note
    # Matches: "note: ...", "save note ...", "take a note ...", "remember ..."
    note_match = re.match(r"^(?:note(?::|\s+that|\s+to)?|save(?:\s+a)?\s+note(?::)?|take\s+a\s+note(?::)?|remember(?::|\s+that)?)\s+(.+)$", lower, re.IGNORECASE)
    if note_match:
        note_body = note_match.group(1).strip()
        db = SessionLocal()
        try:
            res = note_service.save_note(db, text=note_body)
            latency = int((time.perf_counter() - start_time) * 1000)
            await log_tool_execution("save_note", utterance, {"text": note_body}, res, res["speech"], True, latency, source)
            await broadcaster.broadcast("note_created", res)
            return {
                "tool": "save_note",
                "utterance": utterance,
                "args": {"text": note_body},
                "result": res,
                "speech": res["speech"],
                "latency_ms": latency,
                "ok": True
            }
        finally:
            db.close()

    # 5. Intent: Recall / Search Notes
    # Matches: "what did i note about ...", "what did we decide about ...", "search notes ...", "find note ..."
    search_match = re.match(r"^(?:what\s+did\s+i\s+note\s+about|search(?:\s+my)?\s+notes\s+for|find(?:\s+note)?\s+about)\s+(.+)$", lower, re.IGNORECASE)
    if search_match:
        q = search_match.group(1).strip().rstrip("?").strip()
        db = SessionLocal()
        try:
            res = note_service.search_notes(db, query=q)
            latency = int((time.perf_counter() - start_time) * 1000)
            await log_tool_execution("search_notes", utterance, {"query": q}, res, res["speech"], True, latency, source)
            return {
                "tool": "search_notes",
                "utterance": utterance,
                "args": {"query": q},
                "result": res,
                "speech": res["speech"],
                "latency_ms": latency,
                "ok": True
            }
        finally:
            db.close()

    # 6. Intent: Bedrock Recall for general questions
    # Matches: "what is ...", "what did we ...", "who ...", "how much ..."
    if lower.startswith("what") or lower.startswith("how") or lower.startswith("why") or "?" in text:
        db = SessionLocal()
        try:
            res = await note_service.recall_notes(db, question=text)
            latency = int((time.perf_counter() - start_time) * 1000)
            await log_tool_execution("recall", utterance, {"question": text}, res, res["speech"], True, latency, source)
            return {
                "tool": "recall",
                "utterance": utterance,
                "args": {"question": text},
                "result": res,
                "speech": res["speech"],
                "latency_ms": latency,
                "ok": True
            }
        finally:
            db.close()

    # Fallback: treat as a task creation
    db = SessionLocal()
    try:
        res = task_service.create_task(db, title=text)
        latency = int((time.perf_counter() - start_time) * 1000)
        await log_tool_execution("add_task", utterance, {"title": text}, res, res["speech"], True, latency, source)
        await broadcaster.broadcast("task_created", res)
        return {
            "tool": "add_task",
            "utterance": utterance,
            "args": {"title": text},
            "result": res,
            "speech": res["speech"],
            "latency_ms": latency,
            "ok": True
        }
    finally:
        db.close()
