from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..db import get_db
from ..models import Note
from ..schemas import NoteOut, NoteCreate
from ..services import notes as note_service
from ..events import broadcaster

router = APIRouter(prefix="/api/notes", tags=["notes"])

@router.get("", response_model=List[NoteOut])
def get_notes(
    q: Optional[str] = Query(None, description="Search query"),
    db: Session = Depends(get_db)
):
    query = db.query(Note)
    if q and q.strip():
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            (Note.text.ilike(search_pattern)) |
            (Note.title.ilike(search_pattern)) |
            (Note.tags.ilike(search_pattern))
        )
    return query.order_by(desc(Note.created_at)).all()

@router.post("", response_model=NoteOut)
async def create_note_endpoint(data: NoteCreate, db: Session = Depends(get_db)):
    res = note_service.save_note(
        db,
        text=data.text,
        tags=data.tags,
        title=data.title
    )
    note = db.query(Note).filter(Note.id == res["id"]).first()
    await broadcaster.broadcast("note_created", {
        "id": note.id,
        "title": note.title,
        "text": note.text
    })
    return note

@router.post("/recall")
async def recall_notes_endpoint(payload: dict = Body(...), db: Session = Depends(get_db)):
    question = payload.get("question", "")
    return await note_service.recall_notes(db, question=question)

@router.delete("/{note_id}")
async def delete_note_endpoint(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if note:
        db.delete(note)
        db.commit()
        await broadcaster.broadcast("note_deleted", {"id": note_id})
    return {"ok": True}
