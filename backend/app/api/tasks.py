from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..db import get_db
from ..models import Task
from ..schemas import TaskOut, TaskCreate, TaskUpdate
from ..services import tasks as task_service
from ..events import broadcaster

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("", response_model=List[TaskOut])
def get_tasks(
    status: Optional[str] = Query(None, description="'open', 'done', or 'all'"),
    when: Optional[str] = Query(None, description="'today', 'week', or 'all'"),
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if status and status in ("open", "done"):
        query = query.filter(Task.status == status)
    
    # Order: open first, by due date asc, then created_at desc
    tasks = query.order_by(Task.status.desc(), Task.due_date.asc().nullslast(), desc(Task.created_at)).all()
    return tasks

@router.post("", response_model=TaskOut)
async def create_task_endpoint(data: TaskCreate, db: Session = Depends(get_db)):
    res = task_service.create_task(
        db,
        title=data.title,
        due=data.due,
        priority=data.priority or "medium",
        due_date=data.due_date,
        due_display=data.due_display
    )
    task = db.query(Task).filter(Task.id == res["id"]).first()
    await broadcaster.broadcast("task_created", {
        "id": task.id,
        "title": task.title,
        "due_display": task.due_display,
        "priority": task.priority,
        "status": task.status
    })
    return task

@router.patch("/{task_id}", response_model=TaskOut)
async def update_task_endpoint(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if data.title is not None:
        task.title = data.title
    if data.due_display is not None:
        task.due_display = data.due_display
    if data.due_date is not None:
        task.due_date = data.due_date
    if data.priority is not None:
        task.priority = data.priority
    if data.status is not None:
        task.status = data.status

    db.commit()
    db.refresh(task)
    await broadcaster.broadcast("task_updated", {
        "id": task.id,
        "title": task.title,
        "status": task.status,
        "due_display": task.due_display
    })
    return task

@router.post("/{task_id}/toggle", response_model=TaskOut)
async def toggle_task_endpoint(task_id: int, db: Session = Depends(get_db)):
    task = task_service.toggle_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await broadcaster.broadcast("task_updated", {
        "id": task.id,
        "title": task.title,
        "status": task.status
    })
    return task

@router.delete("/{task_id}")
async def delete_task_endpoint(task_id: int, db: Session = Depends(get_db)):
    success = task_service.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    await broadcaster.broadcast("task_deleted", {"id": task_id})
    return {"ok": True}
