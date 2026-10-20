from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..models import Note
from .bedrock import answer_with_bedrock

def save_note(
    db: Session,
    text: str,
    tags: Optional[List[str] | str] = None,
    title: Optional[str] = None
) -> Dict[str, Any]:
    text = text.strip()
    
    # Auto-generate title if not provided (first 5-7 words)
    if not title:
        words = text.split()
        title = " ".join(words[:6])
        if len(words) > 6:
            title += "..."

    # Format tags as comma-separated string
    tags_str = ""
    if isinstance(tags, list):
        tags_str = ",".join(tags)
    elif isinstance(tags, str):
        tags_str = tags

    note = Note(
        title=title,
        text=text,
        tags=tags_str,
        summary=text[:140] + ("..." if len(text) > 140 else ""),
        created_at=datetime.now(timezone.utc)
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return {
        "id": note.id,
        "title": note.title,
        "text": note.text,
        "tags": [t.strip() for t in note.tags.split(",") if t.strip()] if note.tags else [],
        "speech": f"Saved note: {note.title}."
    }

def list_notes(
    db: Session,
    query: Optional[str] = None,
    limit: int = 20
) -> List[Dict[str, Any]]:
    q = db.query(Note)
    if query and query.strip():
        search_pattern = f"%{query.strip()}%"
        q = q.filter((Note.text.ilike(search_pattern)) | (Note.title.ilike(search_pattern)) | (Note.tags.ilike(search_pattern)))

    notes = q.order_by(desc(Note.created_at)).limit(limit).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "text": n.text,
            "tags": [t.strip() for t in n.tags.split(",") if t.strip()] if n.tags else [],
            "summary": n.summary,
            "created_at": n.created_at.isoformat()
        }
        for n in notes
    ]

def search_notes(
    db: Session,
    query: str,
    limit: int = 3
) -> Dict[str, Any]:
    if not query or not query.strip():
        return {"notes": [], "matches": 0, "speech": "Please specify what you would like to search for."}

    terms = query.lower().split()
    all_notes = db.query(Note).order_by(desc(Note.created_at)).all()

    # Simple rank scoring based on keyword frequency in title, text, tags
    scored_notes = []
    for n in all_notes:
        score = 0
        t_low = n.title.lower()
        body_low = n.text.lower()
        tags_low = (n.tags or "").lower()

        for term in terms:
            if term in t_low:
                score += 5
            if term in tags_low:
                score += 4
            if term in body_low:
                score += 2
        if score > 0:
            scored_notes.append((score, n))

    scored_notes.sort(key=lambda x: x[0], reverse=True)
    top_matches = [n for _, n in scored_notes[:limit]]

    if not top_matches:
        return {
            "notes": [],
            "matches": 0,
            "speech": f"I couldn't find any notes matching '{query}'."
        }

    results = [
        {
            "id": n.id,
            "title": n.title,
            "text": n.text,
            "tags": [t.strip() for t in n.tags.split(",") if t.strip()] if n.tags else [],
            "summary": n.summary,
            "created_at": n.created_at.isoformat()
        }
        for n in top_matches
    ]

    first_note = top_matches[0]
    speech = f"Found {len(top_matches)} note{'s' if len(top_matches) > 1 else ''}: {first_note.title}. {first_note.text[:100]}"
    if len(first_note.text) > 100:
        speech += "..."

    return {
        "notes": results,
        "matches": len(top_matches),
        "speech": speech
    }

async def recall_notes(
    db: Session,
    question: str
) -> Dict[str, Any]:
    """
    Bedrock-grounded QA over saved notes.
    """
    search_res = search_notes(db, question, limit=5)
    notes = search_res.get("notes", [])

    if not notes:
        return {
            "answer": "No relevant notes were found to answer your question.",
            "sources": [],
            "speech": "I couldn't find any relevant notes to answer that."
        }

    # Format context for Bedrock
    notes_context = [
        {"id": n["id"], "title": n["title"], "text": n["text"]}
        for n in notes
    ]

    answer, sources, speech = await answer_with_bedrock(question, notes_context)

    return {
        "answer": answer,
        "sources": sources,
        "speech": speech
    }
