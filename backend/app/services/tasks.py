from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from rapidfuzz import process, fuzz

from ..models import Task
from .dates import parse_natural_date

def create_task(
    db: Session,
    title: str,
    due: Optional[str] = None,
    priority: str = "medium",
    due_date: Optional[datetime] = None,
    due_display: Optional[str] = None
) -> Dict[str, Any]:
    # Check for duplicate idempotency (same title within 30s)
    now = datetime.now(timezone.utc)
    recent_dup = db.query(Task).filter(
        Task.title == title,
        Task.created_at >= now - timedelta(seconds=30)
    ).first()
    if recent_dup:
        return {
            "id": recent_dup.id,
            "title": recent_dup.title,
            "due_date": recent_dup.due_date.isoformat() if recent_dup.due_date else None,
            "due_display": recent_dup.due_display,
            "priority": recent_dup.priority,
            "status": recent_dup.status,
            "speech": f"Task '{recent_dup.title}' is already on your list."
        }

    parsed_dt = due_date
    parsed_display = due_display
    if due and not parsed_dt:
        parsed_dt, parsed_display = parse_natural_date(due)

    # Infer priority from title keywords if not explicitly high
    lower_title = title.lower()
    if any(k in lower_title for k in ["urgent", "asap", "critical", "bank", "demo"]):
        if priority == "medium":
            priority = "high"

    task = Task(
        title=title,
        due_date=parsed_dt,
        due_display=parsed_display or "",
        priority=priority or "medium",
        status="open",
        created_at=now
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    speech_due = f", due {parsed_display}" if parsed_display else ""
    speech = f"Added: {task.title}{speech_due}."

    return {
        "id": task.id,
        "title": task.title,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "due_display": task.due_display,
        "priority": task.priority,
        "status": task.status,
        "speech": speech
    }

def list_tasks(
    db: Session,
    status: str = "open",
    when: str = "all"
) -> Dict[str, Any]:
    query = db.query(Task)
    if status in ("open", "done"):
        query = query.filter(Task.status == status)

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_start = today_start + timedelta(days=1)
    week_end = today_start + timedelta(days=7)

    if when == "today":
        query = query.filter(Task.due_date >= today_start, Task.due_date < tomorrow_start)
    elif when == "week":
        query = query.filter(Task.due_date >= today_start, Task.due_date < week_end)

    tasks = query.order_by(Task.due_date.asc().nullslast(), desc(Task.created_at)).all()

    tasks_data = [
        {
            "id": t.id,
            "title": t.title,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "due_display": t.due_display,
            "priority": t.priority,
            "status": t.status,
            "created_at": t.created_at.isoformat()
        }
        for t in tasks
    ]

    count = len(tasks)
    if count == 0:
        speech = "You have no tasks matching that criteria."
    elif when == "today":
        first_titles = ", ".join(t["title"] for t in tasks_data[:3])
        speech = f"You have {count} task{'s' if count != 1 else ''} due today: {first_titles}."
    else:
        speech = f"You have {count} {status} task{'s' if count != 1 else ''}."

    return {
        "tasks": tasks_data,
        "count": count,
        "speech": speech
    }

def complete_task(
    db: Session,
    query: Optional[str] = None,
    task_id: Optional[int] = None
) -> Dict[str, Any]:
    if task_id:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return {"ok": False, "speech": f"Could not find task #{task_id}."}
        task.status = "done"
        task.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(task)
        return {
            "id": task.id,
            "title": task.title,
            "status": "done",
            "ok": True,
            "speech": f"Marked '{task.title}' as completed."
        }

    if not query or not query.strip():
        return {"ok": False, "speech": "Please specify which task to mark complete."}

    # Fuzzy match on open tasks using rapidfuzz
    open_tasks = db.query(Task).filter(Task.status == "open").all()
    if not open_tasks:
        return {"ok": False, "speech": "There are no open tasks to complete."}

    titles = {t.title: t for t in open_tasks}
    matches = process.extract(
        query.strip(),
        list(titles.keys()),
        scorer=fuzz.token_set_ratio,
        limit=3
    )

    # Filter strong matches (score >= 65)
    strong_matches = [m for m in matches if m[1] >= 65]
    if not strong_matches:
        # Fallback to substring matching
        sub_matches = [t for t in open_tasks if query.lower() in t.title.lower()]
        if len(sub_matches) == 1:
            target = sub_matches[0]
            target.status = "done"
            target.completed_at = datetime.now(timezone.utc)
            db.commit()
            return {
                "id": target.id,
                "title": target.title,
                "status": "done",
                "ok": True,
                "speech": f"Marked '{target.title}' as completed."
            }
        return {
            "ok": False,
            "speech": f"Could not find an open task matching '{query}'."
        }

    # If top match is decisively better (score difference >= 15 or score >= 90)
    top_title, top_score, _ = strong_matches[0]
    if len(strong_matches) == 1 or top_score >= 90 or (len(strong_matches) > 1 and top_score - strong_matches[1][1] >= 15):
        target = titles[top_title]
        target.status = "done"
        target.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(target)
        return {
            "id": target.id,
            "title": target.title,
            "status": "done",
            "ok": True,
            "speech": f"Marked '{target.title}' as completed."
        }

    # Ambiguous matches: ask user to clarify
    candidates = [m[0] for m in strong_matches]
    speech = f"I found multiple matches: {', '.join(candidates)}. Which one did you mean?"
    return {
        "ok": False,
        "ambiguous": True,
        "candidates": candidates,
        "speech": speech
    }

def toggle_task(db: Session, task_id: int) -> Optional[Task]:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return None
    if task.status == "open":
        task.status = "done"
        task.completed_at = datetime.now(timezone.utc)
    else:
        task.status = "open"
        task.completed_at = None
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int) -> bool:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
